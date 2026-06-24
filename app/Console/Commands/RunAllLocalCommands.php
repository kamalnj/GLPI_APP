<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RunAllLocalCommands extends Command
{
    protected $signature = 'prod:run-all';

    protected $description = 'Exécute toutes les commandes nécessaires en production';

    public function handle()
    {
        if (! app()->environment('production')) {
            $this->error('Cette commande ne peut être exécutée qu\'en production.');

            return 1;
        }

        $startTime = microtime(true);

        $this->info('Début de l\'exécution des commandes...');

        $commands = [
            'glpi:sync-computers',
            'glpi:sync-cpu',
            'glpi:sync-ram',
            'glpi:sync-volumes',
            'glpi:sync-os',
            'glpi:sync-softwares',
            'glpi:sync-antiviruses',
            'wazuh:sync-agents',
            'wazuh:link-computers',
            'wazuh:sync-vulns',
        ];

        foreach ($commands as $command) {
            $this->info("Exécution: php artisan $command");
            $this->call($command);
        }

        // ✅ Post-sync : cache automatique
        $this->newLine();
        $this->info('🧹 Nettoyage du cache...');
        $this->call('optimize:clear');

        $this->info('⚡ Reconstruction du cache...');
        $this->call('optimize');

        $endTime = microtime(true);
        $executionTime = round($endTime - $startTime, 2);

        $this->newLine();
        $this->info('✅ Toutes les commandes exécutées avec succès !');
        $this->info("⏱️  Temps total : {$executionTime} secondes");

        return 0;
    }
}
