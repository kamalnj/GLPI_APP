<?php

namespace App\Services\Alertes;

use App\Models\Computer;
use App\Models\ComputerPatchSecurity;
use App\Models\ComputerVolumes;
use Illuminate\Support\Facades\DB;

class AlertStatsService
{
    public function getAllStats(): array
    {
        // Query 1 — total machines
        $total = Computer::count();

        // Query 2 — Disk: worst alert level per PC
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

        $diskCritical = (int) ($disk?->critical ?? 0);
        $diskAlert = (int) ($disk?->alert ?? 0);
        $diskNormal = (int) ($disk?->normal ?? 0);

        // Query 3 — Patches: last patch date thresholds per PC
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

        $patchCritical = (int) ($patch?->critical ?? 0);
        $patchAlert = (int) ($patch?->alert ?? 0);

        // Query 4 — Outdated inventory (no update in 7+ days)
        $inventoryOutOfDate = Computer::where('last_inventory_update', '<=', now()->subDays(7))->count();

        // Query 5 — Per-machine worst severity across ALL alert sources (disk + patch + inventory)
        // Each machine is counted once at its worst level, deduplication via GROUP BY computer_id
        $severityResult = DB::selectOne("
            SELECT
                SUM(worst_level = 'critical') as machines_critical,
                SUM(worst_level = 'alert')    as machines_alert
            FROM (
                SELECT computer_id, MAX(severity_rank) as worst_rank,
                    CASE MAX(severity_rank)
                        WHEN 3 THEN 'critical'
                        WHEN 2 THEN 'alert'
                        ELSE 'ok'
                    END as worst_level
                FROM (
                    -- Disk alerts
                    SELECT computer_id,
                        CASE alert_level
                            WHEN 'critical' THEN 3
                            WHEN 'alert'    THEN 2
                            ELSE 1
                        END as severity_rank
                    FROM computer_volumes
                    WHERE alert_level IN ('alert', 'critical')

                    UNION ALL

                    -- Patch alerts
                    SELECT computer_id,
                        CASE
                            WHEN MAX(date_install) <= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 3
                            WHEN MAX(date_install) <= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 2
                            ELSE 1
                        END as severity_rank
                    FROM computer_patch_securite
                    GROUP BY computer_id
                    HAVING severity_rank IN (2, 3)

                    UNION ALL

                    -- Inventory alerts (always critical)
                    SELECT id AS computer_id, 3 as severity_rank
                    FROM computers
                    WHERE last_inventory_update <= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ) AS all_alerts
                GROUP BY computer_id
            ) AS per_machine
        ");

        $machinesCritical = (int) ($severityResult?->machines_critical ?? 0);
        $machinesAlert = (int) ($severityResult?->machines_alert ?? 0);
        $machinesWithAlerts = $machinesCritical + $machinesAlert;

        // --- KPI derivations (no extra queries) ---

        // totalCritical / totalAlert: alert counts summed across all sources (for Card 2)
        $totalCritical = $diskCritical + $patchCritical + $inventoryOutOfDate;
        $totalAlert = $diskAlert + $patchAlert;

        // machinesOk: machines with zero alerts across all sources
        $machinesOk = max(0, $total - $machinesWithAlerts);

        // healthPct: percentage of fully healthy machines
        $healthPct = $total > 0 ? (int) round($machinesOk / $total * 100) : 0;

        return [
            // Pie charts
            'diskStats' => [
                'critical' => $diskCritical,
                'alert' => $diskAlert,
                'normal' => $diskNormal,
                'total' => $total,
            ],
            'patchStats' => [
                'critical' => $patchCritical,
                'alert' => $patchAlert,
                'up_to_date' => max(0, $total - $patchCritical - $patchAlert),
                'total' => $total,
            ],
            'outOfDateInventoryStats' => [
                'out_of_date' => $inventoryOutOfDate,
                'up_to_date' => max(0, $total - $inventoryOutOfDate),
                'total' => $total,
            ],

            // KPI cards
            'kpiStats' => [
                // Card 1 — global health
                'healthPct' => $healthPct,
                'machinesOk' => $machinesOk,
                'machinesAlert' => $machinesAlert,      // machines at warning level (not critical)
                'machinesCritical' => $machinesCritical,   // machines at critical level
                'totalMachines' => $total,

                // Card 2 — active alerts (summed across all sources, not deduplicated)
                'totalCritical' => $totalCritical,
                'totalAlert' => $totalAlert,
                'countDisk' => $diskCritical,
                'countPatch' => $patchCritical,
                'countInventory' => $inventoryOutOfDate,

                // Card 3 — affected machines (deduplicated, each machine counted once)
                'machinesWithAlerts' => $machinesWithAlerts,
                'machinesConcernees' => $machinesWithAlerts,
            ],
        ];
    }
}
