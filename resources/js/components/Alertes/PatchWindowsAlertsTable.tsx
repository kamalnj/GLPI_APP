import { useState, useMemo, useRef, useEffect } from 'react';
import {  PatchWindowsAlert } from '@/types/types';
import { FiSearch } from 'react-icons/fi';

export const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const ROW_HEIGHT = 53;
const VISIBLE_ROWS = 15;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;



export default function PatchWindowsAlertsTable({ patchWindowsAlerts }: { patchWindowsAlerts: PatchWindowsAlert[] }) {

        const [search, setSearch] = useState('');
    const [scrollTop, setScrollTop] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
        const filtered = useMemo(() => {
            if (!search.trim()) return patchWindowsAlerts;
            const q = search.toLowerCase();
            return patchWindowsAlerts.filter(
                (r) =>
                    r.computer_name?.toLowerCase().includes(q) ||
                    r.patch_name?.toLowerCase().includes(q)
            );
        }, [patchWindowsAlerts, search]);
    
        // Virtual scroll
        const totalHeight = filtered.length * ROW_HEIGHT;
        const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
        const endIndex = Math.min(startIndex + VISIBLE_ROWS + 2, filtered.length);
        const visibleItems = filtered.slice(startIndex, endIndex);
        const offsetY = startIndex * ROW_HEIGHT;
    
        const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
            setScrollTop(e.currentTarget.scrollTop);
        };
    
        useEffect(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
            setScrollTop(0);
        }, [search]);
    return (
            <div className="flex flex-col gap-3">
    
                {/* Recherche */}
                <div className="relative">
                    <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Rechercher une machine ou patch..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
    
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    
                    {/* En-tête fixe */}
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-400 tracking-wide">
                            <tr>
                                <th className="px-4 py-3 text-left">Machine</th>
                                <th className="px-4 py-3 text-left">Nom du patch</th>
                                <th className="px-4 py-3 text-left">Date d'installation</th>
                                <th className="px-4 py-3 text-left">Dernière sync</th>
                            </tr>
                        </thead>
                    </table>
    
                    {filtered.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">Aucune alerte patch Windows trouvée.</p>
                    ) : (
                        /* Zone scrollable */
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
                        >
                            <div style={{ height: totalHeight, position: 'relative' }}>
                                <table
                                    className="min-w-full text-sm text-gray-700"
                                    style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}
                                >
                                    <tbody className="divide-y divide-gray-100">
                                        {visibleItems.map((r) => (
                                            <tr key={r.id} className={`transition-colors `} style={{ height: ROW_HEIGHT }}>
                                                <td className="px-4 py-3 font-semibold text-gray-800">{r.computer_name}</td>
                                                <td className="px-4 py-3 text-gray-500">{r.patch_name}</td>
                                                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.date_install)}</td>
                                                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.synced_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
    
                {/* Compteur */}
                {filtered.length !== patchWindowsAlerts.length && (
                    <p className="text-xs text-gray-400 text-right">{filtered.length} / {patchWindowsAlerts.length} alertes</p>
                )}
            </div>
        );
    }
