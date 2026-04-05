import { useState, useMemo, useRef, useEffect } from 'react';
import { outDateInventoryAlert } from '@/types/types';
import { FiSearch } from 'react-icons/fi';

export const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const ROW_HEIGHT = 53;
const VISIBLE_ROWS = 15;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

export default function OutDateInventoryTable({
    outDateInventoryAlerts,
}: {
    outDateInventoryAlerts: outDateInventoryAlert[];
}) {
    const [search, setSearch] = useState('');
    const [scrollTop, setScrollTop] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const filtered = useMemo(() => {
        if (!search.trim()) return outDateInventoryAlerts;
        const q = search.toLowerCase();
        return outDateInventoryAlerts.filter((r) =>
            r.name?.toLowerCase().includes(q),
        );
    }, [outDateInventoryAlerts, search]);

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
                <FiSearch
                    size={14}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder="Rechercher une machine ou patch..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white py-2 pr-3 pl-8 text-sm placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                {/* En-tête fixe */}
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs tracking-wide text-gray-400 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Machine</th>
                            <th className="px-4 py-3 text-left">
                                Dernière mise à jour de l'inventaire
                            </th>
                            <th className="px-4 py-3 text-left">
                                Dernière sync
                            </th>
                        </tr>
                    </thead>
                </table>

                {filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                        Aucune alerte inventaire obsolète trouvée.
                    </p>
                ) : (
                    /* Zone scrollable */
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
                    >
                        <div
                            style={{
                                height: totalHeight,
                                position: 'relative',
                            }}
                        >
                            <table
                                className="min-w-full text-sm text-gray-700"
                                style={{
                                    position: 'absolute',
                                    top: offsetY,
                                    left: 0,
                                    right: 0,
                                }}
                            >
                                <tbody className="divide-y divide-gray-100">
                                    {visibleItems.map((r) => (
                                        <tr
                                            key={r.id}
                                            className={`transition-colors`}
                                            style={{ height: ROW_HEIGHT }}
                                        >
                                            <td className="px-4 py-3 font-semibold text-gray-800">
                                                {r.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {r.last_inventory_update}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-400">
                                                {formatDate(r.synced_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Compteur */}
            {filtered.length !== outDateInventoryAlerts.length && (
                <p className="text-right text-xs text-gray-400">
                    {filtered.length} / {outDateInventoryAlerts.length} alertes
                </p>
            )}
        </div>
    );
}
