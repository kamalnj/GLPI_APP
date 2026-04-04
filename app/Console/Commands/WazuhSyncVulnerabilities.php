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
        $lastSync = $this->getLastSyncDate();
        $this->info("Syncing since: {$lastSync}");

        $hits = $service->incremental($lastSync)['hits']['hits'] ?? [];

        if (empty($hits)) {
            $this->warn('No new vulnerabilities found.');
            return self::SUCCESS;
        }

        $this->info('Found ' . count($hits) . ' hits. Processing...');

        [$synced, $skipped] = $this->processHits($hits);

        $this->info("Done — Synced: {$synced} | Skipped: {$skipped}");

        return self::SUCCESS;
    }

    // -------------------------------------------------------------------------

    private function getLastSyncDate(): string
    {
        $last = AgentVulne::max('detected_at');

        return $last
            ? Carbon::parse($last)->toIso8601String()
            : '2026-03-30T00:00:00Z';
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
            ['cve' => $data['vulnerability']['cve']],
            [
                'severity'    => $data['vulnerability']['severity']      ?? null,
                'score'       => $data['vulnerability']['cvss']['score'] ?? null,
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
                'detected_at'     => Carbon::parse($data['detected_at'])->toDateTimeString(),
            ]
        );

        return true;
    }
}