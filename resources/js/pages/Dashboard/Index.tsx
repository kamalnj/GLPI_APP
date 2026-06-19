import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Activity } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ModelStatsCard } from '@/components/dashboard/MaterialInventory/ModelStatsCard';
import { ModelDistributionChart } from '@/components/dashboard/MaterialInventory/ModelDistributionChart';
import { RamDistributionChart } from '@/components/dashboard/MaterialInventory/RamDistributionChart';

import { ChartSkeleton } from '@/components/dashboard/ChartSkeleton';

import {
    DevicesWithLowDisk,
    SoftwareStats,
} from '@/components/dashboard/SoftwareInventory';

import {
    LowDiskDevicesByGroupeChart,
    TopGroupsSoftwaresChart,
    TopGroupsVulnerabilitiesChart,
} from '@/components/dashboard/GroupsStats';

import {
    RemoteOnsiteAverage,
    TopActiveUsers,
    TopUnlocksUsers,
    InactiveUsers,
} from '@/components/dashboard/CollaboratorsStats';

interface DashboardPageProps {
    total_machines: number;
    different_models_count: number;
    top_model: {
        computer_model: string;
        count: number;
    } | null;

    models_distribution: Array<{
        name: string;
        value: number;
    }> | null;

    ram_distribution: Array<{
        ram_gb: number;
        device_count: number;
    }> | null;

    software_stats: {
        average_softwares_per_device: number;
        devices_above_average: number;

        top_installed_softwares: Array<{
            name: string;
            count: number;
        }>;

        devices_above_average_with_low_disk: Array<{
            id: number;
            name: string;
            model: string;
            software_count: number;
            avg_free_percent: number;
        }>;

        top_device_by_software_count: {
            id: number;
            name: string;
            computer_model: string;
            software_count: number;
        } | null;
    } | null;

    groups_stats: {
        low_disk_by_groupe: Array<{
            groupe: string;
            low_disk_devices: number;
        }>;

        top_groups_vulnerabilities: Array<{
            groupe: string;
            vulnerability_count: number;
        }>;

        top_groups_softwares: Array<{
            groupe: string;
            software_count: number;
            device_count: number;
            avg_software_per_device: number;
        }>;
    } | null;

    collaborators_stats: {
        remote_onsite_average: {
            onsite_percent: number;
            remote_percent: number;
            onsite_avg_hours: number;
            remote_avg_hours: number;
        };

        top_active_users: Array<{
            user_name: string;
            active_seconds: number;
            active_time: string;
            machines_count: number;
        }>;

        top_unlocks_users: Array<{
            user_name: string;
            total_unlocks: number;
            active_days: number;
            avg_unlocks_per_day: number;
        }>;

        inactive_users: Array<{
            user_name: string;
            last_30_active_seconds: number;
            last_30_active_time: string;
            last_30_active_days: number;
            total_machines: number;
        }>;

        total_users: number;
    } | null;

    last_updated?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: dashboard().url,
    },
];

export default function Index({
    total_machines,
    different_models_count,
    top_model,
    models_distribution,
    ram_distribution,
    software_stats,
    groups_stats,
    collaborators_stats,
}: DashboardPageProps) {
    const [activeTab, setActiveTab] = useState('hardware');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tableau de bord
                    </h1>

                    <p className="text-muted-foreground">
                        Vue globale de votre infrastructure et inventaire.
                    </p>
                </div>

                {/* Empty State */}
                {total_machines === 0 ? (
                    <section className="flex flex-col items-center justify-center px-6 py-24">
                        <div className="mb-6 rounded-full bg-muted p-6">
                            <Activity className="h-12 w-12 text-muted-foreground" />
                        </div>

                        <h3 className="mb-3 text-2xl font-semibold">
                            Aucune machine détectée
                        </h3>

                        <p className="max-w-md text-center text-muted-foreground">
                            Commencez par ajouter des machines pour visualiser
                            vos statistiques et analyses.
                        </p>
                    </section>
                ) : (
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        {/* Tabs Navigation */}
                        <TabsList className="grid w-full grid-cols-4 lg:w-full">
                            <TabsTrigger value="hardware">
                                Inventaire matériel
                            </TabsTrigger>

                            <TabsTrigger value="software">
                                Logiciels
                            </TabsTrigger>

                            <TabsTrigger value="groups">Groupes</TabsTrigger>

                            <TabsTrigger value="collaborators">
                                Collaborateurs
                            </TabsTrigger>
                        </TabsList>

                        {/* ========================= */}
                        {/* HARDWARE TAB */}
                        {/* ========================= */}
                        <TabsContent value="hardware" className="space-y-8">
                            {/* Stats Cards */}
                            <section>
                                <ModelStatsCard
                                    differentModelsCount={
                                        different_models_count
                                    }
                                    topModel={top_model}
                                    totalMachines={total_machines}
                                />
                            </section>

                            {/* Charts */}
                            <section>
                                <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                                    <div className="transition-all duration-300 hover:scale-[1.02]">
                                        {models_distribution ? (
                                            <ModelDistributionChart
                                                data={models_distribution}
                                            />
                                        ) : (
                                            <ChartSkeleton />
                                        )}
                                    </div>

                                    <div className="transition-all duration-300 hover:scale-[1.02]">
                                        {ram_distribution ? (
                                            <RamDistributionChart
                                                data={ram_distribution}
                                            />
                                        ) : (
                                            <ChartSkeleton />
                                        )}
                                    </div>
                                </div>
                            </section>
                        </TabsContent>

                        {/* ========================= */}
                        {/* SOFTWARE TAB */}
                        {/* ========================= */}
                        <TabsContent value="software" className="space-y-8">
                            {/* Software Stats */}
                            <section>
                                {software_stats ? (
                                    <SoftwareStats
                                        average_softwares_per_device={
                                            software_stats.average_softwares_per_device
                                        }
                                        devices_above_average={
                                            software_stats.devices_above_average
                                        }
                                        top_installed_softwares={
                                            software_stats.top_installed_softwares
                                        }
                                        top_device_by_software_count={
                                            software_stats.top_device_by_software_count
                                        }
                                    />
                                ) : (
                                    <ChartSkeleton />
                                )}
                            </section>

                            {/* Devices With Low Disk */}
                            <section>
                                {software_stats &&
                                software_stats
                                    .devices_above_average_with_low_disk
                                    .length > 0 ? (
                                    <DevicesWithLowDisk
                                        devices={
                                            software_stats.devices_above_average_with_low_disk
                                        }
                                    />
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Machines avec faible espace
                                                disque
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="flex h-60 items-center justify-center">
                                            <p className="text-muted-foreground">
                                                Aucun appareil critique détecté
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>
                        </TabsContent>

                        {/* ========================= */}
                        {/* GROUPS TAB */}
                        {/* ========================= */}
                        <TabsContent value="groups" className="space-y-8">
                            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                                {/* Low Disk by Group */}
                                <div className="transition-all duration-300 hover:scale-[1.02]">
                                    {groups_stats?.low_disk_by_groupe &&
                                    groups_stats.low_disk_by_groupe.length >
                                        0 ? (
                                        <LowDiskDevicesByGroupeChart
                                            data={
                                                groups_stats.low_disk_by_groupe
                                            }
                                        />
                                    ) : groups_stats !== null ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Appareils avec faible espace
                                                    disque
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="flex h-80 items-center justify-center">
                                                <p className="text-muted-foreground">
                                                    Aucun appareil détecté
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <ChartSkeleton />
                                    )}
                                </div>

                                {/* Vulnerabilities */}
                                <div className="transition-all duration-300 hover:scale-[1.02]">
                                    {groups_stats?.top_groups_vulnerabilities &&
                                    groups_stats.top_groups_vulnerabilities
                                        .length > 0 ? (
                                        <TopGroupsVulnerabilitiesChart
                                            data={
                                                groups_stats.top_groups_vulnerabilities
                                            }
                                        />
                                    ) : (
                                        <ChartSkeleton />
                                    )}
                                </div>

                                {/* Softwares */}
                                <div className="transition-all duration-300 hover:scale-[1.02] xl:col-span-2">
                                    {groups_stats?.top_groups_softwares &&
                                    groups_stats.top_groups_softwares.length >
                                        0 ? (
                                        <TopGroupsSoftwaresChart
                                            data={
                                                groups_stats.top_groups_softwares
                                            }
                                        />
                                    ) : (
                                        <ChartSkeleton />
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* ========================= */}
                        {/* COLLABORATORS TAB */}
                        {/* ========================= */}
                        <TabsContent
                            value="collaborators"
                            className="space-y-8"
                        >
                            {/* Remote vs Onsite Average */}
                            <section>
                                {collaborators_stats ? (
                                    <RemoteOnsiteAverage
                                        onsite_percent={
                                            collaborators_stats
                                                .remote_onsite_average
                                                .onsite_percent
                                        }
                                        remote_percent={
                                            collaborators_stats
                                                .remote_onsite_average
                                                .remote_percent
                                        }
                                        onsite_avg_hours={
                                            collaborators_stats
                                                .remote_onsite_average
                                                .onsite_avg_hours
                                        }
                                        remote_avg_hours={
                                            collaborators_stats
                                                .remote_onsite_average
                                                .remote_avg_hours
                                        }
                                    />
                                ) : (
                                    <ChartSkeleton />
                                )}
                            </section>

                            {/* Top Active Users */}
                            <section>
                                {collaborators_stats ? (
                                    <TopActiveUsers
                                        users={
                                            collaborators_stats.top_active_users
                                        }
                                    />
                                ) : (
                                    <ChartSkeleton />
                                )}
                            </section>

                            {/* Top Unlocks Users */}
                            <section>
                                {collaborators_stats ? (
                                    <TopUnlocksUsers
                                        users={
                                            collaborators_stats.top_unlocks_users
                                        }
                                    />
                                ) : (
                                    <ChartSkeleton />
                                )}
                            </section>

                            {/* Inactive Users */}
                            <section>
                                {collaborators_stats ? (
                                    <InactiveUsers
                                        users={
                                            collaborators_stats.inactive_users
                                        }
                                    />
                                ) : (
                                    <ChartSkeleton />
                                )}
                            </section>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
