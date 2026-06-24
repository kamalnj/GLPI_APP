<?php

namespace App\Console\Commands;

use App\Models\Agents;
use App\Models\AgentVulne;
use App\Models\Vulnerabilite;
use App\Services\WazuhIndexerService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class WazuhInitialImport extends Command
{
    protected $signature = 'wazuh:initial-import';

    protected $description = 'Initial import of vulnerabilities from Wazuh indexer';

    public function handle()
    {
        $service = new WazuhIndexerService;

        $scrollId = null;

        $total = 0;

        do {

            $result = $service->initialScroll($scrollId);

            $scrollId = $result['_scroll_id'] ?? null;

            $hits = $result['hits']['hits'] ?? [];

            foreach ($hits as $hit) {

                $data = $hit['_source'];

                $wazuhAgentId = ltrim($data['agent']['id'], '0');

                $agent = Agents::where('wazuh_agent_id', $wazuhAgentId)->first();

                if (! $agent) {
                    $this->warn("Agent not found: {$wazuhAgentId}");

                    continue;
                }

                $cve = $data['vulnerability']['id'] ?? null;

                if (! $cve) {
                    continue;
                }

                $vuln = Vulnerabilite::updateOrCreate(
                    ['cve' => $cve],
                    [
                        'severity' => $data['vulnerability']['severity'] ?? null,
                        'score' => $data['vulnerability']['score']['base'] ?? null,
                        'description' => $data['vulnerability']['description'] ?? null,
                    ]
                );

                AgentVulne::updateOrCreate(
                    [
                        'agent_id' => $agent->id,
                        'vulnerability_id' => $vuln->id,
                    ],
                    [
                        'package' => $data['package']['name'] ?? null,
                        'package_version' => $data['package']['version'] ?? null,
                        'detected_at' => isset($data['vulnerability']['detected_at'])
                            ? Carbon::parse($data['vulnerability']['detected_at'])
                            : now(),

                        /**
                         * IMPORTANT:
                         * Initial import = on initialise last_seen_at
                         * mais on NE gère PAS resolved ici
                         */
                        'last_seen_at' => now(),
                        'active' => true,
                    ]
                );

                $total++;
            }

            $this->info('Batch processed: '.count($hits));
        } while (! empty($hits));

        $this->info('Initial import finished');
        $this->info("Total imported: {$total}");
    }
}
