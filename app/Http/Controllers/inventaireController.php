<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventaire\ListComputersRequest;
use App\Services\Inventaire\ComputerInventoryService;
use App\Services\Inventaire\StatsInventaire;
use Inertia\Inertia;
use Inertia\Response;


class inventaireController extends Controller
{
    public function index(ListComputersRequest $request, ComputerInventoryService $service , StatsInventaire $statsInventaire): Response
    {

        $computers = $service->paginate(
            $request->search(),
            $request->missingSophos(),
            $request->cpuTier(),
            $request->group(),
            $request->perPage()
        );
        $stats = [
            'totalComputers' => $statsInventaire->getCountComputers(),
            'vulnerableComputers' => $statsInventaire->getCountComputersVulnerable(),
            'withoutSophos' => $statsInventaire->getCountComputersWithoutSophos(),
            'computersByGroup' => $statsInventaire->getAllComputersByGroupe(),
            'computersWithVulnerabilities' => $statsInventaire->getAllComputerswithVulnerabilities(),
        ];

        return Inertia::render('Inventaire/Index', [
            'computers' => $computers,
            'filters' => [
                'search' => $request->search(),
                'perPage' => $request->perPage(),
                'cpu_tier' => $request->cpuTier(),
                'missing_sophos' => $request->missingSophos(),
                'group'=> $request->group(),

            ],
            'cpuTierOptions' => $service->cpuTierOptions(),
            'groupOptions' =>$service->groupOptions(),

        ]);
    }
}
