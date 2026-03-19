import { useState, useMemo, useRef, useEffect } from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';

type Software = {
    id: number;
    software_name: string | null;
    version: string | null;
    date_install: string | null;
};

const ROW_HEIGHT = 41;
const VISIBLE_ROWS = 15;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

interface Props {
    softwares: Software[]; 
}

export default function SoftwaresSection({ softwares }: Props) {
    const [search, setSearch] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);

    const filtered = useMemo(() => {
        if (!search.trim()) return softwares;
        const q = search.toLowerCase();
        return softwares.filter(
            (s) =>
                s.software_name?.toLowerCase().includes(q) ||
                s.version?.toLowerCase().includes(q)
        );
    }, [softwares, search]);

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
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Logiciels installés</h2>
                <span className="text-xs text-gray-400">
                    {filtered.length === softwares.length
                        ? `${softwares.length} logiciel${softwares.length > 1 ? 's' : ''}`
                        : `${filtered.length} / ${softwares.length}`}
                </span>
            </div>

            <div className="relative mb-3">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Rechercher un logiciel..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium">Nom</th>
                            <th className="px-3 py-2 text-left font-medium">Version</th>
                            <th className="px-3 py-2 text-left font-medium">Date d'installation</th>
                        </tr>
                    </thead>
                </table>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                        <FiPackage size={24} />
                        <span className="text-sm">Aucun logiciel trouvé</span>
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
                    >
                        <div style={{ height: totalHeight, position: 'relative' }}>
                            <table
                                className="w-full text-sm"
                                style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}
                            >
                                <tbody>
                                    {visibleItems.map((s) => (
                                        <tr
                                            key={s.id}
                                            className="border-b last:border-b-0 hover:bg-gray-50"
                                            style={{ height: ROW_HEIGHT }}
                                        >
                                            <td className="px-3 py-2 max-w-xs truncate">{s.software_name ?? '—'}</td>
                                            <td className="px-3 py-2 text-gray-500">{s.version ?? '—'}</td>
                                            <td className="px-3 py-2 text-gray-500">
                                                {s.date_install
                                                    ? new Date(s.date_install).toLocaleDateString('fr-FR')
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}