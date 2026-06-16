import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, X, Download } from 'lucide-react';
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
    filters?: Filters;
}

export function TableCollabs({ users, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [machinesMin, setMachinesMin] = useState(filters.machines_min || '');
    const [machinesMax, setMachinesMax] = useState(filters.machines_max || '');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const buildFilterUrl = (newSearch: string, newMin: string, newMax: string) => {
        const params = new URLSearchParams();
        if (newSearch) params.append('search', String(newSearch));
        if (newMin) params.append('machines_min', String(newMin));
        if (newMax) params.append('machines_max', String(newMax));
        return `/collaborateurs?${params.toString()}`;
    };

    const buildExportUrl = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', String(search));
        if (machinesMin) params.append('machines_min', String(machinesMin));
        if (machinesMax) params.append('machines_max', String(machinesMax));
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);
        return `/collaborateurs/export/data?${params.toString()}`;
    };

    const handleFilter = () => {
        window.location.href = buildFilterUrl(String(search), String(machinesMin), String(machinesMax));
    };

    const handleClearFilters = () => {
        setSearch('');
        setMachinesMin('');
        setMachinesMax('');
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

    const hasActiveFilters = search || machinesMin || machinesMax || fromDate;

    return (
        <div className="flex flex-col gap-4 p-6">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
                    {/* Search Input */}
                    <div className="flex flex-col gap-1 sm:flex-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Utilisateur
                        </label>
                        <Input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilter();
                                }
                            }}
                            className="h-9"
                        />
                    </div>

                    {/* Machines Min */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Min Machines
                        </label>
                        <Input
                            type="number"
                            placeholder="Min"
                            min="0"
                            value={machinesMin}
                            onChange={(e) => setMachinesMin(e.target.value)}
                            className="h-9 w-24"
                        />
                    </div>

                    {/* Machines Max */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Max Machines
                        </label>
                        <Input
                            type="number"
                            placeholder="Max"
                            min="0"
                            value={machinesMax}
                            onChange={(e) => setMachinesMax(e.target.value)}
                            className="h-9 w-24"
                        />
                    </div>

                    {/* From Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Date De
                        </label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-9 w-32"
                        />
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Date À
                        </label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="h-9 w-32"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleFilter} variant="default">
                        Filtrer
                    </Button>
                    <button
                        onClick={handleExport}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <Download className="h-4 w-4" />
                        Exporter
                    </button>
                    {hasActiveFilters && (
                        <Button
                            size="sm"
                            onClick={handleClearFilters}
                            variant="outline"
                        >
                            <X className="mr-1 h-4 w-4" />
                            Réinitialiser
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25%]">Utilisateur</TableHead>
                            <TableHead className="w-[15%]">Machines</TableHead>
                            <TableHead className="w-[20%]">Temps actif</TableHead>
                            <TableHead className="w-[15%]">Unlocks</TableHead>
                            <TableHead className="w-[25%]">Dernière activité</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                    Aucun collaborateur trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.data.map((user) => (
                                <TableRow
                                    key={user.user_name}
                                    className="hover:bg-muted/50 transition"
                                >
                                    <TableCell className="font-medium">
                                        {user.user_name}
                                    </TableCell>

                                    <TableCell>{user.machines_count}</TableCell>

                                    <TableCell>{user.formatted_active_time}</TableCell>

                                    <TableCell>{user.total_unlocks}</TableCell>

                                    <TableCell>{user.last_activity}</TableCell>

                                    <TableCell className="text-right">
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/collaborateurs/${user.user_name}`}>
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
                    Affichage de {users.from} à {users.to} sur {users.total} collaborateurs
                </p>
                <Pagination links={users.links} />
            </div>
        </div>
    );
}
