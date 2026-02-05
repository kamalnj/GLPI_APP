<?php

namespace App\Services\Inventaire;

use App\Models\Computer;

class ComputerDetailsService
{
    public function getDetails(Computer $computer):Computer
    {
        // This method will fetch and return detailed information about a computer,
        // including its antivirus details, inventory history, etc.

        $computer->load([
            'antiviruses' => fn ($q) => $q
                ->select(['id', 'computer_id', 'name', 'antivirus_version', 'date_mod'])
                ->orderByDesc('date_mod')
                ->orderByDesc('id'),

            'volumes' => fn ($q) => $q
                ->select([
                    'id', 'computer_id', 'name', 'mountpoint',
                    'total_size', 'free_size', 'free_percent',
                     'date_mod'
                ])
                ->orderBy('mountpoint')
                ->orderByDesc('date_mod'),
        ]);

        return $computer;
    }
}
