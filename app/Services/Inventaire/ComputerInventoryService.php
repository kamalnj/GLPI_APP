<?php

namespace App\Services\Inventaire;

use App\Models\Computer;
use App\Models\ComputerAntivirus;
use App\Models\ComputerCPU;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ComputerInventoryService
{
    public function paginate(
        ?string $search,
        bool $missingSophos = false,
        ?string $cpuTier = null,
        ?string $group = null,
        int $perPage = 15
    ): LengthAwarePaginator {
        $sophosName = 'Sophos Intercept X';
        return Computer::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('contact', 'like', "%{$search}%");
                });
            })
            ->when($group, function ($query) use ($group) {
                $query->where('groupe', $group);
            })
            ->when($missingSophos, function ($query) use ($sophosName) {
                $query->whereDoesntHave('antiviruses', function ($q) use ($sophosName) {
                    $q->where('name', $sophosName);
                });
            })
            ->when($cpuTier, function ($query) use ($cpuTier) {
                $tier = strtolower(trim($cpuTier));

                $query->whereHas('cpu', function ($q) use ($tier) {
                    $q->whereRaw('LOWER(cpu_name) REGEXP ?', ["\\b{$tier}\\b"]);
                });
            })
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function groupOptions(): array
    {
        return Computer::query()
            ->whereNotNull('groupe')
            ->where('groupe', '<>', '')
            ->distinct()
            ->orderBy('groupe')
            ->pluck('groupe')
            ->toArray();
    }
    public function cpuTierOptions(): array
    {
        $names = ComputerCPU::query()
            ->whereNotNull('cpu_name')
            ->where('cpu_name', '<>', '')
            ->distinct()
            ->pluck('cpu_name');

        $tiers = [];

        foreach ($names as $name) {
            $tier = $this->detectCpuTier((string) $name);
            if ($tier) {
                $tiers[$tier] = true;
            }
        }

        $list = array_keys($tiers);
        sort($list);

        // Ex: ["i3","i5","i7","i9","ryzen5","ryzen7"]
        return $list;
    }

    private function detectCpuTier(string $cpuName): ?string
    {
        $s = strtolower($cpuName);

        // Intel i3/i5/i7/i9
        if (preg_match('/\bi\s*(3|5|7|9)\b/', $s, $m)) {
            return 'i' . $m[1];
        }

        // Ryzen 3/5/7/9
        if (preg_match('/\bryzen\s*(3|5|7|9)\b/', $s, $m)) {
            return 'ryzen' . $m[1];
        }

        return null;
    }
}
