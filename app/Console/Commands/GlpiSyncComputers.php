<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Services\GlpiApi;
use App\Services\GlpiClient;
use Illuminate\Console\Command;
use Throwable;

class GlpiSyncComputers extends Command
{
    protected $signature = 'glpi:sync-computers {--batch=50}';
    protected $description = 'Sync GLPI Computers into app DB';

    public function handle(): int
    {
        $client = new GlpiApi();

        try {
            $session = $client->initSession();

            $batch = max(1, (int) $this->option('batch'));
            $start = 0;

            while (true) {
                $end = $start + $batch - 1;

                $items = $client->getCollection('Computer', $session, [
                    'range' => "{$start}-{$end}",
                    'expand_dropdowns' => 'true',
                ]);

                if (empty($items)) {
                    $this->info("No more items. Finished.");
                    break;
                }

                foreach ($items as $pc) {

                    Computer::updateOrCreate(
                        ['glpi_id' => (int) $pc['id']],
                        [
                            'name' => $pc['name'] ?? null,
                            'contact' => $pc['contact'] ?? null,
                            'last_inventory_update' => $pc['last_inventory_update'] ?? null,
                            'synced_at' => now(),
                        ]
                    );
                }

                $this->info("Synced Computer range {$start}-{$end} (count=" . count($items) . ")");
                if (count($items) < $batch) {
                    $this->info("Last batch received (" . count($items) . " < {$batch}). Finished.");
                    break;
                }
                $start += $batch;
            }

            $client->killSession($session);

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('❌ Sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
