<?php

namespace App\Http\Controllers;

use App\Services\Alertes\AlertService;

class AlertesController extends Controller
{
    protected AlertService $alertService;

    public function __construct(AlertService $alertService)
    {
        $this->alertService = $alertService;
    }

    public function index()
    {
        $ramAlerts = $this->alertService->getRamAlerts();
        $diskAlerts = $this->alertService->getDiskAlerts();

        return inertia('Inventaire/Alertes', [
            'alerts' => [
                'supervision' => [
                    'title' => 'Supervision',
                    'items' => [
                        [
                            'name' => 'Alertes RAM',
                            'count' => $ramAlerts->count(),
                            'status' => $ramAlerts->contains('ram_alert_level','critical') ? 'danger' : 'warning'
                        ],
                        [
                            'name' => 'Alertes Disque',
                            'count' => $diskAlerts->count(),
                            'status' => $diskAlerts->contains('alert_level','critical') ? 'danger' : 'warning'
                        ],
                    ],
                ],
            ],

            'ramAlerts' => $ramAlerts,
            'diskAlerts' => $diskAlerts,
        ]);
    }
}