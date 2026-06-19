<?php

namespace App\Console\Commands;

use App\Models\Computer;
use App\Models\ComputerRAM;
use App\Services\WazuhApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class WazuhSyncRAM extends Command
{
    protected $signature = 'wazuh:sync-ram';
    protected $description = 'Sync RAM usage from Wazuh agent by agent (update only)';

    protected WazuhApiService $wazuh;

    public function __construct(WazuhApiService $wazuh)
    {
        parent::__construct();
        $this->wazuh = $wazuh;
    }

    public function handle(): int
    {
        $this->info('Starting Wazuh RAM sync...');

        try {
            $agents = $this->wazuh->getAgents();
        } catch (\Throwable $e) {
            $this->error("Impossible de récupérer la liste des agents Wazuh : " . $e->getMessage());
            return self::FAILURE;
        }

        $updated = 0;
        $skipped = 0;

        foreach ($agents as $agent) {

            $agentId = $agent['id'] ?? null;

            if (!$agentId) {
                $skipped++;
                continue;
            }

            try {
                $hardware = $this->wazuh->getAgentHardware($agentId);
            } catch (\Throwable $e) {
                Log::warning("Impossible de récupérer le hardware pour l'agent {$agentId}: " . $e->getMessage());
                $skipped++;
                continue;
            }

            if (!$hardware || empty($hardware['ram'])) {
                $skipped++;
                continue;
            }

            $ram = $hardware['ram'];

            $computer = Computer::where('wazuh_agent_id', $agentId)->first();

            if (!$computer) {
                $skipped++;
                continue;
            }

            $computerRam = ComputerRAM::where('glpi_id', $computer->glpi_id)->first();

            if (!$computerRam) {
                Log::warning("Aucune ligne GLPI trouvée pour glpi_id {$computer->glpi_id}");
                $skipped++;
                continue;
            }

            $ramTotal = $ram['total'] ?? null;
            $ramFree  = $ram['free'] ?? null;
            $ramUsage = $ram['usage'] ?? null;

            $ramAlertLevel = $this->getRamAlertLevel($ramUsage);

            $computerRam->update([
                'ram_total'       => $ramTotal,
                'ram_free'        => $ramFree,
                'ram_usage'       => $ramUsage,
                'ram_alert_level' => $ramAlertLevel,
                'ram_synced_at'   => now(),
            ]);

            $updated++;

            usleep(200000);
        }

        $this->info("Wazuh RAM sync completed. Updated {$updated} computers, skipped {$skipped}.");

        return self::SUCCESS;
    }

    private function getRamAlertLevel(?float $usage): ?string
    {
        if ($usage === null) {
            return null;
        }

        if ($usage < 80) {
            return 'normal';
        }

        if ($usage < 90) {
            return 'alert';
        }

        return 'critical';
    }
}
