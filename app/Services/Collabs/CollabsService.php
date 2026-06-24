<?php

namespace App\Services\Collabs;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CollabsService
{
    private const CACHE_TTL = 600;

    private const MAX_DAYS = 90;

    /* =========================
     | LIST USERS (PAGINATION)
     ========================= */
    public function paginate(
        ?string $search = null,
        ?int $machinesMin = null,
        ?int $machinesMax = null,
        ?\DateTime $fromDate = null,
        ?\DateTime $toDate = null,
        int $perPage = 20
    ): LengthAwarePaginator {

        $month = now()->month;
        $year = now()->year;

        $query = DB::connection('sqlsrv')
            ->table('vw_user_daily_activity')
            ->select([
                'user_name',
                DB::raw('SUM(active_seconds) as total_active_seconds'),
                DB::raw('MAX(machines_count) as machines_count'),
                DB::raw('SUM(unlock_count) as total_unlock_count'),
            ])
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->groupBy('user_name');

        if ($search) {
            $query->where('user_name', 'like', "%{$search}%");
        }

        if ($machinesMin !== null) {
            $query->having('machines_count', '>=', $machinesMin);
        }

        if ($machinesMax !== null) {
            $query->having('machines_count', '<=', $machinesMax);
        }

        if ($fromDate) {
            $query->whereDate('date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('date', '<=', $toDate);
        }

        return $query
            ->orderByDesc('total_active_seconds')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($user) => $this->formatUser($user));
    }

    /* =========================
     | FORMAT USER
     ========================= */

    /**
     * @param object{
     *     user_name: string,
     *     total_active_seconds: int
     * } $user
     */
    private function formatUser($user)
    {
        $hours = floor($user->total_active_seconds / 3600);
        $minutes = floor(($user->total_active_seconds % 3600) / 60);

        $user->formatted_active_time = "{$hours}h {$minutes}m";

        return $user;
    }
}
