<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class GroupsStats
{
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get devices with low disk space by groupe (grouped bar chart data)
     */
    public function lowDiskDevicesByGroupe($diskSpaceThreshold = 20)
    {
        return Cache::remember('dashboard.low_disk_devices_by_groupe', self::CACHE_TTL, fn() =>
            DB::table('computers')
                ->select('computers.groupe')
                ->selectRaw('COUNT(DISTINCT computers.id) as low_disk_devices')
                ->leftJoin('computer_volumes as cv', 'computers.id', '=', 'cv.computer_id')
                ->whereNotNull('computers.groupe')
                ->where('computers.groupe', '!=', '')
                ->whereNotNull('cv.free_percent')
                ->where('cv.free_percent', '<', $diskSpaceThreshold)
                ->groupBy('computers.groupe')
                ->havingRaw('COUNT(DISTINCT computers.id) > 0')
                ->orderByDesc('low_disk_devices')
                ->limit(15)
                ->get()
                ->map(function ($item) {
                    return [
                        'groupe' => $item->groupe ?? 'Non assigné',
                        'low_disk_devices' => (int)$item->low_disk_devices
                    ];
                })
                ->toArray()
        );
    }

    /**
     * Get top groups with vulnerabilities
     */
    public function topGroupsWithVulnerabilities($limit = 10)
    {
        return Cache::remember('dashboard.top_groups_vulnerabilities', self::CACHE_TTL, fn() =>
            DB::table('computers')
                ->select('computers.groupe')
                ->selectRaw('COUNT(DISTINCT av.vulnerability_id) as vulnerability_count')
                ->leftJoin('agents', 'computers.wazuh_agent_id', '=', 'agents.wazuh_agent_id')
                ->leftJoin('agent_vulnerabilities as av', 'agents.id', '=', 'av.agent_id')
                ->whereNotNull('computers.groupe')
                ->where('computers.groupe', '!=', '')
                ->groupBy('computers.groupe')
                ->orderByDesc('vulnerability_count')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'groupe' => $item->groupe ?? 'Non assigné',
                        'vulnerability_count' => (int)$item->vulnerability_count
                    ];
                })
                ->toArray()
        );
    }

    /**
     * Get top groups with most softwares
     */
    public function topGroupsWithMostSoftwares($limit = 10)
    {
        return Cache::remember('dashboard.top_groups_softwares', self::CACHE_TTL, fn() =>
            DB::table('computers')
                ->select('computers.groupe')
                ->selectRaw('COUNT(DISTINCT csa.id) as software_count')
                ->selectRaw('COUNT(DISTINCT computers.id) as device_count')
                ->selectRaw('ROUND(COUNT(DISTINCT csa.id) / COUNT(DISTINCT computers.id), 2) as avg_software_per_device')
                ->leftJoin('computer_software_application as csa', 'computers.id', '=', 'csa.computer_id')
                ->whereNotNull('computers.groupe')
                ->where('computers.groupe', '!=', '')
                ->groupBy('computers.groupe')
                ->orderByDesc('software_count')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'groupe' => $item->groupe ?? 'Non assigné',
                        'software_count' => (int)$item->software_count,
                        'device_count' => (int)$item->device_count,
                        'avg_software_per_device' => (float)$item->avg_software_per_device
                    ];
                })
                ->toArray()
        );
    }

    /**
     * Get all groups statistics combined
     */
    public function getGroupsStatsAll()
    {
        return Cache::remember('dashboard.groups_stats_all', self::CACHE_TTL, fn() => [
            'low_disk_by_groupe' => $this->lowDiskDevicesByGroupe(),
            'top_groups_vulnerabilities' => $this->topGroupsWithVulnerabilities(),
            'top_groups_softwares' => $this->topGroupsWithMostSoftwares(),
        ]);
    }

    /**
     * Clear all groups caches
     */
    public function clearCache()
    {
        Cache::forget('dashboard.low_disk_devices_by_groupe');
        Cache::forget('dashboard.top_groups_vulnerabilities');
        Cache::forget('dashboard.top_groups_softwares');
        Cache::forget('dashboard.groups_stats_all');
    }
}