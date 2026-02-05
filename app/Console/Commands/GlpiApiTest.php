<?php

namespace App\Console\Commands;

use App\Services\GlpiApi;
use App\Services\GlpiClient;
use Illuminate\Console\Command;
use Throwable;

class GlpiApiTest extends Command
{
    protected $signature = 'glpi:test-api';
    protected $description = 'Test GLPI API initSession + simple GET + killSession';

    public function handle(): int
    {
        $client = new GlpiApi();

        try {
            $session = $client->initSession();
            $this->info('✅ initSession OK');

            $computers = $client->getCollection('Computer', $session, [
                'range' => '0-0',
                'expand_dropdowns' => 'true',
            ]);

            $this->info('✅ GET Computer OK (count=' . count($computers) . ')');

            $client->killSession($session);
            $this->info('✅ killSession OK');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('❌ API test failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
