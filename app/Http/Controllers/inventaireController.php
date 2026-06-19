<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventaire\ListComputersRequest;
use App\Services\Inventaire\ComputerInventoryService;
use App\Services\Inventaire\StatsInventaire;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;


class InventaireController extends Controller
{
    public function index(ListComputersRequest $request, ComputerInventoryService $service, StatsInventaire $statsInventaire): Response
    {

        $computers = $service->paginate(
            $request->search(),
            $request->missingSophos(),
            $request->cpuTier(),
            $request->group(),
            $request->perPage()
        );

        // Cache basic stats for 30 minutes
        $totalComputers = Cache::remember('stats_total_computers', 1800, fn() => $statsInventaire->getCountComputers());
        $vulnerableComputers = Cache::remember('stats_vulnerable_computers', 1800, fn() => $statsInventaire->getCountComputersVulnerable());
        $withoutSophos = Cache::remember('stats_without_sophos', 1800, fn() => $statsInventaire->getCountComputersWithoutSophos());
        $computersByGroup = Cache::remember('stats_computers_by_group', 1800, fn() => $statsInventaire->getAllComputersByGroupe());

        $stats = [
            'totalComputers' => $totalComputers,
            'vulnerableComputers' => $vulnerableComputers,
            'withoutSophos' => $withoutSophos,
            'computersByGroup' => $computersByGroup,
            'computersWithVulnerabilities' => Inertia::defer(fn() => $statsInventaire->getAllComputerswithVulnerabilities()),
        ];

        return Inertia::render('Inventaire/Index', [
            'computers' => $computers,
            'filters' => [
                'search' => $request->search(),
                'perPage' => $request->perPage(),
                'cpu_tier' => $request->cpuTier(),
                'missing_sophos' => $request->missingSophos(),
                'group' => $request->group(),

            ],
            'cpuTierOptions' => Cache::rememberForever('cpu_tier_options', fn() => $service->cpuTierOptions()),
            'groupOptions' => Cache::rememberForever('group_options', fn() => $service->groupOptions()),
            'stats' => $stats,

        ]);
    }
}
