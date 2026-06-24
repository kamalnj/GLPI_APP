<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\CollaboratorsStats;
use App\Services\Dashboard\GroupsStats;
use App\Services\Dashboard\MaterialInventory;
use App\Services\Dashboard\SoftwareInventory;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected MaterialInventory $materialInventory,
        protected SoftwareInventory $softwareInventory,
        protected GroupsStats $groupsStats,
        protected CollaboratorsStats $collaboratorsStats
    ) {}

    /**
     * Get dashboard view with all material inventory data
     * Uses Inertia::defer() to defer expensive queries and avoid frontend freezing
     */
    public function index(): Response
    {
        return Inertia::render('Dashboard/Index', [
            'total_machines' => $this->materialInventory->totalMachine(),
            'different_models_count' => $this->materialInventory->numberOfDifferentModels(),
            'top_model' => $this->materialInventory->topModel(),
            'models_distribution' => Inertia::defer(fn () => $this->materialInventory->modelRepartitionTop10()),
            'ram_distribution' => Inertia::defer(fn () => $this->materialInventory->ramByNumberOfDevices()),
            'software_stats' => Inertia::defer(fn () => $this->softwareInventory->getSoftwareStats()),
            'groups_stats' => Inertia::defer(fn () => $this->groupsStats->getGroupsStatsAll()),
            'collaborators_stats' => Inertia::defer(fn () => $this->collaboratorsStats->getCollaboratorsStatsAll()),
        ]);
    }

    /**
     * Refresh dashboard caches (for manual cache clearing if needed)
     */
    public function refreshCache()
    {
        $this->materialInventory->clearCache();
        $this->softwareInventory->clearCache();
        $this->groupsStats->clearCache();
        $this->collaboratorsStats->clearCache();

        return response()->json([
            'message' => 'Dashboard cache cleared successfully',
            'timestamp' => now(),
        ]);
    }
}
