import { useState, useMemo } from 'react';
import { AlertLevel, DiskAlert } from '@/types/types';
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FiSearch } from 'react-icons/fi';
import LevelBadge from './LevelBadge';
import UsageBar from './UsageBar';

const rowBg = (level: AlertLevel) =>
    level === 'critical'
        ? 'bg-red-50/40 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/35'
        : 'bg-amber-50/30 hover:bg-amber-50/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/35';

export const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export default function DiskAlertsTable({
    diskAlerts,
}: {
    diskAlerts: DiskAlert[];
}) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState('');

    const toggle = (id: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Filtre sur nom machine ou mountpoint des partitions
    const filtered = useMemo(() => {
        if (!search.trim()) return diskAlerts;
        const q = search.toLowerCase();
        return diskAlerts.filter(
            (d) =>
                d.computer_name?.toLowerCase().includes(q) ||
                d.partitions.some((p) =>
                    p.mountpoint?.toLowerCase().includes(q),
                ),
        );
    }, [diskAlerts, search]);

    return (
        <div className="flex flex-col gap-3">
            {/* Recherche */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Recherche */}
                <div className="relative w-full sm:max-w-md">
                    <FiSearch
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                        type="text"
                        placeholder="Rechercher une machine ou partition..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                </div>

                {/* Export */}
                <a
                    href="/alertes/export/volumes"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                    Exporter CSV
                </a>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                <table className="min-w-full text-sm text-foreground">
                    <thead className="bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
                        <tr>
                            <th className="w-8 px-4 py-3" />
                            <th className="px-4 py-3 text-left">Machine</th>
                            <th className="px-4 py-3 text-left">Partitions</th>
                            <th className="px-4 py-3 text-left">Niveau</th>
                            <th className="px-4 py-3 text-left">
                                Dernière sync
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
                                    Aucune alerte disque trouvée.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((d) => (
                                <React.Fragment key={d.computer_id}>
                                    {/* Ligne machine */}
                                    <tr
                                        className={`cursor-pointer transition-colors ${rowBg(d.alert_level)}`}
                                        onClick={() => toggle(d.computer_id)}
                                    >
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {expanded.has(d.computer_id) ? (
                                                <ChevronDown size={15} />
                                            ) : (
                                                <ChevronRight size={15} />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                            {d.computer_name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {d.partitions.length} partition(s)
                                        </td>
                                        <td className="px-4 py-3">
                                            <LevelBadge level={d.alert_level} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {formatDate(d.synced_at)}
                                        </td>
                                    </tr>

                                    {/* Lignes partitions — seulement si expanded */}
                                    {expanded.has(d.computer_id) &&
                                        d.partitions.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="border-l-2 border-l-border bg-muted/45 text-xs"
                                            >
                                                <td className="px-4 py-2" />
                                                <td className="px-4 py-2 pl-7 text-muted-foreground">
                                                    └
                                                </td>
                                                <td className="px-4 py-2 font-mono text-foreground">
                                                    {p.mountpoint}
                                                </td>
                                                <td
                                                    className="px-4 py-2"
                                                    colSpan={2}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <LevelBadge
                                                            level={
                                                                p.alert_level
                                                            }
                                                        />
                                                        <UsageBar
                                                            value={
                                                                p.free_percent
                                                            }
                                                            level={
                                                                p.alert_level
                                                            }
                                                            inverted
                                                        />
                                                        <span className="text-muted-foreground">
                                                            libre
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Compteur */}
            {filtered.length !== diskAlerts.length && (
                <p className="text-right text-xs text-muted-foreground">
                    {filtered.length} / {diskAlerts.length} machines
                </p>
            )}
        </div>
    );
}
