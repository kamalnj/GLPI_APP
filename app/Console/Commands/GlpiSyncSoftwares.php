<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerPatchSecurity;
use App\Models\SoftwareApplication;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Throwable;

class GlpiSyncSoftwares extends Command
{
    protected $signature   = 'glpi:sync-softwares {--batch=100}';
    protected $description = 'Sync GLPI Softwares (application & security_update) per Computer into app DB';

    // Cache inter-machines : évite de rappeler l'API pour les mêmes logiciels
    private array $svCache = []; // svId  → ['software_id', 'version']
    private array $swCache = []; // swId  → ['category', 'name']

    // Taille max du batch pour getMultipleItems
    private int $multiBatch = 50;

    public function handle(): int
    {
        $client = new GlpiApi();

        try {
            $session = $client->initSession();

            $batch = max(1, (int) $this->option('batch'));

            $computers = Computer::query()
                ->select(['id', 'glpi_id', 'name'])
                ->whereNotNull('glpi_id')
                ->orderBy('id')
                ->get();

            if ($computers->isEmpty()) {
                $this->warn('No computers found in local DB.');
                $client->killSession($session);
                return self::FAILURE;
            }

            $totalApp   = 0;
            $totalPatch = 0;

            foreach ($computers as $computer) {

                $start      = 0;
                $allItems   = [];

                // ---------------------------------------------------------
                // Étape 1 : collecter TOUS les Item_SoftwareVersion
                //           de cette machine (pagination complète)
                // ---------------------------------------------------------
                while (true) {
                    $end = $start + $batch - 1;

                    try {
                        $page = $client->getSubCollection(
                            'Computer',
                            (int) $computer->glpi_id,
                            'Item_SoftwareVersion',
                            $session,
                            ['range' => "{$start}-{$end}"]
                        );
                    } catch (Throwable $e) {
                        $this->warn("⚠️  SubCollection failed for [{$computer->name}] : " . $e->getMessage());
                        break;
                    }

                    if (empty($page)) {
                        break;
                    }

                    $allItems = array_merge($allItems, $page);

                    if (count($page) < $batch) {
                        break;
                    }

                    $start += $batch;
                }

                if (empty($allItems)) {
                    $this->info("Computer [{$computer->name}] — app: 0 | patch: 0");
                    continue;
                }

                // ---------------------------------------------------------
                // Étape 2 : résoudre les SoftwareVersions manquantes
                //           en batch (getMultipleItems)
                // ---------------------------------------------------------
                $svIds = array_values(array_unique(array_filter(
                    array_map(fn($item) => (int) ($item['softwareversions_id'] ?? 0), $allItems)
                )));

                $uncachedSvIds = array_values(array_filter(
                    $svIds, fn($id) => !isset($this->svCache[$id])
                ));

                if (!empty($uncachedSvIds)) {
                    $this->fetchMultipleSoftwareVersions($client, $session, $uncachedSvIds);
                }

                // ---------------------------------------------------------
                // Étape 3 : résoudre les Softwares manquants en batch
                // ---------------------------------------------------------
                $swIds = array_values(array_unique(array_filter(
                    array_map(fn($svId) => $this->svCache[$svId]['software_id'] ?? 0, $svIds)
                )));

                $uncachedSwIds = array_values(array_filter(
                    $swIds, fn($id) => !isset($this->swCache[$id])
                ));

                if (!empty($uncachedSwIds)) {
                    $this->fetchMultipleSoftwares($client, $session, $uncachedSwIds);
                }

                // ---------------------------------------------------------
                // Étape 4 : insérer en DB
                // ---------------------------------------------------------
                $countApp   = 0;
                $countPatch = 0;

                foreach ($allItems as $item) {
                    $svId = (int) ($item['softwareversions_id'] ?? 0);

                    if (!$svId || !isset($this->svCache[$svId])) {
                        continue;
                    }

                    $sv       = $this->svCache[$svId];
                    $swId     = $sv['software_id'] ?? 0;

                    if (!$swId || !isset($this->swCache[$swId])) {
                        continue;
                    }

                    $sw           = $this->swCache[$swId];
                    $category     = $sw['category'];
                    $itemSvId     = (int) ($item['id'] ?? $svId);
                    $dateInstall  = $item['date_install'] ?? null;
                    $dateMod      = $item['date_mod']     ?? null;

                    if ($category === 'application') {
                        SoftwareApplication::updateOrCreate(
                            ['glpi_item_softwareversion_id' => $itemSvId],
                            [
                                'glpi_softwareversion_id' => $svId,
                                'glpi_software_id'        => $swId,
                                'computer_id'             => $computer->id,
                                'software_name'           => $sw['name'],
                                'version'                 => $sv['version'],
                                'date_install'            => $dateInstall,
                                'date_mod'                => $dateMod,
                                'synced_at'               => now(),
                            ]
                        );
                        $countApp++;
                        $totalApp++;
                    }

                    if ($category === 'security_update') {
                        ComputerPatchSecurity::updateOrCreate(
                            ['glpi_item_softwareversion_id' => $itemSvId],
                            [
                                'glpi_softwareversion_id' => $svId,
                                'glpi_software_id'        => $swId,
                                'computer_id'             => $computer->id,
                                'patch_name'              => $sw['name'],
                                'version'                 => $sv['version'],
                                'date_install'            => $dateInstall,
                                'date_mod'                => $dateMod,
                                'synced_at'               => now(),
                            ]
                        );
                        $countPatch++;
                        $totalPatch++;
                    }
                }

                $this->info("Computer [{$computer->name}] — app: {$countApp} | patch: {$countPatch}");
            }

            $client->killSession($session);

            $this->info("✅ Done. Applications: {$totalApp} | Security patches: {$totalPatch}");
            $this->info("   Cache — SoftwareVersion: " . count($this->svCache) . " | Software: " . count($this->swCache));

            return self::SUCCESS;

        } catch (Throwable $e) {
            $this->error('❌ Sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    // -------------------------------------------------------------------------
    // Résout une liste de SoftwareVersion IDs via getMultipleItems (en chunks)
    // -------------------------------------------------------------------------
    private function fetchMultipleSoftwareVersions(GlpiApi $client, string $session, array $ids): void
    {
        foreach (array_chunk($ids, $this->multiBatch) as $chunk) {
            try {
                $items = $client->getMultipleItems('SoftwareVersion', $chunk, $session);

                foreach ($items as $sv) {
                    $svId = (int) ($sv['id'] ?? 0);
                    if (!$svId) {
                        continue;
                    }

                    $softwareId = (int) ($sv['softwares_id'] ?? 0);
                    if (!$softwareId) {
                        $softwareId = $this->extractIdFromLinks($sv['links'] ?? [], 'Software');
                    }

                    $this->svCache[$svId] = [
                        'software_id' => $softwareId,
                        'version'     => $sv['name'] ?? null,
                    ];
                }
            } catch (Throwable $e) {
                // Fallback : appels individuels si getMultipleItems échoue
                foreach ($chunk as $svId) {
                    try {
                        $sv = $client->getItem('SoftwareVersion', $svId, $session, []);
                        if (empty($sv)) {
                            continue;
                        }
                        $softwareId = (int) ($sv['softwares_id'] ?? 0);
                        if (!$softwareId) {
                            $softwareId = $this->extractIdFromLinks($sv['links'] ?? [], 'Software');
                        }
                        $this->svCache[$svId] = [
                            'software_id' => $softwareId,
                            'version'     => $sv['name'] ?? null,
                        ];
                    } catch (Throwable) {
                        // ne pas skiper
                        $this->error("❌ Failed to fetch SoftwareVersion [{$svId}]");
                    }
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Résout une liste de Software IDs via getMultipleItems (en chunks)
    // -------------------------------------------------------------------------
    private function fetchMultipleSoftwares(GlpiApi $client, string $session, array $ids): void
    {
        foreach (array_chunk($ids, $this->multiBatch) as $chunk) {
            try {
                $items = $client->getMultipleItems('Software', $chunk, $session, [
                    'expand_dropdowns' => 'true',
                ]);

                foreach ($items as $sw) {
                    $swId = (int) ($sw['id'] ?? 0);
                    if (!$swId) {
                        continue;
                    }

                    $this->swCache[$swId] = [
                        'category' => strtolower((string) ($sw['softwarecategories_id'] ?? '')),
                        'name'     => $sw['name'] ?? null,
                    ];
                }
            } catch (Throwable $e) {
                // Fallback : appels individuels
                foreach ($chunk as $swId) {
                    try {
                        $sw = $client->getItem('Software', $swId, $session, [
                            'expand_dropdowns' => 'true',
                        ]);
                        if (empty($sw)) {
                            continue;
                        }
                        $this->swCache[$swId] = [
                            'category' => strtolower((string) ($sw['softwarecategories_id'] ?? '')),
                            'name'     => $sw['name'] ?? null,
                        ];
                    } catch (Throwable) {
                        // skip
                    }
                }
            }
        }
    }

    private function extractIdFromLinks(array $links, string $rel): ?int
    {
        foreach ($links as $link) {
            if (($link['rel'] ?? '') === $rel) {
                $parts = explode('/', rtrim($link['href'], '/'));
                $id    = (int) end($parts);
                return $id > 0 ? $id : null;
            }
        }
        return null;
    }
}