<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Computer;
use App\Services\Inventaire\ComputerDetailsService;
use Inertia\Inertia;
use Inertia\Response;

class ComputerDetailsController extends Controller
{
    public function show(
        Computer $computer,
        ComputerDetailsService $service
    ): Response {
        $computer = $service->getDetails($computer);

        return Inertia::render('Inventaire/Details', [

            // ── Données légères : chargées immédiatement ──────────────────────
            'computer' => [
                'id'                      => $computer->id,
                'name'                    => $computer->name,
                'contact'                 => $computer->contact,
                'last_inventory_update'   => $computer->last_inventory_update,
                'cpu'                     => $computer->cpu,
                'ram'                     => $computer->ram,
                'os'                      => $computer->os,
                'antiviruses'             => $computer->antiviruses,
                'volumes'                 => $computer->volumes,
                'security_kpis'           => $computer->security_kpis,
                'severity_chart_current'  => $computer->severity_chart_current,
                'severity_chart_previous' => $computer->severity_chart_previous,

                // ── Données lourdes : chargées uniquement si demandées ────────

                // ✅ Lazy + non paginé : les vulnérabilités sont au format JSON mais ne sont pas chargées tant que l'utilisateur ne clique pas sur l'onglet
                'vulnerabilities' => Inertia::lazy(
                    fn() => $computer->vulnerabilities()
                        ->select([
                            'vulnerabilities.id',
                            'cve',
                            'severity',
                            'score',
                            'description',
                            'agent_vulnerabilities.detected_at',
                        ])
                        ->orderByDesc('agent_vulnerabilities.detected_at')
                        ->get()
                ),

                // ✅ Lazy + non paginé : les logiciels sont au format JSON mais ne sont pas chargés tant que l'utilisateur ne clique pas sur l'onglet
                'softwares' => Inertia::lazy(
                    fn() => $computer->softwares()
                        ->select(['id', 'computer_id', 'software_name', 'version', 'date_install'])
                        ->orderBy('software_name')
                        ->get()
                ),
            ],
        ]);
    }
}