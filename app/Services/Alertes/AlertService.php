<?php

namespace App\Services\Alertes;

use App\Models\ComputerRAM;
use App\Models\ComputerVolumes;
use Illuminate\Support\Collection;

class AlertService
{
    public function getRamAlerts(): Collection
    {
        return ComputerRAM::with('computer')
            ->whereIn('ram_alert_level', ['alert', 'critical'])
            ->orderBy('ram_synced_at', 'desc')
            ->get()
            ->map(fn($ram) => [
                'id'           => $ram->id,
                'computer_id'  => $ram->computer_id,
                'computer_name'=> $ram->computer?->name ?? 'N/A',
                'ram_name'     => $ram->ram_name,
                'ram_usage'    => $ram->ram_usage,
                'alert_level'  => $ram->ram_alert_level,
                'synced_at'    => $ram->ram_synced_at,
            ]);
    }

 public function getDiskAlerts(): Collection
{
    $volumes = ComputerVolumes::with('computer')
        ->whereIn('alert_level', ['alert', 'critical'])
        ->orderBy('synced_at', 'desc')
        ->get();

    return $volumes
        ->groupBy('computer_id')
        ->map(function ($partitions) {
            $computer = $partitions->first()->computer;
            $worstLevel = $partitions->contains('alert_level', 'critical') ? 'critical' : 'alert';
            $latestSync = $partitions->max('synced_at');

            return [
                'computer_id'   => $partitions->first()->computer_id,
                'computer_name' => $computer?->name ?? 'N/A',
                'alert_level'   => $worstLevel,
                'synced_at'     => $latestSync,
                'partitions'    => $partitions->map(fn($v) => [
                    'id'           => $v->id,
                    'mountpoint'   => $v->mountpoint,
                    'free_percent' => $v->free_percent,
                    'alert_level'  => $v->alert_level,
                ])->values(),
            ];
        })
        ->values();
}
}