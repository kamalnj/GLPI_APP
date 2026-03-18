import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ChevronDown,
    ChevronRight,
    HardDrive,
    MemoryStick,
    AlertTriangle,
    XCircle,
} from 'lucide-react';
import LevelBadge from '@/components/Alertes/LevelBadge';
import UsageBar from '@/components/Alertes/UsageBar';
import StatCard from '@/components/Alertes/StatCard';
import RamAlertsTable from '@/components/Alertes/RamAlertsTable';
import DiskAlertsTable from '@/components/Alertes/DiskAlertsTable';
import { DiskAlert, RamAlert } from '@/types/types';

type AlertLevel = 'alert' | 'critical';

interface Props {
    ramAlerts: RamAlert[];
    diskAlerts: DiskAlert[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaire', href: '/inventaire' },
];

export default function AlertsIndex({ ramAlerts, diskAlerts }: Props) {
    const [activeTab, setActiveTab] = useState<'ram' | 'disk'>('ram');

    const ramCritical = ramAlerts.filter(
        (r) => r.alert_level === 'critical',
    ).length;
    const diskCritical = diskAlerts.filter(
        (d) => d.alert_level === 'critical',
    ).length;
    const totalCritical = ramCritical + diskCritical;
    const totalAlert =
        ramAlerts.length - ramCritical + (diskAlerts.length - diskCritical);

    const tabs = [
        {
            key: 'ram' as const,
            label: 'RAM',
            icon: <MemoryStick size={15} />,
            count: ramAlerts.length,
            hasCritical: ramCritical > 0,
        },
        {
            key: 'disk' as const,
            label: 'Disques',
            icon: <HardDrive size={15} />,
            count: diskAlerts.length,
            hasCritical: diskCritical > 0,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alertes système" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Alertes système
                    </h1>
                </div>

                {/* Compteurs globaux */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={<XCircle className="text-red-500" size={24} />}
                        label="Critiques"
                        count={totalCritical}
                        color="border-red-200"
                    />
                    <StatCard
                        icon={
                            <AlertTriangle
                                className="text-amber-500"
                                size={24}
                            />
                        }
                        label="Alertes"
                        count={totalAlert}
                        color="border-amber-200"
                    />
                    <StatCard
                        icon={<HardDrive className="text-gray-400" size={24} />}
                        label="Machines concernées"
                        count={
                            new Set([
                                ...ramAlerts.map((r) => r.computer_id),
                                ...diskAlerts.map((d) => d.computer_id),
                            ]).size
                        }
                        color="border-gray-200"
                    />
                </div>

                {/* Onglets */}
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                                    tab.hasCritical
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-amber-100 text-amber-600'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Contenu onglet actif */}
                {activeTab === 'ram' && (
                    <section>
                        {ramAlerts.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                Aucune alerte RAM.
                            </p>
                        ) : (
                            <RamAlertsTable ramAlerts={ramAlerts} />
                        )}
                    </section>
                )}

                {activeTab === 'disk' && (
                    <section>
                        {diskAlerts.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                Aucune alerte disque.
                            </p>
                        ) : (
                            <DiskAlertsTable diskAlerts={diskAlerts} />
                        )}
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
