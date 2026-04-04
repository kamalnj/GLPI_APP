import { useState, useMemo, lazy, Suspense } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { HardDrive, MemoryStick, AlertTriangle, XCircle, Download } from 'lucide-react';
import StatCard from '@/components/Alertes/StatCard';
import { DiskAlert, PatchWindowsAlert, RamAlert } from '@/types/types';
import { DiskStats } from '@/components/Alertes/charts/DiskPieChart';
import { RamStats } from '@/components/Alertes/charts/RamPieChart';
import { PatchStats } from '@/components/Alertes/charts/PatchPieChart';

// ✅ Lazy loading — chaque section ne charge que quand l'onglet est actif
const RamAlertsTable           = lazy(() => import('@/components/Alertes/RamAlertsTable'));
const DiskAlertsTable          = lazy(() => import('@/components/Alertes/DiskAlertsTable'));
const PatchWindowsAlertsTable  = lazy(() => import('@/components/Alertes/PatchWindowsAlertsTable'));
const DiskPieChart             = lazy(() => import('@/components/Alertes/charts/DiskPieChart'));
const RamPieChart              = lazy(() => import('@/components/Alertes/charts/RamPieChart'));
const PatchPieChart            = lazy(() => import('@/components/Alertes/charts/PatchPieChart'));

interface Props {
    // ✅ Stats légères — disponibles immédiatement (jamais undefined)
    diskStats:  DiskStats;
    ramStats:   RamStats;
    patchStats: PatchStats;
    // ✅ Données complètes — différées (undefined pendant le chargement)
    ramAlerts?:          RamAlert[];
    diskAlerts?:         DiskAlert[];
    patchWindowsAlerts?: PatchWindowsAlert[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Alertes', href: '/alertes' },
];

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: `${60 + (i * 15) % 40}%` }} />
                </td>
            ))}
        </tr>
    );
}

function SkeletonTable({ cols, rows = 8 }: { cols: number; rows?: number }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-4 py-3">
                                <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonRow key={i} cols={cols} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Skeleton chart — affiché pendant le lazy load du composant chart
function SkeletonChart() {
    return (
        <div className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
    );
}

export default function Index({
    ramStats, diskStats, patchStats,
    ramAlerts, diskAlerts, patchWindowsAlerts,
}: Props) {
    const [activeTab, setActiveTab] = useState<'ram' | 'disk' | 'logiciels' | 'patchwindows'>('ram');

    // ✅ useMemo — recalcul seulement si les données changent
    const ramCritical  = useMemo(() => ramAlerts?.filter(r => r.alert_level === 'critical').length ?? 0, [ramAlerts]);
    const diskCritical = useMemo(() => diskAlerts?.filter(d => d.alert_level === 'critical').length ?? 0, [diskAlerts]);

    const totalCritical = ramCritical + diskCritical;
    const totalAlert    = (ramAlerts?.length ?? 0) - ramCritical + ((diskAlerts?.length ?? 0) - diskCritical);

    const machinesConcernees = useMemo(() => new Set([
        ...(ramAlerts?.map(r => r.computer_id)  ?? []),
        ...(diskAlerts?.map(d => d.computer_id) ?? []),
    ]).size, [ramAlerts, diskAlerts]);

    const tabs = [
        { key: 'ram'          as const, label: 'RAM',                     icon: <MemoryStick size={15} />},
        { key: 'disk'         as const, label: 'Disques',                 icon: <HardDrive size={15} />},
        { key: 'logiciels'    as const, label: 'Logiciels non autorisés', icon: <XCircle size={15} />},
        { key: 'patchwindows' as const, label: 'Patches Windows',         icon: <Download size={15} />},
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alertes système" />
            <div className="space-y-6 p-6">

                <h1 className="text-2xl font-bold text-gray-800">Alertes système</h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard icon={<XCircle className="text-red-500" size={24} />}        label="Critiques"           count={totalCritical}     color="border-red-200"   />
                    <StatCard icon={<AlertTriangle className="text-amber-500" size={24} />} label="Alertes"             count={totalAlert}         color="border-amber-200" />
                    <StatCard icon={<HardDrive className="text-gray-400" size={24} />}      label="Machines concernées" count={machinesConcernees} color="border-gray-200"  />
                </div>

                {/* Onglets */}
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            onMouseEnter={() => {
                                // 🚀 Prefetch au hover
                                if (tab.key === 'disk')         { import('@/components/Alertes/DiskAlertsTable'); import('@/components/Alertes/charts/DiskPieChart'); }
                                if (tab.key === 'ram')          { import('@/components/Alertes/RamAlertsTable');  import('@/components/Alertes/charts/RamPieChart');  }
                                if (tab.key === 'patchwindows') { import('@/components/Alertes/PatchWindowsAlertsTable'); import('@/components/Alertes/charts/PatchPieChart'); }
                            }}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                          
                        </button>
                    ))}
                </div>

                {/* ── RAM ── */}
                {activeTab === 'ram' && (
                    <section className="space-y-6">
                        {/* ✅ Chart immédiat — ramStats disponible sans defer */}
                        <Suspense fallback={<SkeletonChart />}>
                            <RamPieChart stats={ramStats} />
                        </Suspense>
                        {/* ✅ Table différée */}
                        {ramAlerts === undefined  ? <SkeletonTable cols={5} />
                        : ramAlerts.length === 0  ? <p className="text-sm text-gray-400">Aucune alerte RAM.</p>
                        : <Suspense fallback={<SkeletonTable cols={5} />}><RamAlertsTable ramAlerts={ramAlerts} /></Suspense>}
                    </section>
                )}

                {/* ── Disques ── */}
                {activeTab === 'disk' && (
                    <section className="space-y-6">
                        {/* ✅ Chart immédiat — diskStats disponible sans defer */}
                        <Suspense fallback={<SkeletonChart />}>
                            <DiskPieChart stats={diskStats} />
                        </Suspense>
                        {/* ✅ Table différée */}
                        {diskAlerts === undefined  ? <SkeletonTable cols={5} />
                        : diskAlerts.length === 0  ? <p className="text-sm text-gray-400">Aucune alerte disque.</p>
                        : <Suspense fallback={<SkeletonTable cols={5} />}><DiskAlertsTable diskAlerts={diskAlerts} /></Suspense>}
                    </section>
                )}

                {/* ── Logiciels ── */}
                {activeTab === 'logiciels' && (
                    <section>
                        <p className="text-sm text-gray-400">Fonctionnalité à venir.</p>
                    </section>
                )}

                {/* ── Patches Windows ── */}
                {activeTab === 'patchwindows' && (
                    <section className="space-y-6">
                        {/* ✅ Chart immédiat — patchStats disponible sans defer */}
                        <Suspense fallback={<SkeletonChart />}>
                            <PatchPieChart stats={patchStats} />
                        </Suspense>
                        {/* ✅ Table différée */}
                        {patchWindowsAlerts === undefined  ? <SkeletonTable cols={5} />
                        : patchWindowsAlerts.length === 0  ? <p className="text-sm text-gray-400">Aucune alerte patch Windows.</p>
                        : <Suspense fallback={<SkeletonTable cols={5} />}><PatchWindowsAlertsTable patchWindowsAlerts={patchWindowsAlerts} /></Suspense>}
                    </section>
                )}

            </div>
        </AppLayout>
    );
}