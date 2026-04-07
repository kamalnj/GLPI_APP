<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WazuhIndexerService;
use App\Models\AgentVulne;
use App\Models\Agents;
use App\Models\Vulnerabilite;
use Carbon\Carbon;

class WazuhSyncVulnerabilities extends Command
{
    protected $signature   = 'wazuh:sync-vulns';
    protected $description = 'Incrementally sync vulnerabilities from Wazuh Indexer';

    public function handle(WazuhIndexerService $service)
    {
        $this->info('=== Testing Wazuh Connection ===' );
        $this->line('Fetching sample document to inspect structure...');
        
        $lastSync = $this->getLastSyncDate();
        
        // Test: récupérer 1 document pour voir la structure
        $testResult = $service->testSample($lastSync);
        
        if (!empty($testResult['hits']['hits'])) {
            $doc = $testResult['hits']['hits'][0]['_source'];
            $this->info('✓ Sample document found!');
            $this->line('Fields: ' . implode(', ', array_keys($doc)));
            $this->line('vulnerability.detected_at: ' . ($doc['vulnerability']['detected_at'] ?? 'NOT FOUND'));
            if (isset($doc['vulnerability']['detected_at'])) {
                $this->line('Format sample: ' . $doc['vulnerability']['detected_at']);
            }
        } else {
            $this->error('✗ No documents found in Wazuh index!');
            return self::FAILURE;
        }
        
        $this->line('');
        $this->info("Syncing since: {$lastSync}");

        $scrollId = null;
        $pageNum = 0;
        $totalSynced = 0;
        $totalSkipped = 0;

        // Première requête avec scroll
        $response = $service->incremental($lastSync);
        
        // Vérifier les erreurs
        if (isset($response['error'])) {
            $this->error('Wazuh API Error:');
            $this->error(json_encode($response['error'], JSON_PRETTY_PRINT));
            return self::FAILURE;
        }
        
        if (!isset($response['hits'])) {
            $this->error('Unexpected response format.');
            return self::FAILURE;
        }
        
        $totalHits = $response['hits']['total']['value'] ?? 0;
        $this->line("Total vulnerabilities to sync: {$totalHits}");
        
        $hits = $response['hits']['hits'] ?? [];
        $scrollId = $response['_scroll_id'] ?? null;
        $pageNum++;
        
        // Traiter la première page
        if (!empty($hits)) {
            [$synced, $skipped] = $this->processHits($hits);
            $totalSynced += $synced;
            $totalSkipped += $skipped;
            $this->line("Page {$pageNum}: Processed " . count($hits) . " hits (synced: {$totalSynced}, skipped: {$totalSkipped})");
        }

        // Continuer le scroll si nécessaire
        while ($scrollId && count($hits) > 0) {
            // Délai plus long pour laisser Elasticsearch se remettre
            usleep(500000); // 500ms
            
            $scrollResponse = $service->scroll($scrollId);
            
            if (isset($scrollResponse['error'])) {
                // Circuit breaker: on sauvegarde le progrès et on quitte gracieusement
                $this->warn('Elasticsearch circuit breaker triggered. Stopping here.');
                $this->warn('Already synced: ' . $totalSynced . ' vulnerabilities');
                break;
            }
            
            $hits = $scrollResponse['hits']['hits'] ?? [];
            $scrollId = $scrollResponse['_scroll_id'] ?? null;
            $pageNum++;
            
            if (!empty($hits)) {
                [$synced, $skipped] = $this->processHits($hits);
                $totalSynced += $synced;
                $totalSkipped += $skipped;
                $this->line("Page {$pageNum}: Processed " . count($hits) . " hits (synced: {$totalSynced}, skipped: {$totalSkipped})");
            }
        }

        $this->info("Done — Synced: {$totalSynced} | Skipped: {$totalSkipped}");

        return self::SUCCESS;
    }

    // -------------------------------------------------------------------------

    private function getLastSyncDate(): string
    {
        $last = AgentVulne::max('detected_at');

        if ($last) {
            // Format: Y-m-d H:i:s, convert to ISO 8601 Zulu (Z = UTC)
            $carbon = Carbon::createFromFormat('Y-m-d H:i:s', $last, 'UTC');
            $zulu = $carbon->toIso8601ZuluString();
            $this->line('Last sync found: ' . $last . ' => ' . $zulu);
            return $zulu;
        }
        
        // Default to 30 days ago to catch all vulnerabilities
        $default = Carbon::now('UTC')->subDays(30)->toIso8601ZuluString();
        $this->line('No last sync found, using default: ' . $default);
        return $default;
    }

    private function processHits(array $hits): array
    {
        $synced  = 0;
        $skipped = 0;

        foreach ($hits as $hit) {
            $this->processHit($hit['_source'])
                ? $synced++
                : $skipped++;
        }

        return [$synced, $skipped];
    }

    private function processHit(array $data): bool
    {
        $agent = Agents::where('wazuh_agent_id', $data['agent']['id'])->first();

        if (!$agent) {
            $this->warn("Agent not found: {$data['agent']['id']}");
            return false;
        }

        $vuln = Vulnerabilite::updateOrCreate(
            ['cve' => $data['vulnerability']['id']],
            [
                'severity'    => $data['vulnerability']['severity']      ?? null,
                'score'       => $data['vulnerability']['score']['base'] ?? null,
                'description' => $data['vulnerability']['description']   ?? null,
            ]
        );

        AgentVulne::updateOrCreate(
            [
                'agent_id'         => $agent->id,
                'vulnerability_id' => $vuln->id,
            ],
            [
                'package'         => $data['package']['name']    ?? null,
                'package_version' => $data['package']['version'] ?? null,
                'detected_at'     => Carbon::parse($data['vulnerability']['detected_at'])->format('Y-m-d H:i:s'),
            ]
        );

        return true;
    }
}