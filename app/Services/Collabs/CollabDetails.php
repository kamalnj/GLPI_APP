<?php

namespace App\Services\Collabs;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CollabDetails
{
    private const CACHE_TTL = 600;

    private const MAX_DAYS = 90;

    /* =========================
     | USER DETAILS
     ========================= */
    public function getUserDetails(string $userName, string $mode): array
    {
        return [
            'overview' => $this->getOverview($userName),
            'machines' => $this->getMachines($userName),
            'networks' => $this->getNetworks($userName),

            'activityDay' => $this->getActivity($userName, 'day'),
            'activityWeek' => $this->getActivity($userName, 'week'),
            'activityMonth' => $this->getActivity($userName, 'month'),
            'workModeComparison' => $this->getWorkModeComparison($userName, $mode),
        ];
    }

    /* =========================
     | OVERVIEW
     ========================= */
    private function getOverview(string $userName)
    {
        $month = now()->month;
        $year = now()->year;

        return Cache::remember("user_overview_{$userName}_{$year}_{$month}", self::CACHE_TTL, function () use ($userName, $month, $year) {
            return DB::connection('sqlsrv')
                ->table('vw_user_daily_activity')
                ->select([
                    'user_name',
                    DB::raw('SUM(active_seconds) as total_active_seconds'),
                    DB::raw('SUM(unlock_count) as total_unlocks'),
                    DB::raw('MAX(machines_count) as machines_count'),
                ])
                ->where('user_name', $userName)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->groupBy('user_name')
                ->first();
        });
    }

    /* =========================
     | MACHINES
     ========================= */
    private function getMachines(string $userName)
    {
        return Cache::remember("user_machines_$userName", self::CACHE_TTL, function () use ($userName) {
            return DB::connection('sqlsrv')
                ->table('vw_user_machines')
                ->where('user_name', $userName)
                ->orderByDesc('total_active_seconds')
                ->limit(20)
                ->get();
        });
    }

    /* =========================
     | NETWORKS
     ========================= */
    private function getNetworks(string $userName)
    {
        return Cache::remember("user_networks_$userName", self::CACHE_TTL, function () use ($userName) {
            return DB::connection('sqlsrv')
                ->table('vw_user_networks')
                ->where('user_name', $userName)
                ->orderByDesc('occurrences')
                ->limit(20)
                ->get();
        });
    }

    /* =========================
     | ACTIVITY (DAY / WEEK / MONTH)
     ========================= */
    private function getActivity(string $userName, string $period)
    {
        $query = DB::connection('sqlsrv')
            ->table('vw_user_daily_activity')
            ->where('user_name', $userName)
            ->where('date', '>=', now()->subDays(self::MAX_DAYS));

        // JOUR
        if ($period === 'day') {
            return $query
                ->select('date', 'active_seconds', 'unlock_count')
                ->orderByDesc('date')
                ->limit(60)
                ->get();
        }

        // SEMAINE
        if ($period === 'week') {
            return $query
                ->selectRaw('
                    DATEPART(YEAR, date) as year,
                    DATEPART(WEEK, date) as period,
                    SUM(active_seconds) as active_seconds,
                    SUM(unlock_count) as unlock_count
                ')
                ->groupByRaw('DATEPART(YEAR, date), DATEPART(WEEK, date)')
                ->orderByDesc('year')
                ->get();
        }

        // MOIS
        return $query
            ->selectRaw('
                DATEPART(YEAR, date) as year,
                DATEPART(MONTH, date) as period,
                SUM(active_seconds) as active_seconds,
                SUM(unlock_count) as unlock_count
            ')
            ->groupByRaw('DATEPART(YEAR, date), DATEPART(MONTH, date)')
            ->orderByDesc('year')
            ->get();
    }

    // Remote vs Onsite
    public function getWorkModeComparison(string $userName, string $mode = 'current')
    {
        if ($mode === 'previous') {
            $start = now()->subMonth()->startOfMonth();
            $end = now()->subMonth()->endOfMonth();
        } else {
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();
        }

        $data = DB::connection('sqlsrv')
            ->table('daily_summary_central as d')
            ->leftJoinSub(
                DB::connection('sqlsrv')
                    ->table('network_changes_central')
                    ->selectRaw('
                    user_name,
                    machine_name,
                    CAST(date AS DATE) as day,
                    ssid,
                    ip_address,
                    ROW_NUMBER() OVER (
                        PARTITION BY user_name, machine_name, CAST(date AS DATE)
                        ORDER BY date DESC
                    ) as rn
                '),
                'n',
                function ($join) {
                    $join->on('d.user_name', '=', 'n.user_name')
                        ->on('d.machine_name', '=', 'n.machine_name')
                        ->on(DB::raw('CAST(d.date AS DATE)'), '=', 'n.day')
                        ->where('n.rn', '=', 1);
                }
            )
            ->where('d.user_name', $userName)
            ->whereBetween('d.date', [$start, $end])
            ->selectRaw("
            SUM(CASE 
                WHEN n.ssid = 's2m'
                  OR n.ip_address LIKE '10.0.2.%'
                  OR n.ip_address LIKE '10.0.3.%'
                THEN d.active_seconds ELSE 0 END
            ) AS onsite_seconds,

            SUM(CASE 
                WHEN n.ssid IS NULL
                  OR (
                      n.ssid <> 's2m'
                      AND n.ip_address NOT LIKE '10.0.2.%'
                      AND n.ip_address NOT LIKE '10.0.3.%'
                  )
                THEN d.active_seconds ELSE 0 END
            ) AS remote_seconds
        ")
            ->first();

        return [
            'mode' => $mode,
            'onsite_hours' => round(($data->onsite_seconds ?? 0) / 3600, 2),
            'remote_hours' => round(($data->remote_seconds ?? 0) / 3600, 2),
            'total_hours' => round((($data->onsite_seconds ?? 0) + ($data->remote_seconds ?? 0)) / 3600, 2),
        ];
    }
}
