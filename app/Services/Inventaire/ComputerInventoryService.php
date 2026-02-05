<?php

namespace App\Services\Inventaire;

use App\Models\Computer;
use App\Models\ComputerAntivirus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ComputerInventoryService
{
  public function paginate(?string $search, bool $missingSophos = false, int $perPage): LengthAwarePaginator
    {
        $sophosName = 'Sophos Intercept X';
        return Computer::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('contact', 'like', "%{$search}%");
                });
            })
          ->when($missingSophos, function ($query) use ($sophosName) {
            $query->whereDoesntHave('antiviruses', function ($q) use ($sophosName) {
                $q->where('name', $sophosName);
            });
        })
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();
    }
}
