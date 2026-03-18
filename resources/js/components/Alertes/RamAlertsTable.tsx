import React from 'react'
import { AlertLevel, RamAlert } from '@/types/types';
import UsageBar from './UsageBar';
import LevelBadge from './LevelBadge';


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

export default function RamAlertsTable({ ramAlerts }: { ramAlerts: RamAlert[] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase text-gray-400 tracking-wide">
                    <tr>
                        <th className="px-4 py-3 text-left">Machine</th>
                        <th className="px-4 py-3 text-left">Barrette</th>
                        <th className="px-4 py-3 text-left">Utilisation</th>
                        <th className="px-4 py-3 text-left">Niveau</th>
                        <th className="px-4 py-3 text-left">Dernière sync</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {ramAlerts.map((r) => (
                        <tr key={r.id} className={`transition-colors ${rowBg(r.alert_level)}`}>
                            <td className="px-4 py-3 font-semibold text-gray-800">{r.computer_name}</td>
                            <td className="px-4 py-3 text-gray-500">{r.ram_name}</td>
                            <td className="px-4 py-3">
                                <UsageBar value={r.ram_usage} level={r.alert_level} />
                            </td>
                            <td className="px-4 py-3"><LevelBadge level={r.alert_level} /></td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.synced_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}