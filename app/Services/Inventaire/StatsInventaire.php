<?php

namespace App\Services\Inventaire;

use App\Models\Computer;
use Illuminate\Support\Facades\DB;

class StatsInventaire
{
    public function getCountComputers()
    {
        return Computer::count();
    }

    public function getCountComputersVulnerable()
    {
        return Computer::whereHas('vulnerabilities', function ($q) {
            $q->where('agent_vulnerabilities.active', true);
        })->count();
    }

    public function getCountComputersWithoutSophos()
    {
        return Computer::whereDoesntHave('antiviruses', function ($query) {
            $query->where('name', 'like', '%Sophos%');
        })->count();
    }

    public function getAllComputersByGroupe()
    {
        // Use raw COUNT for efficiency
        return Computer::query()
            ->select('groupe', DB::raw('COUNT(*) as total'))
            ->groupBy('groupe')
            ->pluck('total', 'groupe')
            ->toArray();
    }

    public function getAllComputerswithVulnerabilities()
    {
        // Get computers with vulnerabilities through their agent
        return Computer::selectRaw('computers.name, COUNT(vulnerabilities.id) as vulnerabilities_count')
            ->join('agents', 'computers.wazuh_agent_id', '=', 'agents.wazuh_agent_id')
            ->join('agent_vulnerabilities', 'agents.id', '=', 'agent_vulnerabilities.agent_id')
            ->join('vulnerabilities', 'agent_vulnerabilities.vulnerability_id', '=', 'vulnerabilities.id')
            ->groupBy('computers.id', 'computers.name')
            ->havingRaw('COUNT(vulnerabilities.id) > 0')
            ->pluck('vulnerabilities_count', 'name')
            ->toArray();
    }
}
