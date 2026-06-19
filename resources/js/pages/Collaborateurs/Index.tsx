import { TableCollabs } from '@/components/Collabs/TableCollabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';
import { Head } from '@inertiajs/react';

interface UserOverview {
    user_name: string;
    machines_count: number;
    total_active_seconds: number;
    formatted_active_time: string;
    total_unlocks: number;
    last_activity: string;
}

interface Filters {
    search?: string | null;
    machines_min?: string | number | null;
    machines_max?: string | number | null;
}

interface Props {
    users: Paginated<UserOverview>;
    filters: Filters;
}

export default function Index({ users, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Collaborateurs',
            href: '/collaborateurs',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collaborateurs" />

            <div className="space-y-6 p-6 lg:p-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Collaborateurs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Consultez l'activité et les statistiques des
                        collaborateurs.
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-4 shadow-sm lg:p-6">
                    <TableCollabs users={users} filters={filters} />
                </div>
            </div>
        </AppLayout>
    );
}
