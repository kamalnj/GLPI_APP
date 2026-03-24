import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { HardDrive, MemoryStick, AlertTriangle, XCircle, Download } from 'lucide-react';
import StatCard from '@/components/Alertes/StatCard';
import RamAlertsTable from '@/components/Alertes/RamAlertsTable';
import DiskAlertsTable from '@/components/Alertes/DiskAlertsTable';
import { DiskAlert, PatchWindowsAlert, RamAlert } from '@/types/types';
import PatchWindowsAlertsTable from '@/components/Alertes/PatchWindowsAlertsTable';

interface Props {
    ramAlerts?:  RamAlert[];  
    diskAlerts?: DiskAlert[];
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

export default function Index({ ramAlerts, diskAlerts, patchWindowsAlerts }: Props) {
    const [activeTab, setActiveTab] = useState<'ram' | 'disk' | 'logiciels'| 'patchwindows'>('ram');

    // ✅ ?? [] : sécurisé si undefined (defer pas encore arrivé)
    const ramCritical   = ramAlerts?.filter((r) => r.alert_level === 'critical').length ?? 0;
    const diskCritical  = diskAlerts?.filter((d) => d.alert_level === 'critical').length ?? 0;
    const totalCritical = ramCritical + diskCritical;
    const totalAlert    = (ramAlerts?.length ?? 0) - ramCritical + ((diskAlerts?.length ?? 0) - diskCritical);

    const tabs = [
        { key: 'ram'       as const, label: 'RAM',                    icon: <MemoryStick size={15} />, count: ramAlerts?.length  ?? '...', hasCritical: ramCritical  > 0 },
        { key: 'disk'      as const, label: 'Disques',                icon: <HardDrive size={15} />,   count: diskAlerts?.length ?? '...', hasCritical: diskCritical > 0 },
        { key: 'logiciels' as const, label: 'Logiciels non autorisés',icon: <XCircle size={15} />,     count: 0,                           hasCritical: false            },
        { key: 'patchwindows' as const, label: 'Patches Windows',icon: <Download size={15} />,     count: patchWindowsAlerts?.length ?? '...',            },

    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alertes système" />
            <div className="space-y-6 p-6">

                <h1 className="text-2xl font-bold text-gray-800">Alertes système</h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard icon={<XCircle className="text-red-500" size={24} />}        label="Critiques"            count={totalCritical} color="border-red-200"   />
                    <StatCard icon={<AlertTriangle className="text-amber-500" size={24} />} label="Alertes"              count={totalAlert}    color="border-amber-200" />
                    <StatCard icon={<HardDrive className="text-gray-400" size={24} />}      label="Machines concernées"  count={new Set([...(ramAlerts?.map((r) => r.computer_id) ?? []), ...(diskAlerts?.map((d) => d.computer_id) ?? [])]).size} color="border-gray-200" />
                </div>

                {/* Onglets */}
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${tab.hasCritical ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ✅ undefined = defer en cours → skeleton | données vides → message | données → table */}

                {activeTab === 'ram' && (
                    <section>
                        {ramAlerts === undefined    ? <SkeletonTable cols={5} rows={8} />
                        : ramAlerts.length === 0    ? <p className="text-sm text-gray-400">Aucune alerte RAM.</p>
                        :                            <RamAlertsTable ramAlerts={ramAlerts} />}
                    </section>
                )}

                {activeTab === 'disk' && (
                    <section>
                        {diskAlerts === undefined   ? <SkeletonTable cols={5} rows={8} />
                        : diskAlerts.length === 0   ? <p className="text-sm text-gray-400">Aucune alerte disque.</p>
                        :                            <DiskAlertsTable diskAlerts={diskAlerts} />}
                    </section>
                )}

                {activeTab === 'logiciels' && (
                    <section>
                        <p className="text-sm text-gray-400">Fonctionnalité à venir.</p>
                    </section>
                )}
                   {activeTab === 'patchwindows' && (
                    <section>
                        {patchWindowsAlerts === undefined   ? <SkeletonTable cols={5} rows={8} />
                        : patchWindowsAlerts.length === 0   ? <p className="text-sm text-gray-400">Aucune alerte patch Windows.</p>
                        :                                    <PatchWindowsAlertsTable patchWindowsAlerts={patchWindowsAlerts} />}

                    </section>
                )}
            </div>
        </AppLayout>
    );
}