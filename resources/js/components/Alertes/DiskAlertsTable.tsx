import { useState, useMemo } from 'react';
import { AlertLevel, DiskAlert } from '@/types/types';
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FiSearch } from 'react-icons/fi';
import LevelBadge from './LevelBadge';
import UsageBar from './UsageBar';

const rowBg = (level: AlertLevel) =>
    level === 'critical' ? 'bg-red-50/40 hover:bg-red-50' : 'bg-amber-50/30 hover:bg-amber-50/60';

export const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

export default function DiskAlertsTable({ diskAlerts }: { diskAlerts: DiskAlert[] }) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState('');

    const toggle = (id: number) => {
        setExpanded(prev => {
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
                d.partitions.some((p) => p.mountpoint?.toLowerCase().includes(q))
        );
    }, [diskAlerts, search]);

    return (
        <div className="flex flex-col gap-3">

            {/* Recherche */}
            <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Rechercher une machine ou partition..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-400 tracking-wide">
                        <tr>
                            <th className="px-4 py-3 w-8" />
                            <th className="px-4 py-3 text-left">Machine</th>
                            <th className="px-4 py-3 text-left">Partitions</th>
                            <th className="px-4 py-3 text-left">Niveau</th>
                            <th className="px-4 py-3 text-left">Dernière sync</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
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
                                        <td className="px-4 py-3 text-gray-400">
                                            {expanded.has(d.computer_id)
                                                ? <ChevronDown size={15} />
                                                : <ChevronRight size={15} />}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">{d.computer_name}</td>
                                        <td className="px-4 py-3 text-gray-500">{d.partitions.length} partition(s)</td>
                                        <td className="px-4 py-3"><LevelBadge level={d.alert_level} /></td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(d.synced_at)}</td>
                                    </tr>

                                    {/* Lignes partitions — seulement si expanded */}
                                    {expanded.has(d.computer_id) && d.partitions.map((p) => (
                                        <tr key={p.id} className="bg-gray-50 text-xs border-l-2 border-l-gray-200">
                                            <td className="px-4 py-2" />
                                            <td className="px-4 py-2 text-gray-400 pl-7">└</td>
                                            <td className="px-4 py-2 font-mono text-gray-600">{p.mountpoint}</td>
                                            <td className="px-4 py-2" colSpan={2}>
                                                <div className="flex items-center gap-4">
                                                    <LevelBadge level={p.alert_level} />
                                                    <UsageBar value={p.free_percent} level={p.alert_level} inverted />
                                                    <span className="text-gray-400">libre</span>
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
                <p className="text-xs text-gray-400 text-right">{filtered.length} / {diskAlerts.length} machines</p>
            )}
        </div>
    );
}