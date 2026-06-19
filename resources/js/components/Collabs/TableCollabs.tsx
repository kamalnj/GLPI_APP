import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, X, Download, Search, Filter } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/Pagination';
import type { Paginated } from '@/types/pagination';

export interface UserOverview {
    user_name: string;
    machines_count: number;
    total_active_seconds: number;
    formatted_active_time: string;
    total_unlock_count: number;
    last_activity: string;
}

interface Filters {
    search?: string | null;
    from_date?: string | null;
    to_date?: string | null;
}

interface Props {
    users: Paginated<UserOverview>;
    filters?: Filters;
}

export function TableCollabs({ users, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const buildFilterUrl = (
        newSearch: string,
        fromDate: string,
        toDate: string,
    ) => {
        const params = new URLSearchParams();
        if (newSearch) params.append('search', String(newSearch));
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);
        return `/collaborateurs?${params.toString()}`;
    };

    const buildExportUrl = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', String(search));
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);
        return `/collaborateurs/export/data?${params.toString()}`;
    };

    const handleFilter = () => {
        window.location.href = buildFilterUrl(
            String(search),
            String(fromDate),
            String(toDate),
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setFromDate('');
        setToDate('');
        window.location.href = '/collaborateurs';
    };

    const handleExport = () => {
        if (!fromDate) {
            alert('Veuillez sélectionner une date de départ');
            return;
        }
        window.location.href = buildExportUrl();
    };

    const hasActiveFilters = search || fromDate || toDate;

    return (
        <div className="flex flex-col gap-4 p-6">
            {/* Filters */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-end sm:justify-between">
                {/* Filter Fields */}
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                    {/* Search */}
                    <div className="flex flex-col gap-1 sm:flex-1">
                        <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                            Utilisateur
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleFilter()
                                }
                                className="h-9 pl-8 text-sm"
                            />
                        </div>
                    </div>

                    {/* Date range */}
                    <div className="flex items-end gap-1.5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                De
                            </label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-9 w-36 text-sm"
                            />
                        </div>
                        <span className="mb-2 text-xs text-muted-foreground">
                            →
                        </span>
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                À
                            </label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-9 w-36 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
                        >
                            <X className="h-3.5 w-3.5" />
                            Réinitialiser
                        </button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleFilter}
                        className="h-9 px-4"
                    >
                        <Filter className="mr-1.5 h-3.5 w-3.5" />
                        Filtrer
                    </Button>
                    <button
                        onClick={handleExport}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25%]">
                                Utilisateur
                            </TableHead>
                            <TableHead className="w-[15%]">Machines</TableHead>
                            <TableHead className="w-[20%]">
                                Temps actif
                            </TableHead>
                            <TableHead className="w-[15%]">Unlocks</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
                                    Aucun collaborateur trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.data.map((user) => (
                                <TableRow
                                    key={user.user_name}
                                    className="transition hover:bg-muted/50"
                                >
                                    <TableCell className="font-medium">
                                        {user.user_name}
                                    </TableCell>

                                    <TableCell>{user.machines_count}</TableCell>

                                    <TableCell>
                                        {user.formatted_active_time}
                                    </TableCell>

                                    <TableCell>
                                        {user.total_unlock_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={`/collaborateurs/${user.user_name}`}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Détails
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-muted-foreground">
                    Affichage de {users.from} à {users.to} sur {users.total}{' '}
                    collaborateurs
                </p>
                <Pagination links={users.links} />
            </div>
        </div>
    );
}
