<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerVolumes;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Throwable;

class GlpiSyncVolumes extends Command
{
    protected $signature = 'glpi:sync-volumes {--batch=50}';
    protected $description = 'Sync GLPI disks (Item_Disk) into app DB';

    public function handle(): int
    {
        $client = new GlpiApi();

        try {
            $session = $client->initSession();

            $batch = max(1, (int) $this->option('batch'));

            $computers = Computer::query()
                ->select(['id', 'glpi_id'])
                ->whereNotNull('glpi_id')
                ->orderBy('id')
                ->get();

            if ($computers->isEmpty()) {
                $this->error('No computers found with glpi_id. Sync computers first.');
                $client->killSession($session);
                return self::FAILURE;
            }

            $totalUpserts = 0;

            foreach ($computers as $computer) {
                $start = 0;

                while (true) {
                    $end = $start + $batch - 1;

                    $items = $client->getSubCollection(
                        'Computer',
                        (int) $computer->glpi_id,
                        'Item_Disk',
                        $session,
                        [
                            'range' => "{$start}-{$end}",
                        ]
                    );

                    if (empty($items)) {
                        break;
                    }

                    foreach ($items as $disk) {
                        $totalSize = $this->toIntOrNull($disk['totalsize'] ?? null);
                        $freeSize  = $this->toIntOrNull($disk['freesize'] ?? null);

                        $freePercent = null;
                        if (is_int($totalSize) && $totalSize > 0 && is_int($freeSize)) {
                            $freePercent = round(($freeSize / $totalSize) * 100, 2);
                        }

                        ComputerVolumes::updateOrCreate(
                            ['glpi_id' => (int) ($disk['id'] ?? 0)],
                            [
                                'computer_id'     => (int) $computer->id, // ✅ FK local
                                'mountpoint'      => $disk['mountpoint'] ?? null,
                                'name'            => $disk['name'] ?? null,
                                'total_size'      => $totalSize,
                                'free_size'       => $freeSize,
                                'free_percent'    => $freePercent,
                                'encryption_tool' => $disk['encryption_tool'] ?? null,
                                'date_mod'        => $disk['date_mod'] ?? null,
                                'synced_at'       => now(),
                            ]
                        );

                        $totalUpserts++;
                    }

                    if (count($items) < $batch) {
                        break;
                    }

                    $start += $batch;
                }

                $this->info("Synced Item_Disk for computer glpi_id={$computer->glpi_id} (local_id={$computer->id})");
            }

            $this->info("✅ Done. Upserted volumes: {$totalUpserts}");

            $client->killSession($session);
            return self::SUCCESS;

        } catch (Throwable $e) {
            $this->error('❌ Sync failed: ' . $e->getMessage());
            report($e);
            return self::FAILURE;
        }
    }

    private function toIntOrNull(mixed $value): ?int
    {
        if (is_int($value)) return $value;
        if (is_string($value) && $value !== '' && ctype_digit($value)) return (int) $value;
        if (is_numeric($value)) return (int) $value;
        return null;
    }
}
