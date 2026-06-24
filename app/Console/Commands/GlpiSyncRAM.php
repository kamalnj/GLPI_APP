<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerRAM;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Throwable;

class GlpiSyncRAM extends Command
{
    protected $signature = 'glpi:sync-ram {--batch=50}';

    protected $description = 'Sync GLPI RAM (Item_DeviceMemory) into app DB';

    public function handle(): int
    {
        $client = new GlpiApi;
        $session = null;

        $batch = max(1, (int) $this->option('batch'));

        try {
            $this->info('Starting GLPI RAM sync...');
            $this->info("Batch size: {$batch}");

            $session = $client->initSession();

            if (! $session) {
                $this->error('Failed to init GLPI session');

                return self::FAILURE;
            }

            $computers = Computer::query()
                ->select(['id', 'glpi_id'])
                ->whereNotNull('glpi_id')
                ->where('glpi_id', '>', 0)
                ->orderBy('id')
                ->get();

            $this->info('Computers found: '.$computers->count());

            if ($computers->isEmpty()) {
                $this->warn('No computers found');

                return self::FAILURE;
            }

            foreach ($computers as $computer) {

                $this->info('======================================');
                $this->info("Computer ID: {$computer->id} | GLPI: {$computer->glpi_id}");

                $glpiComputerId = (int) $computer->glpi_id;
                $start = 0;

                while (true) {

                    $end = $start + $batch - 1;

                    $this->info("Fetching range: {$start}-{$end}");

                    $items = $client->getSubCollection(
                        'Computer',
                        $glpiComputerId,
                        'Item_DeviceMemory',
                        $session,
                        [
                            'range' => "{$start}-{$end}",
                            'expand_dropdowns' => 'true',
                        ]
                    );

                    // 🔥 DEBUG RAW RESPONSE
                    if (! is_array($items)) {
                        $this->error('Invalid response from GLPI');
                        dd($items);
                    }

                    $count = count($items);
                    $this->info("Items received: {$count}");

                    logger()->info('GLPI RAM batch', [
                        'computer_id' => $computer->id,
                        'glpi_id' => $glpiComputerId,
                        'range' => "{$start}-{$end}",
                        'count' => $count,
                        'items' => $items,
                    ]);

                    if ($count === 0) {
                        $this->warn('Empty batch, stopping pagination');
                        break;
                    }

                    foreach ($items as $item) {

                        $glpiRamItemId = (int) ($item['id'] ?? 0);

                        if ($glpiRamItemId <= 0) {
                            $this->warn('Invalid RAM item (no ID)');

                            continue;
                        }

                        $ramRaw = $item['devicememories_id'] ?? null;

                        $this->info('RAM raw: '.json_encode($ramRaw));

                        $ramName = $this->resolveDropdownName(
                            $client,
                            $session,
                            'DeviceMemory',
                            $ramRaw
                        );

                        if (! $ramName) {
                            $this->warn("RAM name not resolved for item {$glpiRamItemId}");

                            continue;
                        }

                        $size = $this->toIntOrZero($item['size'] ?? null);
                        $serial = $this->stringOrNull($item['serial'] ?? null);
                        $dateMod = $this->stringOrNull($item['date_mod'] ?? null);

                        $ram = ComputerRAM::updateOrCreate(
                            ['glpi_id' => $glpiRamItemId],
                            [
                                'computer_id' => (int) $computer->id,
                                'ram_name' => $ramName,
                                'size' => $size,
                                'serial' => $serial,
                                'date_mod' => $dateMod,
                                'synced_at' => now(),
                            ]
                        );

                        $this->info("Saved RAM ID {$ram->id} (GLPI {$glpiRamItemId})");
                    }

                    if ($count < $batch) {
                        $this->info('Last batch reached, stopping pagination');
                        break;
                    }

                    $start += $batch;
                }
            }

            $this->info('SYNC FINISHED SUCCESSFULLY');

            return self::SUCCESS;

        } catch (Throwable $e) {
            $this->error('ERROR: '.$e->getMessage());
            report($e);

            return self::FAILURE;

        } finally {
            if (is_string($session) && $session !== '') {
                try {
                    $client->killSession($session);
                    $this->info('GLPI session closed');
                } catch (Throwable $e) {
                    $this->warn('Failed to close GLPI session');
                }
            }
        }
    }

    private function resolveDropdownName(GlpiApi $client, string $session, string $itemtype, mixed $value): ?string
    {
        if (is_string($value)) {
            $value = trim($value);

            return $value === '' ? null : $value;
        }

        $id = $this->toIntOrZero($value);

        if ($id <= 0) {
            return null;
        }

        $item = $client->getItem($itemtype, $id, $session);

        $name = $item['name'] ?? null;

        return is_string($name) && trim($name) !== ''
            ? trim($name)
            : null;
    }

    private function stringOrNull(mixed $v): ?string
    {
        if (! is_string($v)) {
            return null;
        }

        $v = trim($v);

        return $v === '' ? null : $v;
    }

    private function toIntOrZero(mixed $v): int
    {
        if (is_int($v)) {
            return $v;
        }

        if (is_string($v) && ctype_digit($v)) {
            return (int) $v;
        }

        if (is_numeric($v)) {
            return (int) $v;
        }

        return 0;
    }
}
