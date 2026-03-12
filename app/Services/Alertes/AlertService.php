<?php

namespace App\Services\Alertes;

use App\Models\ComputerRAM;
use App\Models\ComputerVolumes;

class AlertService
{
    public function getRamAlerts()
    {
        return ComputerRAM::with('computer:id,name')
            ->whereIn('ram_alert_level', ['alert','critical'])
            ->get([
                'computer_id',
                'ram_usage',
                'ram_alert_level'
            ]);
    }

    public function getDiskAlerts()
    {
        return ComputerVolumes::with('computer:id,name')
            ->whereIn('alert_level', ['alert','critical'])
            ->get([
                'computer_id',
                'mountpoint',
                'free_percent',
                'alert_level'
            ]);
    }
}