<?php

namespace App\Services\Inventaire;

use App\Models\Computer;
use Carbon\Carbon;


class ComputerDetailsService
{
    public function getDetails(Computer $computer): Computer
    {
        $computer->load([
            'antiviruses' => fn($q) => $q
                ->select(['id', 'computer_id', 'name', 'antivirus_version', 'date_mod'])
                ->orderByDesc('date_mod')
                ->orderByDesc('id'),

            'volumes' => fn($q) => $q
                ->select([
                    'id',
                    'computer_id',
                    'name',
                    'mountpoint',
                    'total_size',
                    'free_size',
                    'free_percent',
                    'date_mod'
                ])
                ->orderBy('mountpoint')
                ->orderByDesc('date_mod'),


            'cpu' => fn($q) => $q
                ->select(['id', 'computer_id', 'cpu_name', 'frequence', 'nbr_cores', 'nbr_threads', 'date_mod'])
                ->orderByDesc('date_mod'),

            'ram' => fn($q) => $q
                ->select(['id', 'computer_id', 'ram_name', 'size', 'serial', 'date_mod'])
                ->orderByDesc('date_mod'),

            'os' => fn($q) => $q
                ->select(['id', 'computer_id', 'os_name', 'os_version_name', 'os_arch_name', 'install_date', 'date_mod'])
                ->orderByDesc('date_mod'),

            // vulnérabilités
            'vulnerabilities' => fn($q) => $q
                ->select([
                    'vulnerabilities.id',
                    'cve',
                    'severity',
                    'score',
                    'description',
                    'agent_vulnerabilities.detected_at'
                ])
                ->orderByDesc('agent_vulnerabilities.detected_at'),

            // logiciels installés
            'softwares' => fn($q) => $q
                ->select(['id', 'computer_id', 'software_name', 'version', 'date_install', 'date_mod'])
                ->orderBy('software_name')
                ->orderByDesc('date_install'),
        ]);

        // ✅ KPIs calculés en SQL (pas de chargement des 1000 vulnés en mémoire)
        $computer->security_kpis = $this->getSecurityKpis($computer);

        // ✅ Charts calculés en SQL directement
        $computer->severity_chart_current  = $this->getSeverityChart($computer, 'current');
        $computer->severity_chart_previous = $this->getSeverityChart($computer, 'previous');

        return $computer;
    }

    // ─── KPIs : COUNT en SQL, rien en PHP ────────────────────────────────────

    private function getSecurityKpis(Computer $computer): array
    {
        $base = $computer->vulnerabilities(); // query builder, pas de ->get()

        return [
            'total'         => $base->count(),
            'critical'      => (clone $base)->where('severity', 'Critical')->count(),
            'high'          => (clone $base)->where('severity', 'High')->count(),
            'last_detected' => (clone $base)->max('agent_vulnerabilities.detected_at'),
        ];
    }

    // ─── Chart : GROUP BY en SQL ──────────────────────────────────────────────

    private function getSeverityChart(Computer $computer, string $period): array
    {
        $now = Carbon::now();

        $start = $period === 'current'
            ? $now->copy()->startOfMonth()
            : $now->copy()->subMonth()->startOfMonth();

        $end = $period === 'current'
            ? $now->copy()->endOfMonth()
            : $now->copy()->subMonth()->endOfMonth();

        // Une seule requête GROUP BY au lieu de 4 COUNT séparés
        $rows = $computer->vulnerabilities()
            ->selectRaw('severity, COUNT(*) as total')
            ->whereBetween('agent_vulnerabilities.detected_at', [$start, $end])
            ->whereIn('severity', ['Critical', 'High', 'Medium', 'Low'])
            ->groupBy('severity')
            ->pluck('total', 'severity');

        // Garantir l'ordre et les 4 catégories même si certaines sont à 0
        return [
            ['name' => 'Critical', 'value' => (int) ($rows['Critical'] ?? 0)],
            ['name' => 'High',     'value' => (int) ($rows['High']     ?? 0)],
            ['name' => 'Medium',   'value' => (int) ($rows['Medium']   ?? 0)],
            ['name' => 'Low',      'value' => (int) ($rows['Low']      ?? 0)],
        ];

        return $computer;
    }
}
