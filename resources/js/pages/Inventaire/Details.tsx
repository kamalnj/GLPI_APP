import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { FiCpu, FiDatabase, FiShield, FiHardDrive, FiMonitor, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import KpiCards from '@/components/inventaire/Details/KpiCards';
import SidebarNav, { type Section } from '@/components/inventaire/Details/SidebarNav';
import { OsSection, CpuSection, RamSection } from '@/components/inventaire/Details/HardwareSections';
import { SectionCard } from '@/components/inventaire/Details/SectionCard';
import VulnerabilitiesSection from '@/components/inventaire/Details/VulnerabilitiesSection';
import AntivirusTable from '@/components/inventaire/Details/AntivirusTable';
import VolumesTable from '@/components/inventaire/Details/VolumesTable';
import SoftwaresSection from '@/components/inventaire/Details/SoftwaresSection';

// ─── Types ────────────────────────────────────────────────────────────────────

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

type CPU = { cpu_name: string | null; frequence: string | null; nbr_cores: number | null; nbr_threads: number | null; };
type RAM = { ram_name: string | null; size: number | null; serial: string | null; };
type OS = { os_name: string | null; os_version_name: string | null; os_arch_name: string | null; install_date: string | null; };

type Vulnerability = {
    id: number;
    cve: string | null;
    severity: string | null;
    score: number | null;
    description: string | null;
    detected_at: string | null;
};

type Software = {
    id: number;
    software_name: string | null;
    version: string | null;
    date_install: string | null;
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
    softwares?: Software[] | null;
    vulnerabilities?: Vulnerability[] | null;
    security_kpis: {
        total: number;
        critical: number;
        high: number;
        last_detected: string | null;
    };
    severity_chart_current: { name: string; value: number }[];
    severity_chart_previous: { name: string; value: number }[];
};

type PageProps = { computer: Computer };

// ─── Sections lazy ────────────────────────────────────────────────────────────

const LAZY_SECTIONS: Record<string, string> = {
    vulnerabilities: 'computer.vulnerabilities',
    softwares: 'computer.softwares',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaire', href: '/inventaire' },
    { title: 'Détails', href: '' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Details({ computer }: PageProps) {
    const cpu0 = computer.cpu?.[0] ?? null;
    const os0 = computer.os?.[0] ?? null;
    const ram0 = computer.ram?.[0] ?? null;

    const [activeSection, setActiveSection] = useState<string>('os');
    const [chartView, setChartView] = useState<'current' | 'previous'>('current');
    const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());

    const handleSelect = useCallback((section: string) => {
        setActiveSection(section);

        const lazyKey = LAZY_SECTIONS[section];
        if (!lazyKey) return;

        const alreadyLoaded =
            section === 'vulnerabilities' ? computer.vulnerabilities != null
                : section === 'softwares' ? computer.softwares != null
                    : true;

        if (alreadyLoaded) return;

        setLoadingSections(prev => new Set(prev).add(section));

        router.reload({
            only: [lazyKey],
            onFinish: () => {
                setLoadingSections(prev => {
                    const next = new Set(prev);
                    next.delete(section);
                    return next;
                });
            },
        });
    }, [computer.vulnerabilities, computer.softwares]);

    const sections: Section[] = [
        { id: 'os', title: "Système d'exploitation", icon: <FiMonitor size={15} /> },
        { id: 'cpu', title: 'Processeur', icon: <FiCpu size={15} /> },
        { id: 'ram', title: 'Mémoire RAM', icon: <FiDatabase size={15} /> },
        { id: 'volumes', title: 'Volumes', icon: <FiHardDrive size={15} />, count: computer.volumes.length },
        { id: 'antivirus', title: 'Antivirus', icon: <FiShield size={15} />, count: computer.antiviruses.length },
        { id: 'vulnerabilities', title: 'Vulnérabilités', icon: <FiAlertTriangle size={15} />, count: computer.security_kpis.total },
        { id: 'softwares', title: 'Logiciels installés', icon: <FiMonitor size={15} /> },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Details - ${computer.name ?? 'Computer'}`} />

            <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 p-3 sm:p-6">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <span className="font-mono text-xs tracking-widest text-gray-400 uppercase">Machine</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                            {computer.name ?? '—'}
                        </h1>
                        {computer.contact && (
                            <p className="mt-0.5 text-sm text-gray-500">{computer.contact}</p>
                        )}
                    </div>
                    <Link
                        href="/inventaire"
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900"
                    >
                        <FiArrowLeft size={14} /> Retour à l'inventaire
                    </Link>
                </div>

                <KpiCards kpis={computer.security_kpis} />

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">

                    <div className="md:w-56 md:shrink-0">
                        <SidebarNav
                            sections={sections}
                            activeSection={activeSection}
                            onSelect={handleSelect}
                        />
                    </div>

                    <div className="section-fade min-w-0 flex-1" key={activeSection}>

                        {activeSection === 'os' && <OsSection os={os0} />}
                        {activeSection === 'cpu' && <CpuSection cpu={cpu0} />}
                        {activeSection === 'ram' && <RamSection ram={ram0} />}

                        {activeSection === 'volumes' && (
                            <SectionCard title="Volumes" count={computer.volumes.length}>
                                {computer.volumes.length === 0
                                    ? <p className="py-4 text-center text-sm text-gray-400">Aucun volume trouvé.</p>
                                    : <VolumesTable volumes={computer.volumes} />
                                }
                            </SectionCard>
                        )}

                        {activeSection === 'antivirus' && (
                            <SectionCard title="Antivirus" count={computer.antiviruses.length}>
                                {computer.antiviruses.length === 0
                                    ? <p className="py-4 text-center text-sm text-gray-400">Aucun antivirus trouvé.</p>
                                    : <AntivirusTable antiviruses={computer.antiviruses} />
                                }
                            </SectionCard>
                        )}

                        {activeSection === 'vulnerabilities' && (
                            loadingSections.has('vulnerabilities')
                                ? <LoadingSection label="Chargement des vulnérabilités…" />
                                : <VulnerabilitiesSection
                                    vulnerabilities={computer.vulnerabilities ?? []}
                                    severityChartCurrent={computer.severity_chart_current}
                                    severityChartPrevious={computer.severity_chart_previous}
                                    chartView={chartView}
                                    setChartView={setChartView}
                                    computerId={computer.id}
                                />
                        )}

                        {activeSection === 'softwares' && (
                            loadingSections.has('softwares')
                                ? <LoadingSection label="Chargement des logiciels…" />
                                : <SoftwaresSection
                                    softwares={computer.softwares ?? []} // ✅ tableau simple
                                />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function LoadingSection({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-12 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-gray-400">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                {label}
            </div>
        </div>
    );
}