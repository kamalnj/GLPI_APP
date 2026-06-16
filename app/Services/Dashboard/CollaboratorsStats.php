<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CollaboratorsStats
{
    private const CACHE_TTL = 600; // 10 min
    private const MAX_DAYS = 90;

    /**
     * Get all collaborators statistics for dashboard
     */
    public function getCollaboratorsStatsAll(): array
    {
        return [
            'remote_onsite_average' => $this->getRemoteOnsiteAverage(),
            'top_active_users' => $this->getTopActiveUsers(10),
            'top_unlocks_users' => $this->getTopUnlocksUsers(10),
            'inactive_users' => $this->getInactiveUsers(),
            'total_users' => $this->getTotalUsersCount(),
        ];
    }

    /**
     * Get average remote vs on-site for all users (current month)
     */
    private function getRemoteOnsiteAverage(): array
    {
        return Cache::remember('collabs_remote_onsite_avg', self::CACHE_TTL, function () {
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();

            $data = DB::connection('sqlsrv')
                ->table('daily_summary_central as d')
                ->leftJoinSub(
                    DB::connection('sqlsrv')
                        ->table('network_changes_central')
                        ->selectRaw("
                            user_name,
                            machine_name,
                            CAST(date AS DATE) as day,
                            ssid,
                            ip_address,
                            ROW_NUMBER() OVER (
                                PARTITION BY user_name, machine_name, CAST(date AS DATE)
                                ORDER BY date DESC
                            ) as rn
                        "),
                    'n',
                    function ($join) {
                        $join->on('d.user_name', '=', 'n.user_name')
                             ->on('d.machine_name', '=', 'n.machine_name')
                             ->on(DB::raw('CAST(d.date AS DATE)'), '=', 'n.day')
                             ->where('n.rn', '=', 1);
                    }
                )
                ->whereBetween('d.date', [$start, $end])
                ->selectRaw("
                    COUNT(DISTINCT d.user_name) as total_users,

                    SUM(CASE 
                        WHEN n.ssid = 's2m'
                          OR n.ip_address LIKE '10.0.2.%'
                          OR n.ip_address LIKE '10.0.3.%'
                        THEN d.active_seconds ELSE 0 END
                    ) AS total_onsite_seconds,

                    SUM(CASE 
                        WHEN n.ssid IS NULL
                          OR (
                              n.ssid <> 's2m'
                              AND n.ip_address NOT LIKE '10.0.2.%'
                              AND n.ip_address NOT LIKE '10.0.3.%'
                          )
                        THEN d.active_seconds ELSE 0 END
                    ) AS total_remote_seconds
                ")
                ->first();

            $totalSeconds = ($data->total_onsite_seconds ?? 0) + ($data->total_remote_seconds ?? 0);
            $totalUsers = $data->total_users ?? 1;

            return [
                'onsite_percent' => $totalSeconds > 0 ? round((($data->total_onsite_seconds ?? 0) / $totalSeconds) * 100, 2) : 0,
                'remote_percent' => $totalSeconds > 0 ? round((($data->total_remote_seconds ?? 0) / $totalSeconds) * 100, 0) : 0,
                'onsite_avg_hours' => round(($data->total_onsite_seconds ?? 0) / $totalUsers / 3600, 2),
                'remote_avg_hours' => round(($data->total_remote_seconds ?? 0) / $totalUsers / 3600, 2),
            ];
        });
    }

    /**
     * Get top N active users
     */
    private function getTopActiveUsers(int $limit = 10): array
    {
        return Cache::remember("collabs_top_active_users_$limit", self::CACHE_TTL, function () use ($limit) {
            return DB::connection('sqlsrv')
                ->table('vw_users_overview')
                ->orderByDesc('total_active_seconds')
                ->limit($limit)
                ->get()
                ->map(function ($user) {
                    $hours = floor($user->total_active_seconds / 3600);
                    $minutes = floor(($user->total_active_seconds % 3600) / 60);

                    return [
                        'user_name' => $user->user_name,
                        'active_seconds' => $user->total_active_seconds,
                        'active_time' => "{$hours}h {$minutes}m",
                        'machines_count' => $user->machines_count ?? 0,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get users with most unlocks (last 30 days)
     */
    private function getTopUnlocksUsers(int $limit = 10): array
    {
        return Cache::remember("collabs_top_unlocks_users_$limit", self::CACHE_TTL, function () use ($limit) {
            $thirtyDaysAgo = now()->subDays(30);

            return DB::connection('sqlsrv')
                ->table('vw_user_daily_activity')
                ->where('date', '>=', $thirtyDaysAgo)
                ->groupBy('user_name')
                ->selectRaw('
                    user_name,
                    SUM(unlock_count) as total_unlocks,
                    COUNT(DISTINCT CAST(date AS DATE)) as active_days
                ')
                ->orderByDesc('total_unlocks')
                ->limit($limit)
                ->get()
                ->map(function ($user) {
                    return [
                        'user_name' => $user->user_name,
                        'total_unlocks' => $user->total_unlocks ?? 0,
                        'active_days' => $user->active_days ?? 0,
                        'avg_unlocks_per_day' => $user->active_days > 0 
                            ? round(($user->total_unlocks ?? 0) / $user->active_days, 2)
                            : 0,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get inactive users (last 30 days with very low activity)
     */
    private function getInactiveUsers(): array
    {
        return Cache::remember('collabs_inactive_users', self::CACHE_TTL, function () {
            $thirtyDaysAgo = now()->subDays(30);

            // Users with less than 1 hour in the last 30 days or no activity
            return DB::connection('sqlsrv')
                ->table('vw_users_overview')
                ->leftJoinSub(
                    DB::connection('sqlsrv')
                        ->table('vw_user_daily_activity')
                        ->where('date', '>=', $thirtyDaysAgo)
                        ->groupBy('user_name')
                        ->selectRaw('
                            user_name,
                            SUM(active_seconds) as last_30_active_seconds,
                            COUNT(DISTINCT CAST(date AS DATE)) as last_30_active_days
                        '),
                    'activity',
                    'vw_users_overview.user_name',
                    '=',
                    'activity.user_name'
                )
                ->where(function ($query) {
                    $query->whereNull('activity.last_30_active_seconds')
                          ->orWhereRaw('activity.last_30_active_seconds < 3600'); // Less than 1 hour
                })
                ->limit(20)
                ->get()
                ->map(function ($user) {
                    $secondsLast30 = $user->last_30_active_seconds ?? 0;
                    $hours = floor($secondsLast30 / 3600);
                    $minutes = floor(($secondsLast30 % 3600) / 60);

                    return [
                        'user_name' => $user->user_name,
                        'last_30_active_seconds' => $secondsLast30,
                        'last_30_active_time' => "{$hours}h {$minutes}m",
                        'last_30_active_days' => $user->last_30_active_days ?? 0,
                        'total_machines' => $user->machines_count ?? 0,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get total users count
     */
    private function getTotalUsersCount(): int
    {
        return Cache::remember('collabs_total_users_count', self::CACHE_TTL, function () {
            return DB::connection('sqlsrv')
                ->table('vw_users_overview')
                ->count();
        });
    }

    /**
     * Clear all caches
     */
    public function clearCache(): void
    {
        Cache::forget('collabs_remote_onsite_avg');
        Cache::forget('collabs_top_active_users_10');
        Cache::forget('collabs_top_unlocks_users_10');
        Cache::forget('collabs_inactive_users');
        Cache::forget('collabs_total_users_count');
    }
}
