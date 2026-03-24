<?php

namespace App\Http\Controllers;

use App\Services\Alertes\AlertService;
use Inertia\Inertia;
use Inertia\Response;

class alertesController extends Controller
{
    public function __construct(protected AlertService $alertService) {}

    public function index(): Response
    {
        return Inertia::render('Alertes/Index', [
              'ramAlerts'  => Inertia::defer(fn() => $this->alertService->getRamAlerts()),
            'diskAlerts' => Inertia::defer(fn() => $this->alertService->getDiskAlerts()),
            'patchWindowsAlerts' => Inertia::defer(fn() => $this->alertService->getPatchWindowsAlerts()),
        ]);
    }
}