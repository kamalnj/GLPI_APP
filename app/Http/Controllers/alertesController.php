<?php

namespace App\Http\Controllers;

use App\Services\Alertes\AlertStatsService;
use App\Services\Alertes\AlertService;
use Inertia\Inertia;
use Inertia\Response;

class alertesController extends Controller
{
    public function __construct(protected AlertService $alertService, protected AlertStatsService $alertStatsService) {}

    public function index(): Response
    {
        $stats = $this->alertStatsService->getAllStats();

        return Inertia::render('Alertes/Index', [
            'ramAlerts'  => Inertia::defer(fn() => $this->alertService->getRamAlerts()),
            'diskAlerts' => Inertia::defer(fn() => $this->alertService->getDiskAlerts()),
            'patchWindowsAlerts' => Inertia::defer(fn() => $this->alertService->getPatchWindowsAlerts()),
            'outDateInventoryAlerts' => Inertia::defer(fn() => $this->alertService->getComputersWithoutInventoryUpdate()),
            'ramStats'              => $stats['ramStats'],
            'diskStats'             => $stats['diskStats'],
            'patchStats'            => $stats['patchStats'],
            'outDateInventoryStats' => $stats['outDateInventoryStats'],
            'kpiStats'              => $stats['kpiStats'],
        ]);
    }
}
