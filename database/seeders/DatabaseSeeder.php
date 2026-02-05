<?php

namespace Database\Seeders;

use App\Models\Computer;
use Illuminate\Database\Seeder;
use App\Models\ComputerAntivirus;
use App\Models\ComputerVolumes;



class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ❌ Sécurité : jamais de fake data en prod
        if (app()->environment('production')) {
            return;
        }

        // Évite les doublons si le seeder est relancé
        $existing = Computer::where('glpi_id', '>=', 1000)->count();
        if ($existing > 0) {
            return;
        }

        for ($i = 1; $i <= 50; $i++) {
            Computer::create([
                'glpi_id' => 1000 + $i, // fake GLPI id
                'name' => "DEV-PC-{$i}",
                'contact' => "user{$i}",
                'last_inventory_update' => now()->subDays(rand(0, 10)),
                'synced_at' => now(),
            ]);
        }

        foreach (Computer::all() as $computer) {
    ComputerAntivirus::create([
        'glpi_id' => rand(10000, 99999),
        'computer_id' => $computer->id,
        'name' => rand(0, 1) ? 'Sophos Intercept X' : 'Windows Defender',
        'antivirus_version' => '1.' . rand(0, 9) . '.0',
        'date_mod' => now(),
        'synced_at' => now(),
    ]);
}
foreach (Computer::all() as $computer) {
    $total = rand(120, 1024);
    $free  = rand(5, $total - 1);

    ComputerVolumes::create([
        'glpi_id' => rand(100000, 999999),
        'computer_id' => $computer->id,
        'name' => 'Local Disk',
        'mountpoint' => 'C:',
        'total_size' => $total,
        'free_size' => $free,
        'free_percent' => round(($free / $total) * 100, 2),
        'synced_at' => now(),
    ]);
}


    }
}
