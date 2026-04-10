import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Paginated } from '@/types/pagination';
import type { Computer } from '@/features/inventaire/types';
import { useState,   } from 'react';
import InventaireTable from '@/components/inventaire/TableInventaire';
import Pagination from '@/components/Pagination';
import { Search, ShieldAlert, Cpu, Layers } from 'lucide-react';
import KpiCards from '@/components/inventaire/KpiCards';
import GroupPieChart from '@/components/inventaire/charts/GroupPieChart';

type PageProps = {
    computers: Paginated<Computer>;
    filters: {
        search: string | null;
        missing_sophos: boolean | null;
        cpu_tier: string | null;
        group: string | null;
        perPage: number;
    };
    cpuTierOptions: string[];
    groupOptions: string[];
    stats: {
        totalComputers: number;
        vulnerableComputers: number;
        withoutSophos: number;
        computersByGroup: { [groupe: string]: number };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaire', href: '/inventaire' },
];

export default function Index({
    computers,
    filters,
    cpuTierOptions,
    groupOptions,
    stats,
}: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [missingSophos, setMissingSophos] = useState(
        !!filters.missing_sophos,
    );
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier ?? '');
    const [group, setGroup] = useState(filters.group ?? '');
    const [loading, setLoading] = useState(false);

    const submit = () => {
        setLoading(true);

        router.get(
            '/inventaire',
            {
                search: search.trim() || null,
                missing_sophos: missingSophos ? 1 : 0,
                cpu_tier: cpuTier.trim().toLowerCase() || null,
                group: group.trim() || null,
                perPage: filters.perPage,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const reset = () => {
        setSearch('');
        setMissingSophos(false);
        setCpuTier('');
        setGroup('');
        setLoading(true);

        router.get(
            '/inventaire',
            {
                search: null,
                missing_sophos: null,
                cpu_tier: null,
                group: null,
                perPage: filters.perPage,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventaire" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Inventaire des ordinateurs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Consultez et filtrez les machines présentes dans le parc
                        informatique.
                    </p>
                </div>

                <KpiCards stats={stats} />

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-1">
                    <GroupPieChart stats={stats.computersByGroup} />
                </div>

                {/* Filters */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="grid gap-5 lg:grid-cols-12">
                        {/* Search */}
                        <div className="lg:col-span-4">
                            <label className="text-xs font-medium text-muted-foreground">
                                Recherche
                            </label>

                            <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-primary/30">
                                <Search
                                    size={16}
                                    className="text-muted-foreground"
                                />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && submit()
                                    }
                                    placeholder="Nom, utilisateur, contact..."
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* CPU */}
                        <div className="lg:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                CPU
                            </label>

                            <div className="relative mt-2">
                                <Cpu
                                    size={16}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                                />

                                <select
                                    value={cpuTier}
                                    onChange={(e) => setCpuTier(e.target.value)}
                                    className="h-11 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                    <option value="">Tous</option>
                                    {cpuTierOptions.map((tier) => (
                                        <option key={tier} value={tier}>
                                            {tier.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Group */}
                        <div className="lg:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                Groupe
                            </label>

                            <div className="relative mt-2">
                                <Layers
                                    size={16}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                                />

                                <select
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    className="h-11 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                    <option value="">Tous</option>
                                    {groupOptions.map((g) => (
                                        <option key={g} value={g}>
                                            {g.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Antivirus */}
                        <div className="flex items-end lg:col-span-2">
                            <label className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 transition hover:bg-muted/50">
                                <input
                                    type="checkbox"
                                    checked={missingSophos}
                                    onChange={(e) =>
                                        setMissingSophos(e.target.checked)
                                    }
                                    className="h-4 w-4 accent-red-500"
                                />

                                <ShieldAlert
                                    size={16}
                                    className="text-red-500"
                                />

                                <span className="text-sm whitespace-nowrap">
                                    Sans Sophos
                                </span>
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-end gap-2 lg:col-span-2">
                            <button
                                onClick={submit}
                                disabled={loading}
                                className="h-11 flex-1 rounded-lg bg-primary text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                            >
                                {loading ? '...' : 'Filtrer'}
                            </button>

                            <button
                                onClick={reset}
                                disabled={loading}
                                className="h-11 rounded-lg border px-4 text-sm transition hover:bg-muted"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    {computers.data.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Aucun ordinateur trouvé.
                        </div>
                    ) : (
                        <>
                            <InventaireTable computers={computers.data} />

                            <div className="border-t p-4">
                                <Pagination links={computers.links} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
