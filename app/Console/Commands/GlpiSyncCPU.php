<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerCPU;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Throwable;

class GlpiSyncCPU extends Command
{
    protected $signature = 'glpi:sync-cpu {--batch=50}';
    protected $description = 'Sync GLPI CPU (Item_DeviceProcessor) into app DB';

    public function handle(): int
    {
        $client = new GlpiApi();
        $session = null;

        $batch = max(1, (int) $this->option('batch'));

        try {
            $session = $client->initSession();

            $computers = Computer::query()
                ->select(['id', 'glpi_id'])
                ->whereNotNull('glpi_id')
                ->where('glpi_id', '>', 0)
                ->orderBy('id')
                ->get();

            if ($computers->isEmpty()) {
                return self::FAILURE;
            }

            foreach ($computers as $computer) {
                $glpiComputerId = (int) $computer->glpi_id;

                $start = 0;

                while (true) {
                    $end = $start + $batch - 1;

                    $items = $client->getSubCollection(
                        'Computer',
                        $glpiComputerId,
                        'Item_DeviceProcessor',
                        $session,
                        [
                            'range' => "{$start}-{$end}",
                            'expand_dropdowns' => 'true',
                        ]
                    );

                    if (empty($items)) {
                        break;
                    }

                    foreach ($items as $item) {
                        $glpiCpuItemId = (int) ($item['id'] ?? 0);
                        if ($glpiCpuItemId <= 0) {
                            continue;
                        }

                        $cpuRaw  = $item['deviceprocessors_id'] ?? null;
                        $cpuName = $this->resolveDropdownName($client, $session, 'DeviceProcessor', $cpuRaw);
                        $cpuTier = $this->detectCpuTier($cpuName);


                        if (!$cpuName) {
                            continue;
                        }

                        $frequence  = $this->toIntOrZero($item['frequency'] ?? null);
                        $nbrCores   = $this->toIntOrZero($item['nbcores'] ?? null);
                        $nbrThreads = $this->toIntOrZero($item['nbthreads'] ?? null);
                        $dateMod    = $this->stringOrNull($item['date_mod'] ?? null);

                        ComputerCPU::updateOrCreate(
                            ['glpi_id' => $glpiCpuItemId],
                            [
                                'computer_id' => (int) $computer->id,
                                'cpu_name'    => $cpuName,
                                'frequence'   => $frequence,
                                'nbr_cores'   => $nbrCores,
                                'nbr_threads' => $nbrThreads,
                                'date_mod'    => $dateMod,
                                'synced_at'   => now(),
                                'cpu_tier' => $cpuTier,

                            ]
                        );
                    }

                    if (count($items) < $batch) {
                        break;
                    }

                    $start += $batch;
                }
            }

            return self::SUCCESS;

        } catch (Throwable $e) {
            report($e);
            return self::FAILURE;

        } finally {
            if (is_string($session) && $session !== '') {
                try {
                    $client->killSession($session);
                } catch (Throwable $e) {
                    // ignore
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

        return is_string($name) && trim($name) !== '' ? trim($name) : null;
    }

    private function stringOrNull(mixed $v): ?string
    {
        if (!is_string($v)) return null;
        $v = trim($v);
        return $v === '' ? null : $v;
    }

    private function toIntOrZero(mixed $v): int
    {
        if (is_int($v)) return $v;
        if (is_string($v) && ctype_digit($v)) return (int) $v;
        if (is_numeric($v)) return (int) $v;
        return 0;
    }
    private function detectCpuTier(?string $cpuName): ?string
{
    if (!is_string($cpuName) || trim($cpuName) === '') return null;

    $s = strtolower($cpuName);

    // Intel Core i3/i5/i7/i9
    if (preg_match('/\bi\s*(3|5|7|9)\b/', $s, $m)) {
        return 'i' . $m[1];
    }

    // AMD Ryzen 3/5/7/9
    if (preg_match('/\bryzen\s*(3|5|7|9)\b/', $s, $m)) {
        return 'ryzen' . $m[1];
    }

    // Xeon (optionnel)
    if (str_contains($s, 'xeon')) return 'xeon';

    return 'other';
}

}
