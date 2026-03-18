import { Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import type { Paginated } from '@/types/pagination'
import type { Computer } from '@/features/inventaire/types'
import { useState } from 'react'
import InventaireTable from '@/components/inventaire/TableInventaire'
import Pagination from '@/components/Pagination'
import { Search, ShieldAlert, Cpu, Layers } from 'lucide-react'

type PageProps = {
    computers: Paginated<Computer>
    filters: {
        search: string | null
        missing_sophos: boolean | null
        cpu_tier: string | null
        group: string | null
        perPage: number
    }
    cpuTierOptions: string[]
    groupOptions: string[]
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaire', href: '/inventaire' },
]

export default function Index({
    computers,
    filters,
    cpuTierOptions,
    groupOptions,
}: PageProps) {

    const [search, setSearch] = useState(filters.search ?? '')
    const [missingSophos, setMissingSophos] = useState(!!filters.missing_sophos)
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier ?? '')
    const [group, setGroup] = useState(filters.group ?? '')
    const [loading, setLoading] = useState(false)

    const submit = () => {
        setLoading(true)

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
        )
    }

    const reset = () => {
        setSearch('')
        setMissingSophos(false)
        setCpuTier('')
        setGroup('')
        setLoading(true)

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
        )
    }

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
                        Consultez et filtrez les machines présentes dans le parc informatique.
                    </p>
                </div>


                {/* Filters */}
                <div className="rounded-xl border bg-card p-5 shadow-sm">

                    <div className="grid gap-4 lg:grid-cols-12">

                        {/* Search */}
                        <div className="lg:col-span-4">
                            <label className="text-xs text-muted-foreground">
                                Recherche
                            </label>

                            <div className="mt-1 flex items-center gap-2 rounded-md border bg-background px-3 h-10">
                                <Search size={16} className="text-muted-foreground" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') submit()
                                    }}
                                    placeholder="Nom, utilisateur, contact..."
                                    className="w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* CPU */}
                        <div className="lg:col-span-2">
                            <label className="text-xs text-muted-foreground">
                                CPU
                            </label>

                            <div className="relative mt-1">
                                <Cpu
                                    size={16}
                                    className="absolute left-3 top-3 text-muted-foreground"
                                />

                                <select
                                    value={cpuTier}
                                    onChange={(e) => setCpuTier(e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
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
                            <label className="text-xs text-muted-foreground">
                                Groupe
                            </label>

                            <div className="relative mt-1">
                                <Layers
                                    size={16}
                                    className="absolute left-3 top-3 text-muted-foreground"
                                />

                                <select
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                                >
                                    <option value="">Tous</option>

                                    {groupOptions.map((tier) => (
                                        <option key={tier} value={tier}>
                                            {tier.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Antivirus */}
                        <div className="lg:col-span-3 flex items-end">

                            <label className="flex items-center gap-2 rounded-md border px-3 h-10 w-full cursor-pointer bg-background">

                                <input
                                    type="checkbox"
                                    checked={missingSophos}
                                    onChange={(e) => setMissingSophos(e.target.checked)}
                                    className="h-4 w-4"
                                />

                                <ShieldAlert size={16} className="text-red-500" />

                                <span className="text-sm">
                                    Sans Sophos Intercept X
                                </span>

                            </label>

                        </div>

                        {/* Buttons */}
                        <div className="lg:col-span-1 flex items-end gap-2">

                            <button
                                onClick={submit}
                                disabled={loading}
                                className="h-10 w-full rounded-md bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
                            >
                                {loading ? '...' : 'Filtrer'}
                            </button>

                            <button
                                onClick={reset}
                                disabled={loading}
                                className="h-10 w-full rounded-md border text-sm hover:bg-muted"
                            >
                                Reset
                            </button>

                        </div>

                    </div>
                </div>


                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">

                    {computers.data.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
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
    )
}