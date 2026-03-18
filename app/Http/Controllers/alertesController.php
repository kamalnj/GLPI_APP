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
            'ramAlerts'  => $this->alertService->getRamAlerts(),
            'diskAlerts' => $this->alertService->getDiskAlerts(),
        ]);
    }
}