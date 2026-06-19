import { useState, useMemo, lazy, Suspense } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { HardDrive, MemoryStick, XCircle, Download, Clock } from 'lucide-react';
import {
    DiskAlert,
    KpiStats,
    outDateInventoryAlert,
    PatchWindowsAlert,
} from '@/types/types';
import { DiskStats } from '@/components/Alertes/charts/DiskPieChart';
import { PatchStats } from '@/components/Alertes/charts/PatchPieChart';
import { OutDateInventoryStats } from '@/components/Alertes/charts/outDateInventoryPieChart';
import KpiCards from '@/components/Alertes/charts/KpiCards';

// ✅ Lazy loading — chaque section ne charge que quand l'onglet est actif

const DiskAlertsTable = lazy(
    () => import('@/components/Alertes/DiskAlertsTable'),
);
const PatchWindowsAlertsTable = lazy(
    () => import('@/components/Alertes/PatchWindowsAlertsTable'),
);
const OutDateInventoryTable = lazy(
    () => import('@/components/Alertes/OutDateInventoryTable'),
);
const DiskPieChart = lazy(
    () => import('@/components/Alertes/charts/DiskPieChart'),
);

const PatchPieChart = lazy(
    () => import('@/components/Alertes/charts/PatchPieChart'),
);
const OutDateInventoryPieChart = lazy(
    () => import('@/components/Alertes/charts/outDateInventoryPieChart'),
);

interface Props {
    // ✅ Stats légères — disponibles immédiatement (jamais undefined)
    diskStats: DiskStats;
    patchStats: PatchStats;
    outDateInventoryStats: OutDateInventoryStats;
    kpiStats: KpiStats;

    // ✅ Données complètes — différées (undefined pendant le chargement)
    diskAlerts?: DiskAlert[];
    patchWindowsAlerts?: PatchWindowsAlert[];
    outDateInventoryAlerts?: outDateInventoryAlert[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Alertes', href: '/alertes' }];

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div
                        className="h-4 animate-pulse rounded bg-gray-200"
                        style={{ width: `${60 + ((i * 15) % 40)}%` }}
                    />
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
                                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
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
        <div className="h-48 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
    );
}

export default function Index({
    kpiStats,
    diskStats,
    patchStats,
    outDateInventoryStats,
    diskAlerts,
    patchWindowsAlerts,
    outDateInventoryAlerts,
}: Props) {
    const [activeTab, setActiveTab] = useState<
        'disk' | 'patchwindows' | 'outdateinventory'
    >('disk');

    const tabs = [
        {
            key: 'disk' as const,
            label: 'Disques',
            icon: <HardDrive size={15} />,
        },
        {
            key: 'patchwindows' as const,
            label: 'Patches Windows',
            icon: <Download size={15} />,
        },
        {
            key: 'outdateinventory' as const,
            label: 'Inventaire obsolète',
            icon: <Clock size={15} />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alertes système" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Alertes système
                </h1>

                {/* KPI Cards */}
                <KpiCards stats={kpiStats} />

                {/* Onglets */}
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            onMouseEnter={() => {
                                // 🚀 Prefetch au hover
                                if (tab.key === 'disk') {
                                    import('@/components/Alertes/DiskAlertsTable');
                                    import('@/components/Alertes/charts/DiskPieChart');
                                }
                                if (tab.key === 'patchwindows') {
                                    import('@/components/Alertes/PatchWindowsAlertsTable');
                                    import('@/components/Alertes/charts/PatchPieChart');
                                }
                                if (tab.key === 'outdateinventory') {
                                    import('@/components/Alertes/OutDateInventoryTable');
                                }
                            }}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Disques ── */}
                {activeTab === 'disk' && (
                    <section className="space-y-6">
                        {/* ✅ Chart immédiat — diskStats disponible sans defer */}
                        <Suspense fallback={<SkeletonChart />}>
                            <DiskPieChart stats={diskStats} />
                        </Suspense>
                        {/* ✅ Table différée */}
                        {diskAlerts === undefined ? (
                            <SkeletonTable cols={5} />
                        ) : diskAlerts.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                Aucune alerte disque.
                            </p>
                        ) : (
                            <Suspense fallback={<SkeletonTable cols={5} />}>
                                <DiskAlertsTable diskAlerts={diskAlerts} />
                            </Suspense>
                        )}
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
                        {patchWindowsAlerts === undefined ? (
                            <SkeletonTable cols={5} />
                        ) : patchWindowsAlerts.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                Aucune alerte patch Windows.
                            </p>
                        ) : (
                            <Suspense fallback={<SkeletonTable cols={5} />}>
                                <PatchWindowsAlertsTable
                                    patchWindowsAlerts={patchWindowsAlerts}
                                />
                            </Suspense>
                        )}
                    </section>
                )}
                {/* ── Inventaire obsolète ── */}
                {activeTab === 'outdateinventory' && (
                    <section className="space-y-6">
                        <Suspense fallback={<SkeletonChart />}>
                            <OutDateInventoryPieChart
                                stats={outDateInventoryStats}
                            />
                        </Suspense>
                        {outDateInventoryAlerts === undefined ? (
                            <SkeletonTable cols={3} />
                        ) : outDateInventoryAlerts.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                Aucune alerte inventaire obsolète.
                            </p>
                        ) : (
                            <Suspense fallback={<SkeletonTable cols={3} />}>
                                <OutDateInventoryTable
                                    outDateInventoryAlerts={
                                        outDateInventoryAlerts
                                    }
                                />
                            </Suspense>
                        )}
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
