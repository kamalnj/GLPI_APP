<?php

namespace App\Services\Dashboard;

use App\Models\Computer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class MaterialInventory
{
    private const CACHE_TTL = 3600; // 1 hour

    public function totalMachine()
    {
        return Cache::remember('dashboard.total_machines', self::CACHE_TTL, fn() => Computer::count());
    }

    /**
     * Get number of different models
     */
    public function numberOfDifferentModels()
    {
        return Cache::remember(
            'dashboard.different_models_count',
            self::CACHE_TTL,
            fn() =>
            Computer::distinct('computer_model')->count('computer_model')
        );
    }

    /**
     * Get top model (most common)
     */
    public function topModel()
    {
        return Cache::remember(
            'dashboard.top_model',
            self::CACHE_TTL,
            fn() =>
            Computer::select('computer_model')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('computer_model')
                ->orderByDesc('count')
                ->first()
        );
    }

    /**
     * Get device model repartition - top 10 for pie chart
     */
    public function modelRepartitionTop10()
    {
        return Cache::remember(
            'dashboard.model_repartition_top10',
            self::CACHE_TTL,
            fn() =>
            Computer::select('computer_model')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('computer_model')
                ->orderByDesc('count')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->computer_model ?? 'Unknown',
                        'value' => $item->count
                    ];
                })
                ->toArray()
        );
    }

    /**
     * Get RAM (GO) by number of devices for bar chart - Optimized for DB
     */
    public function ramByNumberOfDevices()
    {
        return Cache::remember(
            'dashboard.ram_distribution',
            self::CACHE_TTL,
            fn() =>
            DB::table('computer_rams')
                ->select(
                    DB::raw('CASE 
                        WHEN size / 1024 <= 2 THEN 2
                        WHEN size / 1024 <= 4 THEN 4
                        WHEN size / 1024 <= 8 THEN 8
                        WHEN size / 1024 <= 16 THEN 16
                        WHEN size / 1024 <= 32 THEN 32
                        ELSE ROUND(size / 1024)
                    END as ram_gb')
                )
                ->selectRaw('COUNT(DISTINCT computer_id) as device_count')
                ->whereNotNull('size')
                ->groupBy('ram_gb')
                ->orderBy('ram_gb')
                ->get()
                ->map(function ($item) {
                    return [
                        'ram_gb' => (int)$item->ram_gb,
                        'device_count' => (int)$item->device_count
                    ];
                })
                ->toArray()
        );
    }

    /**
     * Clear all dashboard caches
     */
    public function clearCache()
    {
        Cache::forget('dashboard.total_machines');
        Cache::forget('dashboard.different_models_count');
        Cache::forget('dashboard.top_model');
        Cache::forget('dashboard.model_repartition_top10');
        Cache::forget('dashboard.ram_distribution');
    }
}
