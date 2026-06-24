<?php

namespace App\Http\Controllers;

use App\Exports\InventaireExport;
use App\Exports\PatchExport;
use App\Exports\VolumesExport;
use App\Services\Alertes\AlertService;
use App\Services\Alertes\AlertStatsService;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class AlertesController extends Controller
{
    public function __construct(protected AlertService $alertService, protected AlertStatsService $alertStatsService) {}

    public function exportDisque()
    {
        $filename = sprintf(
            'DisqueDur_ALL_%s.xlsx',
            now()->format('Y-m-d_His')
        );

        return Excel::download(
            new VolumesExport,
            $filename
        );
    }

    public function exportPatch()
    {
        $filename = sprintf(
            'Patches_Securite_ALL_%s.xlsx',
            now()->format('Y-m-d_His')
        );

        return Excel::download(
            new PatchExport,
            $filename
        );
    }

    public function exportInventory()
    {
        $filename = sprintf(
            'Inventaire_ALL_%s.xlsx',
            now()->format('Y-m-d_His')
        );

        return Excel::download(
            new InventaireExport,
            $filename
        );
    }

    public function index(): Response
    {
        $stats = $this->alertStatsService->getAllStats();

        return Inertia::render('Alertes/Index', [
            'diskAlerts' => Inertia::defer(fn () => $this->alertService->getDiskAlerts()),
            'patchWindowsAlerts' => Inertia::defer(fn () => $this->alertService->getPatchWindowsAlerts()),
            'outDateInventoryAlerts' => Inertia::defer(fn () => $this->alertService->getComputersWithoutInventoryUpdate()),
            'diskStats' => $stats['diskStats'],
            'patchStats' => $stats['patchStats'],
            'outDateInventoryStats' => $stats['outOfDateInventoryStats'],
            'kpiStats' => $stats['kpiStats'],
        ]);
    }
}
