import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AntivirusTable from '@/components/inventaire/AntivirusTable';
import VolumesTable from '@/components/inventaire/VolumesTable';
import { JSX, useState } from 'react';
import {
    FiCpu,
    FiDatabase,
    FiShield,
    FiHardDrive,
    FiMonitor,
    FiArrowLeft,
    FiAlertTriangle,
    FiAlertOctagon,
    FiClock,
    FiLayers,
    FiChevronRight,
    FiExternalLink,
} from 'react-icons/fi';
import type { BreadcrumbItem } from '@/types';
import VulnerabilitySeverityChart from '@/components/inventaire/VulnerabilityChart';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaire', href: '/inventaire' },
    { title: 'Détails', href: '' },
];

type Antivirus = {
    id: number;
    name: string | null;
    antivirus_version: string | null;
    date_mod: string | null;
};
type Volume = {
    id: number;
    name: string | null;
    mountpoint: string | null;
    total_size: number | null;
    free_size: number | null;
    free_percent: number | null;
    encryption_tool: string | null;
    date_mod: string | null;
};
type CPU = {
    cpu_name: string | null;
    frequence: string | null;
    nbr_cores: number | null;
    nbr_threads: number | null;
};
type RAM = {
    ram_name: string | null;
    size: number | null;
    serial: string | null;
};
type OS = {
    os_name: string | null;
    os_version_name: string | null;
    os_arch_name: string | null;
    install_date: string | null;
};
type Vulnerability = {
    id: number;
    cve: string | null;
    severity: string | null;
    score: number | null;
    description: string | null;
    detected_at: string | null;
};

type Computer = {
    id: number;
    name: string | null;
    contact: string | null;
    last_inventory_update: string | null;
    cpu?: CPU[] | null;
    ram?: RAM[] | null;
    os?: OS[] | null;
    antiviruses: Antivirus[];
    volumes: Volume[];
    vulnerabilities?: Vulnerability[];
    security_kpis: {
        total: number;
        critical: number;
        high: number;
        last_detected: string | null;
    };
    severity_chart: {
        name: string;
        value: number;
    }[];
    disk_chart?: {
        name: string;
        value: number;
    }[] | null;
};

type PageProps = { computer: Computer };
type Section = { id: string; title: string; icon: JSX.Element; count?: number };

const severityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
    HIGH:     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-400' },
    MEDIUM:   { label: 'Medium',   color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400' },
    LOW:      { label: 'Low',      color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-400' },
    INFO:     { label: 'Info',     color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-400' },
};

function SeverityBadge({ severity }: { severity: string | null }) {
    const cfg = severityConfig[severity?.toUpperCase() ?? ''] ?? severityConfig['INFO'];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function ScoreBar({ score }: { score: number | null }) {
    if (score === null) return <span className="text-gray-400 text-xs">—</span>;
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    const pct = Math.min((numScore / 10) * 100, 100);
    const color = numScore >= 9 ? 'bg-red-500' : numScore >= 7 ? 'bg-orange-400' : numScore >= 4 ? 'bg-yellow-400' : 'bg-blue-400';
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-mono font-semibold text-gray-700">{numScore.toFixed(1)}</span>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 shrink-0 w-36">{label}</span>
            <span className="text-sm text-gray-800 font-medium text-right">{value ?? <span className="text-gray-300">—</span>}</span>
        </div>
    );
}

function SectionCard({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 className="text-sm font-semibold text-gray-700 tracking-wide">{title}</h2>
                {count !== undefined && (
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">{count}</span>
                )}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

export default function Details({ computer }: PageProps) {
    const cpu0 = computer.cpu?.[0] ?? null;
    const os0 = computer.os?.[0] ?? null;
    const ram0 = computer.ram?.[0] ?? null;

    const sections: Section[] = [
        { id: 'os',              title: 'Système d\'exploitation', icon: <FiMonitor size={15} /> },
        { id: 'cpu',             title: 'Processeur',              icon: <FiCpu size={15} /> },
        { id: 'ram',             title: 'Mémoire RAM',             icon: <FiDatabase size={15} /> },
        { id: 'volumes',         title: 'Volumes',                 icon: <FiHardDrive size={15} />, count: computer.volumes.length },
        { id: 'antivirus',       title: 'Antivirus',               icon: <FiShield size={15} />,    count: computer.antiviruses.length },
        { id: 'vulnerabilities', title: 'Vulnérabilités',          icon: <FiAlertTriangle size={15} />, count: computer.vulnerabilities?.length ?? 0 },
    ];

    const [activeSection, setActiveSection] = useState<string>('os');

    const formatMemory = (mb: number) =>
        mb < 1024 ? `${mb} Mo` : `${(mb / 1024).toFixed(2)} Go`;

    const kpiCards = [
        {
            label: 'Total',
            value: computer.security_kpis.total,
            icon: <FiLayers size={18} />,
            color: 'text-gray-700',
            iconBg: 'bg-gray-100 text-gray-500',
        },
        {
            label: 'Critique',
            value: computer.security_kpis.critical,
            icon: <FiAlertOctagon size={18} />,
            color: 'text-red-600',
            iconBg: 'bg-red-50 text-red-500',
        },
        {
            label: 'Élevé',
            value: computer.security_kpis.high,
            icon: <FiAlertTriangle size={18} />,
            color: 'text-orange-500',
            iconBg: 'bg-orange-50 text-orange-400',
        },
        {
            label: 'Dernière détection',
            value: computer.security_kpis.last_detected ?? 'N/A',
            icon: <FiClock size={18} />,
            color: 'text-gray-700',
            iconBg: 'bg-gray-100 text-gray-500',
            small: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Details - ${computer.name ?? 'Computer'}`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@400;500;600;700&display=swap');
                .details-root { font-family: 'DM Sans', sans-serif; }
                .details-root .font-mono { font-family: 'IBM Plex Mono', monospace; }
                .nav-btn { transition: all 0.15s ease; }
                .section-fade { animation: fadeIn 0.2s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div className="details-root flex flex-col gap-6 p-6 max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-gray-400 tracking-widest uppercase">Machine</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {computer.name ?? '—'}
                        </h1>
                        {computer.contact && (
                            <p className="text-sm text-gray-500 mt-0.5">{computer.contact}</p>
                        )}
                    </div>
                    <Link
                        href="/inventaire"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
                    >
                        <FiArrowLeft size={14} />
                        Retour à l'inventaire
                    </Link>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {kpiCards.map((kpi) => (
                        <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.iconBg} shrink-0`}>
                                {kpi.icon}
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{kpi.label}</div>
                                <div className={`font-bold leading-tight ${kpi.small ? 'text-sm mt-0.5 font-mono' : 'text-2xl'} ${kpi.color}`}>
                                    {kpi.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Layout ── */}
                <div className="flex gap-6 items-start">

                    {/* Sidebar */}
                    <nav className="hidden md:flex w-56 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 pt-4 pb-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Navigation</span>
                        </div>
                        <ul className="flex flex-col pb-2 px-2 gap-0.5">
                            {sections.map((section) => {
                                const isActive = activeSection === section.id;
                                return (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={`nav-btn flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm ${
                                                isActive
                                                    ? 'bg-gray-900 text-white font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className={isActive ? 'text-white' : 'text-gray-400'}>{section.icon}</span>
                                                <span>{section.title}</span>
                                            </div>
                                            {section.count !== undefined && (
                                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {section.count}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Content area */}
                    <div className="flex-1 min-w-0 section-fade" key={activeSection}>

                        {activeSection === 'os' && (
                            <SectionCard title="Système d'exploitation">
                                <InfoRow label="Nom"           value={os0?.os_name} />
                                <InfoRow label="Version"       value={os0?.os_version_name} />
                                <InfoRow label="Architecture"  value={os0?.os_arch_name} />
                                <InfoRow label="Installation"  value={os0?.install_date} />
                            </SectionCard>
                        )}

                        {activeSection === 'cpu' && (
                            <SectionCard title="Processeur (CPU)">
                                <InfoRow label="Modèle"    value={cpu0?.cpu_name} />
                                <InfoRow label="Fréquence" value={cpu0?.frequence} />
                                <InfoRow label="Cœurs"     value={cpu0?.nbr_cores?.toString()} />
                                <InfoRow label="Threads"   value={cpu0?.nbr_threads?.toString()} />
                            </SectionCard>
                        )}

                        {activeSection === 'ram' && (
                            <SectionCard title="Mémoire (RAM)">
                                <InfoRow label="Modèle" value={ram0?.ram_name} />
                                <InfoRow label="Capacité" value={ram0?.size != null ? formatMemory(ram0.size) : null} />
                                <InfoRow label="Numéro de série" value={ram0?.serial} />
                            </SectionCard>
                        )}

                        {activeSection === 'volumes' && (
                            <SectionCard title="Volumes" count={computer.volumes.length}>
                          {computer.volumes.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-4 text-center">Aucun volume trouvé.</p>
                                ) : (
                                    <VolumesTable volumes={computer.volumes} />
                                )}
                            </SectionCard>
                        )}

                        {activeSection === 'antivirus' && (
                            <SectionCard title="Antivirus" count={computer.antiviruses.length}>
                                {computer.antiviruses.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-4 text-center">Aucun antivirus trouvé.</p>
                                ) : (
                                    <AntivirusTable antiviruses={computer.antiviruses} />
                                )}
                            </SectionCard>
                        )}

                        {activeSection === 'vulnerabilities' && (
                            <div className="flex flex-col gap-4">
                                {/* Chart */}
                                {computer.severity_chart?.length > 0 && (
                                    <SectionCard title="Répartition par sévérité">
                                        <VulnerabilitySeverityChart data={computer.severity_chart} />
                                    </SectionCard>
                                )}

                                {/* Table */}
                                <SectionCard title="Vulnérabilités détectées" count={computer.vulnerabilities?.length ?? 0}>
                                    {!computer.vulnerabilities || computer.vulnerabilities.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                                            <FiShield size={32} className="text-gray-300" />
                                            <p className="text-sm">Aucune vulnérabilité détectée.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto -mx-5">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-y border-gray-100">
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">CVE</th>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Sévérité</th>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Score</th>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Description</th>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Détecté le</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {computer.vulnerabilities.map((v) => (
                                                        <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                                                            <td className="px-5 py-3.5">
                                                                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5">
                                                                    {v.cve ?? '—'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <SeverityBadge severity={v.severity} />
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <ScoreBar score={v.score} />
                                                            </td>
                                                            <td className="px-5 py-3.5 max-w-xs">
                                                                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2" title={v.description ?? ''}>
                                                                    {v.description ?? '—'}
                                                                </p>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span className="font-mono text-xs text-gray-500">{v.detected_at ?? '—'}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </SectionCard>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}