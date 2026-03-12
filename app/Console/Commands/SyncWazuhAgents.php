<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WazuhApiService;
use App\Models\Agents;

class SyncWazuhAgents extends Command
{

    protected $signature='wazuh:sync-agents';

    public function handle()
    {

        $service=new WazuhApiService();

        $agents=$service->getAgents();

        foreach($agents as $agent){

            Agents::updateOrCreate(
                ['wazuh_agent_id'=>$agent['id']],
                [
                    'name'=>$agent['name'] ?? null,
                    'ip'=>$agent['ip'] ?? null,
                    'os'=>$agent['os']['name'] ?? null,
                    'synced_at'=>now()
                ]
            );

        }

        $this->info("Agents synced");

    }
}