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
        ]);

        // récupérer les vulnérabilités
        $vulns = $computer->vulnerabilities ?? collect();

        // KPIs sécurité
        $computer->security_kpis = [
            'total' => $vulns->count(),
            'critical' => $vulns->where('severity', 'Critical')->count(),
            'high' => $vulns->where('severity', 'High')->count(),
            'last_detected' => $vulns->max('detected_at'),
        ];


// ce mois
$vulnsCurrent = $vulns->filter(fn($v) => Carbon::parse($v->detected_at)->month === Carbon::now()->month);

// mois précédent
$vulnsPrevious = $vulns->filter(fn($v) => Carbon::parse($v->detected_at)->month === Carbon::now()->subMonth()->month);

// PieChart "ce mois"
$computer->severity_chart_current = [
    ['name' => 'Critical', 'value' => $vulnsCurrent->where('severity', 'Critical')->count()],
    ['name' => 'High', 'value' => $vulnsCurrent->where('severity', 'High')->count()],
    ['name' => 'Medium', 'value' => $vulnsCurrent->where('severity', 'Medium')->count()],
    ['name' => 'Low', 'value' => $vulnsCurrent->where('severity', 'Low')->count()],
];

// PieChart "mois précédent"
$computer->severity_chart_previous = [
    ['name' => 'Critical', 'value' => $vulnsPrevious->where('severity', 'Critical')->count()],
    ['name' => 'High', 'value' => $vulnsPrevious->where('severity', 'High')->count()],
    ['name' => 'Medium', 'value' => $vulnsPrevious->where('severity', 'Medium')->count()],
    ['name' => 'Low', 'value' => $vulnsPrevious->where('severity', 'Low')->count()],
];

       
        return $computer;
    }
}
