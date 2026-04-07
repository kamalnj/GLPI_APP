<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WazuhIndexerService;
use App\Models\Agents;
use App\Models\Vulnerabilite;
use App\Models\AgentVulne;
use Carbon\Carbon;

class WazuhInitialImport extends Command
{
    protected $signature = 'wazuh:initial-import';

    protected $description = 'Initial import of vulnerabilities from Wazuh indexer';

    public function handle()
    {

        $service = new WazuhIndexerService();

        $scrollId = null;

        do {

            $result = $service->initialScroll($scrollId);

            $scrollId = $result['_scroll_id'] ?? null;

            $hits = $result['hits']['hits'] ?? [];

         foreach ($hits as $hit) {

    $data = $hit['_source'];

    $wazuhAgentId = ltrim($data['agent']['id'], '0');

    $agent = Agents::where('wazuh_agent_id', $wazuhAgentId)->first();

    if (!$agent) {
        $this->warn("Agent not found: " . $wazuhAgentId);
        continue;
    }

    $cve = $data['vulnerability']['id'] ?? null;

    if (!$cve) {
        continue;
    }

    $vuln = Vulnerabilite::updateOrCreate(
        ['cve' => $cve],
        [
            'severity' => $data['vulnerability']['severity'] ?? null,
            'score' => $data['vulnerability']['score']['base'] ?? null,
            'description' => $data['vulnerability']['description'] ?? null
        ]
    );

    AgentVulne::updateOrCreate(
        [
            'agent_id' => $agent->id,
            'vulnerability_id' => $vuln->id
        ],
        [
            'package' => $data['package']['name'] ?? null,
            'package_version' => $data['package']['version'] ?? null,
            'detected_at' => isset($data['vulnerability']['detected_at']) 
                ? Carbon::parse($data['vulnerability']['detected_at'])->format('Y-m-d H:i:s') 
                : now(),
        ]
    );

}

            $this->info("Batch processed : " . count($hits));

        } while (!empty($hits));

        $this->info("Initial import finished");
    }
}