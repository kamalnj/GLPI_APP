<?php

namespace App\Services\Inventaire;

use App\Models\Computer;

class ComputerDetailsService
{
    public function getDetails(Computer $computer):Computer
    {


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
            'cpu' => fn ($q) => $q
                ->select(['id', 'computer_id', 'cpu_name', 'frequence', 'nbr_cores', 'nbr_threads', 'date_mod'])
                ->orderByDesc('date_mod'),
            'ram' => fn ($q) => $q
                ->select(['id', 'computer_id', 'ram_name', 'size', 'serial', 'date_mod'])
                ->orderByDesc('date_mod'),
            'os' => fn ($q) => $q
                ->select(['id', 'computer_id', 'os_name', 'os_version_name', 'os_arch_name', 'install_date', 'date_mod'])
                ->orderByDesc('date_mod'),
        ]);

        return $computer;
    }
}
