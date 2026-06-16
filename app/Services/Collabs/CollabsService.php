<?php

namespace App\Services\Collabs;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CollabsService
{
    private const CACHE_TTL = 600; // 10 min
    private const MAX_DAYS = 90;

    /* =========================
     | LIST USERS (PAGINATION)
     ========================= */
    public function paginate(
        ?string $search = null,
        ?int $machinesMin = null,
        ?int $machinesMax = null,
        int $perPage = 20
    ): LengthAwarePaginator {

        $query = DB::connection('sqlsrv')
            ->table('vw_users_overview');

        if ($search) {
            $query->where('user_name', 'like', "%{$search}%");
        }

        if ($machinesMin !== null) {
            $query->where('machines_count', '>=', $machinesMin);
        }

        if ($machinesMax !== null) {
            $query->where('machines_count', '<=', $machinesMax);
        }

        return $query
            ->orderByDesc('total_active_seconds')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($user) => $this->formatUser($user));
    }

    /* =========================
     | USERS OVERVIEW (LIMIT)
     ========================= */
    public function getUsersOverview(int $limit = 50)
    {
        return Cache::remember("users_overview_$limit", self::CACHE_TTL, function () use ($limit) {
            return DB::connection('sqlsrv')
                ->table('vw_users_overview')
                ->orderByDesc('total_active_seconds')
                ->limit($limit)
                ->get()
                ->map(fn ($user) => $this->formatUser($user));
        });
    }
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



   