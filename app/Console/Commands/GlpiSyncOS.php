<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerOS;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Throwable;

class GlpiSyncOS extends Command
{
    protected $signature = 'glpi:sync-os {--batch=50}';
    protected $description = 'Sync GLPI OS (Item_OperatingSystem) into app DB';

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
                        'Item_OperatingSystem',
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
                        $glpiOsItemId = (int) ($item['id'] ?? 0);
                        if ($glpiOsItemId <= 0) {
                            continue;
                        }

                        $osRaw   = $item['operatingsystems_id'] ?? null;
                        $verRaw  = $item['operatingsystemversions_id'] ?? null;
                        $archRaw = $item['operatingsystemarchitectures_id'] ?? null;

                        $osName      = $this->resolveDropdownName($client, $session, 'OperatingSystem', $osRaw);
                        $versionName = $this->resolveDropdownName($client, $session, 'OperatingSystemVersion', $verRaw);
                        $archName    = $this->resolveDropdownName($client, $session, 'OperatingSystemArchitecture', $archRaw);

                        $installDate = $this->stringOrNull($item['install_date'] ?? null);
                        $dateMod     = $this->stringOrNull($item['date_mod'] ?? null);

                        ComputerOS::updateOrCreate(
                            ['glpi_id' => $glpiOsItemId],
                            [
                                'computer_id'     => (int) $computer->id,
                                'os_name'         => $osName,
                                'os_version_name' => $versionName,
                                'os_arch_name'    => $archName,
                                'install_date'    => $installDate,
                                'date_mod'        => $dateMod,
                                'synced_at'       => now(),
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
}
