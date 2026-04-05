<?php

namespace App\Services\Alertes;

use App\Models\Computer;
use App\Models\ComputerPatchSecurity;
use App\Models\ComputerRAM;
use App\Models\ComputerVolumes;
use Illuminate\Support\Facades\DB;

class AlertStatsService
{

    public function getAllStats(): array
    {
        // Requête 1 — total machines
        $total = Computer::count();

        // Requête 2 — RAM par niveau
        $ram = ComputerRAM::select('ram_alert_level', DB::raw('COUNT(DISTINCT computer_id) as cnt'))
            ->groupBy('ram_alert_level')
            ->pluck('cnt', 'ram_alert_level');

        $ramCritical = (int) $ram->get('critical', 0);
        $ramAlert    = (int) $ram->get('alert', 0);

        // Requête 3 — Disk : worst level par PC en SQL
        $disk = DB::table(
            ComputerVolumes::select('computer_id', DB::raw('
                    MAX(CASE
                        WHEN alert_level = "critical" THEN 3
                        WHEN alert_level = "alert"    THEN 2
                        ELSE 1
                    END) as level
                '))->groupBy('computer_id'),
            'per_pc'
        )
            ->selectRaw('SUM(level = 3) as critical, SUM(level = 2) as alert, SUM(level = 1) as normal')
            ->first();

        $diskCritical = (int) ($disk->critical ?? 0);
        $diskAlert    = (int) ($disk->alert    ?? 0);
        $diskNormal   = (int) ($disk->normal   ?? 0);

        // Requête 4 — Patches : seuils en SQL
        $patch = DB::table(
            ComputerPatchSecurity::select('computer_id', DB::raw('MAX(date_install) as last_patch'))
                ->groupBy('computer_id'),
            'latest'
        )
            ->selectRaw('
                SUM(last_patch <= DATE_SUB(NOW(), INTERVAL 90 DAY)) as critical,
                SUM(last_patch >  DATE_SUB(NOW(), INTERVAL 90 DAY)
                AND last_patch <= DATE_SUB(NOW(), INTERVAL 30 DAY)) as alert
            ')
            ->first();

        $patchCritical = (int) ($patch->critical ?? 0);
        $patchAlert    = (int) ($patch->alert    ?? 0);

        // Requête 5 — Inventaire obsolète
        $inventoryOutOfDate = Computer::where('last_inventory_update', '<=', now()->subDays(7))->count();

        // Requête 6 — Machines avec au moins une alerte RAM ou Disk (UNION)
        $machinesWithAlerts = DB::table(
            DB::table('computer_rams')
                ->select('computer_id')
                ->whereIn('ram_alert_level', ['alert', 'critical'])
                ->union(
                    DB::table('computer_volumes')
                        ->select('computer_id')
                        ->whereIn('alert_level', ['alert', 'critical'])
                ),
            'affected'
        )->count();

        // Calculs PHP (zéro requête supplémentaire)
        $totalCritical      = $ramCritical  + $diskCritical;
        $totalAlert         = $ramAlert     + $diskAlert;
        $machinesOk         = max(0, $total - $machinesWithAlerts);
        $healthPct          = $total > 0 ? (int) round($machinesOk / $total * 100) : 0;

        return [
            // Pie charts existants (inchangés)
            'ramStats' => [
                'critical' => $ramCritical,
                'alert'    => $ramAlert,
                'normal'   => max(0, $total - $ramCritical - $ramAlert),
                'total'    => $total,
            ],
            'diskStats' => [
                'critical' => $diskCritical,
                'alert'    => $diskAlert,
                'normal'   => $diskNormal,
                'total'    => $total,
            ],
            'patchStats' => [
                'critical'   => $patchCritical,
                'alert'      => $patchAlert,
                'up_to_date' => max(0, $total - $patchCritical - $patchAlert),
                'total'      => $total,
            ],
            'outDateInventoryStats' => [
                'out_of_date' => $inventoryOutOfDate,
                'up_to_date'  => max(0, $total - $inventoryOutOfDate),
                'total'       => $total,
            ],

            // KPI cards
            'kpiStats' => [
                // Card 1 — santé globale
                'healthPct'          => $healthPct,
                'machinesOk'         => $machinesOk,
                'machinesAlert'      => max(0, $machinesWithAlerts - $totalCritical),
                'machinesCritical'   => min($totalCritical, $machinesWithAlerts),
                'totalMachines'      => $total,

                // Card 2 — alertes actives
                'totalCritical'      => $totalCritical,
                'totalAlert'         => $totalAlert,
                'countRam'           => $ramCritical + $ramAlert,
                'countDisk'          => $diskCritical + $diskAlert,
                'countPatch'         => $patchCritical + $patchAlert,
                'countInventory'     => $inventoryOutOfDate,

                // Card 3 — machines concernées
                'machinesWithAlerts' => $machinesWithAlerts,
                'machinesConcernees' => $machinesWithAlerts,
            ],
        ];
    }
}
