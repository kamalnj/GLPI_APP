<?php

namespace App\Console\Commands;

use App\Models\Agents;
use App\Services\WazuhApiService;
use Illuminate\Console\Command;

class SyncWazuhAgents extends Command
{
    protected $signature = 'wazuh:sync-agents';

    public function handle()
    {

        $service = new WazuhApiService;

        $agents = $service->getAgents();

        foreach ($agents as $agent) {

            Agents::updateOrCreate(
                ['wazuh_agent_id' => $agent['id']],
                [
                    'name' => $agent['name'] ?? null,
                    'ip' => $agent['ip'] ?? null,
                    'os' => $agent['os']['name'] ?? null,
                    'synced_at' => now(),
                ]
            );
        }

        $this->info('Agents synced');
    }
}
