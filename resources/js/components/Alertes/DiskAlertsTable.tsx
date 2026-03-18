import { AlertLevel, DiskAlert } from '@/types/types';
import React, { useState } from 'react'
import { ChevronDown, ChevronRight} from 'lucide-react';
import LevelBadge from './LevelBadge';
import UsageBar from './UsageBar';


const rowBg = (level: AlertLevel) =>
    level === 'critical' ? 'bg-red-50/40 hover:bg-red-50' : 'bg-amber-50/30 hover:bg-amber-50/60';

export const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export default function DiskAlertsTable({ diskAlerts }: { diskAlerts: DiskAlert[] }) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (id: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
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
                    {diskAlerts.map((d) => (
                        <React.Fragment key={d.computer_id}>
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
                                <td className="px-4 py-3 text-gray-500">
                                    {d.partitions.length} partition(s)
                                </td>
                                <td className="px-4 py-3"><LevelBadge level={d.alert_level} /></td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(d.synced_at)}</td>
                            </tr>

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
                    ))}
                </tbody>
            </table>
        </div>
    );
}
