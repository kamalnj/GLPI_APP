<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RunAllLocalCommands extends Command
{
    protected $signature = 'local:run-all';
    protected $description = 'Exécute toutes les commandes nécessaires en local';

    public function handle()
    {
        if (!app()->environment('local')) {
            $this->error('Cette commande ne peut être exécutée qu’en local.');
            return 1;
        }

        $startTime = microtime(true);

        $this->info('Début de l’exécution des commandes locales...');

        $commands = [
            // 'glpi:sync-computers',
            // 'glpi:sync-cpu',
            // 'glpi:sync-ram',
            // 'glpi:sync-volumes',
            // 'glpi:sync-os',
            // 'glpi:sync-softwares', 
            // 'glpi:sync-antiviruses',
            'wazuh:sync-agents',
            'wazuh:link-computers',
            'wazuh:sync-ram',
            'wazuh:sync-vulns',
        ];

        foreach ($commands as $command) {
            $this->info("Exécution: php artisan $command");
            $this->call($command);
        }

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        $this->info("Temps d'exécution total: " . round($executionTime, 2) . " secondes");

        $this->info('Toutes les commandes locales ont été exécutées avec succès !');
        return 0;
    }
}