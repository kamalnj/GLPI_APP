<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerPatchSecurity;
use App\Services\GlpiApi;
use Illuminate\Console\Command;
use Carbon\Carbon;
use Throwable;

class GlpiSyncUpdateSecurity extends Command
{
    protected $signature = 'glpi:sync-security-patch {--batch=100}';
    protected $description = 'Sync GLPI security patches (>30 days) into computer_patch_securite';

    public function handle(): int
    {
        $client = new GlpiApi();
        $session = null;

        try {

            $session = $client->initSession();
            $this->info("Session started");

            // 1️⃣ Get security SOFTWARE ids (category = 5)
            $securitySoftwareIds = $this->getSecuritySoftwareIds($client, $session);

            if (empty($securitySoftwareIds)) {
                $this->error('No security softwares found.');
                return self::FAILURE;
            }

            // 2️⃣ Get security SOFTWARE VERSION ids
            $securitySoftwareVersionIds = $this->getSecuritySoftwareVersionIds(
                $client,
                $session,
                $securitySoftwareIds
            );

            if (empty($securitySoftwareVersionIds)) {
                $this->error('No security software versions found.');
                return self::FAILURE;
            }

            // 3️⃣ Get all installations
            $installations = $this->getAllInstallations($client, $session);

            if (empty($installations)) {
                $this->error('No installations found.');
                return self::FAILURE;
            }

            $dateLimit = Carbon::now()->subDays(30);

            foreach ($installations as $item) {

                $itemId = (int) ($item['id'] ?? 0);
                $computerGlpiId = (int) ($item['items_id'] ?? 0);
                $softwareVersionId = (int) ($item['softwareversions_id'] ?? 0);
                $dateInstall = $item['date_install'] ?? null;

                if (
                    $itemId <= 0 ||
                    $computerGlpiId <= 0 ||
                    $softwareVersionId <= 0 ||
                    !$dateInstall
                ) {
                    continue;
                }

                // ✅ CORRECT FILTER
                if (!in_array($softwareVersionId, $securitySoftwareVersionIds)) {
                    continue;
                }

                // Filter > 30 days
                if (Carbon::parse($dateInstall)->greaterThan($dateLimit)) {
                    continue;
                }

                $this->line("Matched computer={$computerGlpiId} version={$softwareVersionId}");

                $computer = Computer::where('glpi_id', $computerGlpiId)->first();

                if (!$computer) {
                    continue;
                }

                ComputerPatchSecurity::updateOrCreate(
                    [
                        'glpi_item_softwareversion_id' => $itemId,
                    ],
                    [
                        'glpi_softwareversion_id' => $softwareVersionId,
                        'computer_id' => $computer->id,
                        'patch_name' => $this->getPatchName($client, $session, $softwareVersionId),
                        'date_install' => $dateInstall,
                        'synced_at' => now(),
                    ]
                );
            }

            return self::SUCCESS;

        } catch (Throwable $e) {
            report($e);
            return self::FAILURE;

        } finally {
            if ($session) {
                try {
                    $client->killSession($session);
                } catch (Throwable $e) {}
            }
        }
    }

    private function getSecuritySoftwareIds($client, $session): array
    {
        $this->info('Fetching security softwares (category=5)...');

        $response = $client->search('Software', $session, [
            'criteria' => [
                [
                    'field' => 62,
                    'searchtype' => 'equals',
                    'value' => 5
                ]
            ],
            'range' => '0-9999'
        ]);

        return collect($response['data'] ?? [])
            ->pluck('2') // ID field
            ->map(fn($id) => (int) $id)
            ->toArray();
    }

  private function getSecuritySoftwareVersionIds($client, $session, array $softwareIds): array
{
    $this->info('Fetching security software versions...');

    if (empty($softwareIds)) {
        return [];
    }

    $criteria = [];

    foreach ($softwareIds as $index => $softwareId) {
        $criteria[] = [
            'field' => 3, // softwares_id
            'searchtype' => 'equals',
            'value' => $softwareId,
            'link' => $index === 0 ? 'AND' : 'OR'
        ];
    }

    $response = $client->search('SoftwareVersion', $session, [
        'criteria' => $criteria,
        'range' => '0-9999'
    ]);

    $data = $response['data'] ?? [];

    $this->info('Found ' . count($data) . ' security software versions');

    return collect($data)
        ->pluck('2') // ID
        ->map(fn($id) => (int) $id)
        ->toArray();
}

    private function getAllInstallations($client, $session): array
    {
        $this->info('Fetching all software installations...');

        $response = $client->search('Item_SoftwareVersion', $session, [
            'range' => '0-9999'
        ]);

        return array_values($response['data'] ?? []);
    }

    private function getPatchName($client, $session, int $softwareVersionId): ?string
    {
        if ($softwareVersionId <= 0) return null;

        $item = $client->getItem('SoftwareVersion', $softwareVersionId, $session);

        return $item['name'] ?? null;
    }
}