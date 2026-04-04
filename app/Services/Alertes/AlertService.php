<?php

namespace App\Services\Alertes;

use App\Models\Computer;
use App\Models\ComputerPatchSecurity;
use App\Models\ComputerRAM;
use App\Models\ComputerVolumes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;


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
public function getPatchWindowsAlerts(): Collection
{
    $latestPatches = ComputerPatchSecurity::select('computer_id')
        ->selectRaw('MAX(date_install) as last_patch_date')
        ->groupBy('computer_id');

    return ComputerPatchSecurity::with('computer')
        ->joinSub($latestPatches, 'latest', function ($join) {
            $join->on('computer_patch_securite.computer_id', '=', 'latest.computer_id')
                 ->on('computer_patch_securite.date_install', '=', 'latest.last_patch_date');
        })
        ->where('computer_patch_securite.date_install', '<=', now()->subDays(30))
        ->get()
         ->unique('computer_id') 
        ->values()
        ->map(fn($patch) => [
            'id'           => $patch->id,
            'computer_id'  => $patch->computer_id,
            'computer_name'=> $patch->computer?->name ?? 'N/A',
            'patch_name'   => $patch->patch_name,
            'date_install' => $patch->date_install,
            'synced_at'    => $patch->synced_at,
        ]);
}

public function getDiskStats(): array
{
        $totalpc = Computer::count();

    // On récupère un seul enregistrement par PC avec la priorité d'alerte
    $pcLevels = ComputerVolumes::select('computer_id', DB::raw('MAX(CASE 
        WHEN alert_level = "critical" THEN 3
        WHEN alert_level = "alert" THEN 2
        ELSE 1
    END) as level'))
    ->groupBy('computer_id')
    ->get();

    // Compter le nombre de PC par niveau
    $critical = $pcLevels->where('level', 3)->count();
    $alert    = $pcLevels->where('level', 2)->count();
    $normal   = $pcLevels->where('level', 1)->count();
    $total    = $totalpc;

    return compact('critical', 'alert', 'normal', 'total');
}
 

public function getRamStats(): array
{
    $total = Computer::count();

    $counts = ComputerRAM::select('ram_alert_level', DB::raw('COUNT(DISTINCT computer_id) as count'))
        ->groupBy('ram_alert_level')
        ->pluck('count', 'ram_alert_level');

    return [
        'critical' => $counts->get('critical', 0),
        'alert'    => $counts->get('alert', 0),
        'normal'   => max(0, $total - ($counts->get('critical', 0) + $counts->get('alert', 0))),
        'total'    => $total,
    ];
}
public function getPatchStats(): array
{
    $total = Computer::count();

    $lastPatches = ComputerPatchSecurity::select('computer_id', DB::raw('MAX(date_install) as last_patch'))
        ->groupBy('computer_id')
        ->get();

    $critical = $lastPatches->filter(fn($p) => $p->last_patch <= now()->subDays(90))->count();
    $alert    = $lastPatches->filter(fn($p) => $p->last_patch > now()->subDays(90) && $p->last_patch <= now()->subDays(30))->count();

    return [
        'critical'   => $critical,
        'alert'      => $alert,
        'up_to_date' => max(0, $total - $critical - $alert),
        'total'      => $total,
    ];
}
}