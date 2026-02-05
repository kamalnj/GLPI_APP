<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerAntivirus;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Throwable;


class GlpiSyncAntiviruses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'glpi:sync-antiviruses {--batch=50}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync GLPI Antiviruses into app DB';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $client = new GlpiApi();

        try {
            $session = $client->initSession();

            $batch = max(1, (int) $this->option('batch'));
            $start = 0;

            while (true) {
                $end = $start + $batch - 1;

                $items = $client->getCollection('ComputerAntivirus', $session, [
                    'range' => "{$start}-{$end}",
                ]);
                if (empty($items)) {
                    $this->info("No more items. Finished.");
                    break;
                }
                $computerMap = Computer::query()->pluck('id', 'glpi_id');

                foreach ($items as $av) {

                    $glpiComputerId = (int) ($av['computers_id'] ?? 0);
                    if ($glpiComputerId <= 0) {
                        continue;
                    }
                    $localComputerId = $computerMap[$glpiComputerId] ?? null;
                    if (!$localComputerId) {

                        continue;
                    }
                    ComputerAntivirus::updateOrCreate(
                        ['glpi_id' => (int) $av['id']],
                        [
                            'computer_id' => (int) $localComputerId, // ✅ FK vers computers.id
                            'name' => $av['name'] ?? null,
                            'antivirus_version' => $av['antivirus_version'] ?? null,
                            'date_mod' => $av['date_mod'] ?? null,
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
