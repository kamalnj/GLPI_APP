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
        return Computer::whereHas('vulnerabilities')->count();
    }
    public function getCountComputersWithoutSophos()
    {
        return Computer::whereDoesntHave('antiviruses', function ($query) {
            $query->where('name', 'Sophos');
        })->count();
    }
    public function getAllComputersByGroupe()
    {
        return Computer::query()
            ->select('groupe', DB::raw('COUNT(*) as total'))
            ->groupBy('groupe')
            ->pluck('total', 'groupe');
    }

    public function getAllComputerswithVulnerabilities()
    {
        return Computer::withCount('vulnerabilities')
            ->pluck('vulnerabilities_count', 'name');
    }
}
