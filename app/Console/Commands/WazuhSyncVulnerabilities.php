<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WazuhIndexerService;
use App\Models\AgentVulne;
use App\Models\Agents;
use App\Models\Vulnerabilite;

class WazuhSyncVulnerabilities extends Command
{

    protected $signature='wazuh:sync-vulns';

    public function handle()
    {

        $lastSync=AgentVulne::max('detected_at') ?? '2025-01-01';

        $service=new WazuhIndexerService();

        $result=$service->incremental($lastSync);

        $hits=$result['hits']['hits'];

        foreach($hits as $hit){

            $data=$hit['_source'];

            $agent=Agents::where(
                'wazuh_agent_id',
                $data['agent']['id']
            )->first();

            if(!$agent) continue;

            $vuln=Vulnerabilite::updateOrCreate(
                ['cve'=>$data['vulnerability']['cve']],
                [
                    'severity'=>$data['vulnerability']['severity'],
                    'score'=>$data['vulnerability']['cvss']['score'] ?? null,
                    'description'=>$data['vulnerability']['description'] ?? null
                ]
            );

            AgentVulne::updateOrCreate(
                [
                    'agent_id'=>$agent->id,
                    'vulnerability_id'=>$vuln->id
                ],
                [
                    'package'=>$data['package']['name'] ?? null,
                    'package_version'=>$data['package']['version'] ?? null,
                    'detected_at'=>$data['detected_at']
                ]
            );

        }

        $this->info("Incremental sync done");

    }
}