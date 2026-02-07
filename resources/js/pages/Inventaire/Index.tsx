import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Paginated } from '@/types/pagination';
import type { Computer } from '@/features/inventaire/types';
import { useState } from 'react';
import InventaireTable from '@/components/inventaire/TableInventaire';
import Pagination from '@/components/Pagination';

type PageProps = {
    computers: Paginated<Computer>;
    filters: {
        search: string | null;
        missing_sophos: boolean | null;
        cpu_tier: string | null;
        perPage: number;
    };
    cpuTierOptions: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaire', href: '/inventaire' },
];

export default function Index({
    computers,
    filters,
    cpuTierOptions,
}: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [missingSophos, setMissingSophos] = useState(
        !!filters.missing_sophos,
    );
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier ?? '');

    const [loading, setLoading] = useState(false);

    const submit = () => {
        setLoading(true);

        router.get(
            '/inventaire',
            {
                search: search.trim() || null,
                missing_sophos: missingSophos ? 1 : 0,
                cpu_tier: cpuTier.trim().toLowerCase() || null,
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
        setLoading(true);

        router.get(
            '/inventaire',
            {
                search: null,
                missing_sophos: null,
                cpu_tier: null,
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

            <div className="flex flex-col gap-4 rounded-xl p-4">
                {/* Toolbar */}
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        {/* Left: Filters */}
                        <div className="grid w-full gap-3 lg:grid-cols-12">
                            {/* Search */}
                            <div className="lg:col-span-5">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Recherche
                                </label>
                                <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3">
                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') submit();
                                        }}
                                        placeholder="Nom, contact..."
                                        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                    />
                                    {search.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                            aria-label="Clear search"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="lg:col-span-4">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Conformité Antivirus
                                </label>
                                <label className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={missingSophos}
                                        onChange={(e) =>
                                            setMissingSophos(e.target.checked)
                                        }
                                        className="h-4 w-4"
                                    />
                                    <span>Sans Sophos Intercept X</span>
                                </label>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    CPU
                                </label>

                                <select
                                    value={cpuTier}
                                    onChange={(e) => setCpuTier(e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
                                >
                                    <option value="">Tous</option>
                                    {cpuTierOptions.map((tier) => (
                                        <option key={tier} value={tier}>
                                            {tier.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="lg:col-span-3">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Actions
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={submit}
                                        disabled={loading}
                                        className="h-10 flex-1 rounded-md bg-foreground px-4 text-sm font-medium text-background disabled:opacity-60"
                                    >
                                        {loading
                                            ? 'Chargement...'
                                            : 'Appliquer'}
                                    </button>

                                    <button
                                        onClick={reset}
                                        disabled={
                                            loading ||
                                            (search.trim() === '' &&
                                                !missingSophos &&
                                                cpuTier === '')
                                        }
                                        className="h-10 rounded-md border px-4 text-sm disabled:opacity-60"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {computers.data.length === 0 ? (
                    <div className="rounded-lg border p-6 text-sm text-muted-foreground">
                        Aucun ordinateur trouvé.
                    </div>
                ) : (
                    <>
                        <InventaireTable computers={computers.data} />
                        <Pagination links={computers.links} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
