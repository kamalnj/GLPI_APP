<?php

namespace App\Console\Commands;

use App\Models\Agents;
use App\Models\Computer;
use Illuminate\Console\Command;

class LinkComputersToAgents extends Command
{
    protected $signature = 'wazuh:link-computers';

    public function handle()
    {

        $agents = Agents::all();

        foreach ($agents as $agent) {

            $computer = Computer::where('name', $agent->name)->first();

            if (! $computer) {
                $this->warn('Computer not found: '.$agent->name);

                continue;
            }

            $computer->update([
                'wazuh_agent_id' => $agent->wazuh_agent_id,
            ]);

            $this->info("Linked {$agent->name}");
        }

        $this->info('Linking finished');
    }
}
