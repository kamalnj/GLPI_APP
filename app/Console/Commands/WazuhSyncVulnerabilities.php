<?php

namespace App\Console\Commands;

use App\Models\Agents;
use App\Models\AgentVulne;
use App\Models\Vulnerabilite;
use App\Services\WazuhIndexerService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class WazuhSyncVulnerabilities extends Command
{
    // Commande artisan
    protected $signature = 'wazuh:sync-vulns';

    // Description affichée dans php artisan list
    protected $description =
        'Synchronise les vulnérabilités depuis Wazuh';

    /**
     * Date de début du cycle de synchronisation.
     *
     * Sert à identifier quelles vulnérabilités
     * ont été vues pendant CE scan.
     */
    private Carbon $syncStartedAt;

    public function handle(WazuhIndexerService $service)
    {
        /**
         * On sauvegarde l'heure exacte du lancement.
         *
         * Toutes les vulnérabilités rencontrées
         * recevront ce timestamp dans last_seen_at.
         *
         * À la fin :
         * - si last_seen_at == syncStartedAt → toujours active
         * - sinon → considérée résolue
         */
        $this->syncStartedAt = now();

        $this->info('=== Sync Wazuh Vulnerabilities ===');

        /**
         * Récupérer la dernière date connue
         * pour éviter de rescanner toute l'historique.
         */
        $lastSync = $this->getLastSyncDate();

        $this->line("Sync since: {$lastSync}");

        /**
         * Appel initial vers Wazuh.
         * Retourne :
         * - première page
         * - scroll_id pour récupérer le reste
         */
        $response = $service->incremental($lastSync);

        /**
         * Validation de la réponse.
         */
        if (
            isset($response['error']) ||
            ! isset($response['hits'])
        ) {
            $this->error(
                'Erreur récupération Wazuh'
            );

            return self::FAILURE;
        }

        $scrollId =
            $response['_scroll_id']
            ?? null;

        $hits =
            $response['hits']['hits']
            ?? [];

        $synced = 0;
        $skipped = 0;
        $page = 1;

        /**
         * Boucle de pagination Elasticsearch.
         *
         * Continue tant qu'il existe
         * encore des pages à lire.
         */
        while (true) {

            if (! empty($hits)) {

                foreach ($hits as $hit) {

                    /**
                     * Synchroniser une vulnérabilité.
                     */
                    if (
                        $this->processHit(
                            $hit['_source']
                        )
                    ) {
                        $synced++;
                    } else {
                        $skipped++;
                    }
                }

                $this->line(
                    "Page {$page} → {$synced}"
                );
            }

            /**
             * Fin de pagination.
             */
            if (
                ! $scrollId ||
                empty($hits)
            ) {
                break;
            }

            /**
             * Pause pour éviter surcharge
             * Elasticsearch / circuit breaker.
             */
            usleep(500000);

            $next =
                $service->scroll(
                    $scrollId
                );

            /**
             * Si erreur scroll :
             * arrêter proprement.
             */
            if (
                isset(
                    $next['error']
                )
            ) {

                $this->warn(
                    'Scroll interrompu'
                );

                break;
            }

            $hits =
                $next['hits']['hits']
                ?? [];

            $scrollId =
                $next['_scroll_id']
                ?? null;

            $page++;
        }

        /**
         * Étape importante :
         *
         * Toute vulnérabilité ACTIVE
         * qui n'a PAS été revue
         * pendant ce scan devient :
         *
         * active = false
         * resolved_at = maintenant
         *
         * Exemple :
         *
         * Scan précédent :
         * PC1 → CVE-001
         *
         * Scan actuel :
         * PC1 → (plus rien)
         *
         * => CVE-001 résolue
         */
        $resolved =
            AgentVulne::query()
                ->where(
                    'active',
                    true
                )
                ->where(function ($q) {

                    $q->whereNull(
                        'last_seen_at'
                    )
                        ->orWhere(
                            'last_seen_at',
                            '<',
                            $this->syncStartedAt
                        );
                })
                ->update([
                    'active' => false,

                    'resolved_at' => now(),
                ]);

        $this->info(
            "Done → Synced={$synced}, Resolved={$resolved}"
        );

        return self::SUCCESS;
    }

    /**
     * Retourne la dernière date de détection.
     *
     * Permet de faire
     * une synchronisation incrémentale.
     */
    private function getLastSyncDate(): string
    {
        $last =
            AgentVulne::max(
                'detected_at'
            );

        if ($last) {

            return Carbon::parse(
                $last
            )
                ->utc()
                ->toIso8601ZuluString();
        }

        /**
         * Premier lancement :
         * prendre les 30 derniers jours.
         */
        return now()
            ->subDays(30)
            ->utc()
            ->toIso8601ZuluString();
    }

    /**
     * Synchronise UNE vulnérabilité.
     */
    private function processHit(
        array $data
    ): bool {

        /**
         * Trouver l'agent local.
         */
        $agent =
            Agents::where(
                'wazuh_agent_id',
                $data['agent']['id']
            )->first();

        if (! $agent) {

            $this->warn(
                'Agent absent'
            );

            return false;
        }

        /**
         * Créer ou mettre à jour
         * le catalogue CVE.
         */
        $vuln =
            Vulnerabilite::updateOrCreate(
                [
                    'cve' => $data['vulnerability']['id'],
                ],
                [
                    'severity' => $data['vulnerability']['severity']
                        ?? null,

                    'score' => $data['vulnerability']['score']['base']
                        ?? null,

                    'description' => $data['vulnerability']['description']
                        ?? null,
                ]
            );

        /**
         * Associer l'agent
         * à la vulnérabilité.
         *
         * Si elle existait :
         * réactivation automatique.
         */
        AgentVulne::updateOrCreate(
            [
                'agent_id' => $agent->id,

                'vulnerability_id' => $vuln->id,
            ],
            [
                'package' => $data['package']['name']
                    ?? null,

                'package_version' => $data['package']['version']
                    ?? null,

                'detected_at' => Carbon::parse(
                    $data['vulnerability']['detected_at']
                ),

                'last_seen_at' => $this->syncStartedAt,

                'active' => true,

                'resolved_at' => null,
            ]
        );

        return true;
    }
}
