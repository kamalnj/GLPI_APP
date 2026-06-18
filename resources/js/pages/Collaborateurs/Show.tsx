import { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Cpu, Network as NetworkIcon, Activity as ActivityIcon, LucideIcon } from 'lucide-react';

import CollabHeader from '@/components/Collabs/CollabHeader';
import TabNavigation from '@/components/Collabs/TabNavigation';
import MachinesPanel from '@/components/Collabs/MachinesPanel';
import NetworksPanel from '@/components/Collabs/NetworksPanel';
import ActivityPanel from '@/components/Collabs/ActivityPanel';
import StatsCards from '@/components/Collabs/StatsCards';
import WorkModeComparison from '@/components/Collabs/WorkModeComparison';
import { BreadcrumbItem } from '@/types/navigation';



type Tab = 'machines' | 'networks' | 'activity';
type ActivityPeriod = 'day' | 'week' | 'month';

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
    { key: 'machines', label: 'Machines', icon: Cpu },
    { key: 'networks', label: 'Réseaux', icon: NetworkIcon },
    { key: 'activity', label: 'Activité', icon: ActivityIcon },
];

const PAGE_SIZE = 20;

interface Overview {
    user_name: string;
    last_activity: string;
    machines_count: number;
    total_active_seconds: number;
    total_unlocks: number;
    [key: string]: any;
}

interface ShowProps {
    overview: Overview;
    machines: any[];
    networks: any[];
    activityDay: any[];
    activityWeek: any[];
    activityMonth: any[];
    workModeComparison: {
        onsite_hours: number;
        remote_hours: number;
    };
    mode: 'current' | 'previous';
}

export default function Show({
    overview,
    machines,
    networks,
    activityDay,
    activityWeek,
    activityMonth,
    workModeComparison,
    mode,
}: ShowProps) {
        const breadcrumbs: BreadcrumbItem[] = [
            {
                title: 'Collaborateurs',
                href: '/collaborateurs',
            },
            {
                title: overview.user_name,
                href: '#' ,
            },
            
        ];
    const [tab, setTab] = useState<Tab>('machines');
    const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>('day');

    const activityMap = useMemo(
        () => ({ day: activityDay, week: activityWeek, month: activityMonth }),
        [activityDay, activityWeek, activityMonth],
    );

    const activities = activityMap[activityPeriod];

    const counts = useMemo(
        () => ({
            machines: machines.length,
            networks: networks.length,
            activity: activities.length,
        }),
        [machines.length, networks.length, activities.length],
    );

    const visibleMachines = useMemo(
        () => machines.slice(0, PAGE_SIZE),
        [machines],
    );
    const visibleNetworks = useMemo(
        () => networks.slice(0, PAGE_SIZE),
        [networks],
    );

    const handleTabChange = useCallback((key: Tab) => setTab(key), []);
    const handlePeriodChange = useCallback(
        (key: ActivityPeriod) => setActivityPeriod(key),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={overview.user_name} />

            <div className="space-y-6 p-4 sm:p-6">
                <CollabHeader
                    userName={overview.user_name}
                />

                <StatsCards overview={overview} />
                <WorkModeComparison
                    userName={overview.user_name}
                    onsite_hours={workModeComparison.onsite_hours}
                    remote_hours={workModeComparison.remote_hours}
                    mode={mode}
                />

                <TabNavigation
                    tabs={TABS}
                    activeTab={tab}
                    counts={counts}
                    onTabChange={handleTabChange}
                />

                <div className="space-y-6">
                    {tab === 'machines' && (
                        <MachinesPanel
                            machines={machines}
                            visibleMachines={visibleMachines}
                            pageSize={PAGE_SIZE}
                        />
                    )}

                    {tab === 'networks' && (
                        <NetworksPanel
                            networks={networks}
                            visibleNetworks={visibleNetworks}
                            pageSize={PAGE_SIZE}
                        />
                    )}

                    {tab === 'activity' && (
                        <ActivityPanel
                            activities={activities}
                            activityPeriod={activityPeriod}
                            onPeriodChange={handlePeriodChange}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
