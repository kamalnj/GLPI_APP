<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SoftwareInventory
{
    private const CACHE_TTL = 3600; // 1 hour

    private ?float $cachedAverage = null;

    /**
     * Get average number of softwares per device
     */
    public function averageSoftwaresPerDevice(): float
    {
        if ($this->cachedAverage !== null) {
            return $this->cachedAverage;
        }

        return $this->cachedAverage = Cache::remember(
            'dashboard.avg_softwares',
            self::CACHE_TTL,
            function () {

                $average = DB::table('computer_software_application')
                    ->select(DB::raw("
                        CASE
                            WHEN COUNT(DISTINCT computer_id) = 0
                            THEN 0
                            ELSE CAST(COUNT(*) AS DECIMAL(10,2)) / COUNT(DISTINCT computer_id)
                        END as average
                    "))
                    ->value('average');

                return (float) ($average ?? 0);
            }
        );
    }

    /**
     * Get top list of most installed softwares
     */
    public function topInstalledSoftwares(int $limit = 15): array
    {
        $cacheKey = "dashboard.top_softwares.{$limit}";

        return Cache::remember(
            $cacheKey,
            self::CACHE_TTL,
            function () use ($limit) {

                return DB::table('computer_software_application')
                    ->select('software_name')
                    ->selectRaw('COUNT(*) as installation_count')
                    ->whereNotNull('software_name')
                    ->where('software_name', '!=', '')
                    ->groupBy('software_name')
                    ->orderByDesc('installation_count')
                    ->limit($limit)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'name'  => $item->software_name,
                            'count' => (int) $item->installation_count,
                        ];
                    })
                    ->toArray();
            }
        );
    }

    /**
     * Count devices having softwares above average
     */
    public function countDevicesAboveAverage(): int
    {
        return Cache::remember(
            'dashboard.devices_above_avg',
            self::CACHE_TTL,
            function () {

                $average = $this->averageSoftwaresPerDevice();

                return DB::table('computer_software_application')
                    ->select('computer_id')
                    ->selectRaw('COUNT(*) as software_count')
                    ->groupBy('computer_id')
                    ->havingRaw('COUNT(*) > ?', [$average])
                    ->get()
                    ->count();
            }
        );
    }

    /**
     * Devices with above-average software count
     * and low disk space
     */
    public function devicesAboveAverageWithLowDiskSpace(
        float $diskSpaceThreshold = 20,
        int $limit = 20
    ): array {

        $cacheKey = "dashboard.devices_above_avg_low_disk.{$diskSpaceThreshold}.{$limit}";

        return Cache::remember(
            $cacheKey,
            self::CACHE_TTL,
            function () use ($diskSpaceThreshold, $limit) {

                $average = $this->averageSoftwaresPerDevice();

                return DB::table('computers')
                    ->select(
                        'computers.id',
                        'computers.name',
                        'computers.computer_model',
                        DB::raw('COUNT(DISTINCT csa.id) as software_count'),
                        DB::raw('AVG(cv.free_percent) as avg_free_percent')
                    )
                    ->leftJoin(
                        'computer_software_application as csa',
                        'computers.id',
                        '=',
                        'csa.computer_id'
                    )
                    ->leftJoin(
                        'computer_volumes as cv',
                        'computers.id',
                        '=',
                        'cv.computer_id'
                    )
                    ->groupBy(
                        'computers.id',
                        'computers.name',
                        'computers.computer_model'
                    )
                    ->havingRaw(
                        'COUNT(DISTINCT csa.id) > ?',
                        [$average]
                    )
                    ->havingRaw(
                        'AVG(cv.free_percent) < ?',
                        [$diskSpaceThreshold]
                    )
                    ->orderByDesc('software_count')
                    ->limit($limit)
                    ->get()
                    ->map(function ($item) {

                        return [
                            'id'               => (int) $item->id,
                            'name'             => $item->name,
                            'model'            => $item->computer_model,
                            'software_count'   => (int) $item->software_count,
                            'avg_free_percent' => round(
                                (float) $item->avg_free_percent,
                                2
                            ),
                        ];
                    })
                    ->toArray();
            }
        );
    }

    /**
     * Get top device by software count
     */
    public function topDeviceByNumberOfSoftwares(): ?object
    {
        return Cache::remember(
            'dashboard.top_device_software',
            self::CACHE_TTL,
            function () {

                return DB::table('computers')
                    ->select(
                        'computers.id',
                        'computers.name',
                        'computers.computer_model',
                        DB::raw('COUNT(csa.id) as software_count')
                    )
                    ->leftJoin(
                        'computer_software_application as csa',
                        'computers.id',
                        '=',
                        'csa.computer_id'
                    )
                    ->groupBy(
                        'computers.id',
                        'computers.name',
                        'computers.computer_model'
                    )
                    ->orderByDesc('software_count')
                    ->first();
            }
        );
    }

    /**
     * Global software statistics
     */
    public function getSoftwareStats(): array
    {
        return Cache::remember(
            'dashboard.software_stats_all',
            self::CACHE_TTL,
            function () {

                return [
                    'average_softwares_per_device' =>
                        round($this->averageSoftwaresPerDevice(), 2),

                    'devices_above_average' =>
                        $this->countDevicesAboveAverage(),

                    'top_installed_softwares' =>
                        $this->topInstalledSoftwares(),

                    'devices_above_average_with_low_disk' =>
                        $this->devicesAboveAverageWithLowDiskSpace(),

                    'top_device_by_software_count' =>
                        $this->topDeviceByNumberOfSoftwares(),
                ];
            }
        );
    }

    /**
     * Clear all caches
     */
    public function clearCache(): void
    {
        Cache::forget('dashboard.avg_softwares');
        Cache::forget('dashboard.devices_above_avg');
        Cache::forget('dashboard.top_device_software');
        Cache::forget('dashboard.software_stats_all');

        $this->cachedAverage = null;
    }
}