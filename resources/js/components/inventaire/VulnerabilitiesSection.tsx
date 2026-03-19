import { useState, useMemo, useRef, useEffect } from 'react';
import { FiShield, FiSearch, FiX } from 'react-icons/fi';
import { SectionCard } from './SectionCard';
import SeverityBadge from './SeverityBadge';
import ScoreBar from './ScoreBar';
import VulnerabilitySeverityChart from '@/components/inventaire/VulnerabilityChart';

type Vulnerability = {
    id: number;
    cve: string | null;
    severity: string | null;
    score: number | null;
    description: string | null;
    detected_at: string | null;
};

type Props = {
    vulnerabilities: Vulnerability[] | undefined;
    severityChartCurrent: { name: string; value: number }[];
    severityChartPrevious: { name: string; value: number }[];
    chartView: 'current' | 'previous';
    setChartView: (v: 'current' | 'previous') => void;
};

const ROW_HEIGHT = 56;
const VISIBLE_ROWS = 12;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

function AgeBadge({ detectedAt }: { detectedAt: string | null }) {
    if (!detectedAt) return <span className="text-gray-300">—</span>;
    const days = Math.floor((Date.now() - new Date(detectedAt).getTime()) / 86_400_000);
    const color =
        days > 90 ? 'text-red-500 bg-red-50' :
        days > 30 ? 'text-amber-600 bg-amber-50' :
                    'text-gray-500 bg-gray-100';
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
            {days}j
        </span>
    );
}

export default function VulnerabilitiesSection({
    vulnerabilities,
    severityChartCurrent,
    severityChartPrevious,
    chartView,
    setChartView,
}: Props) {
    const [search, setSearch] = useState('');
    const [scrollTop, setScrollTop] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const chartData = chartView === 'current' ? severityChartCurrent : severityChartPrevious;
    const hasChart = severityChartCurrent?.length > 0 || severityChartPrevious?.length > 0;

    const filtered = useMemo(() => {
        const list = vulnerabilities ?? [];
        if (!search.trim()) return list;
        const q = search.toLowerCase();
        return list.filter(
            (v) =>
                v.cve?.toLowerCase().includes(q) ||
                v.severity?.toLowerCase().includes(q) ||
                v.description?.toLowerCase().includes(q)
        );
    }, [vulnerabilities, search]);

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

    const isEmpty = !vulnerabilities || vulnerabilities.length === 0;

    return (
        <div className="flex flex-col gap-5">

            {hasChart && (
                <VulnerabilitySeverityChart
                    data={chartData}
                    chartView={chartView}
                    setChartView={setChartView}
                />
            )}

            <SectionCard title="Vulnérabilités détectées">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-300">
                        <FiShield size={32} />
                        <p className="text-sm text-gray-400">Aucune vulnérabilité détectée.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">

                        {/* Search + count */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <FiSearch
                                    size={13}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Rechercher CVE, sévérité, description…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-8 text-sm text-gray-700 placeholder-gray-400 transition focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-100"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX size={13} />
                                    </button>
                                )}
                            </div>
                            <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                                {filtered.length} / {vulnerabilities.length}
                            </span>
                        </div>

                        {/* Table */}
                        {filtered.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">Aucun résultat pour « {search} ».</p>
                        ) : (
                            <div className="-mx-5 overflow-x-auto">
                                {/* Fixed header */}
                                <table className="w-full min-w-175 border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/80">
                                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">CVE</th>
                                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Sévérité</th>
                                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-36">Score</th>
                                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</th>
                                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">Détecté le</th>
                                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Âge</th>
                                        </tr>
                                    </thead>
                                </table>

                                {/* Virtual scroll body */}
                                <div
                                    ref={scrollRef}
                                    onScroll={handleScroll}
                                    style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
                                    className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                >
                                    <div style={{ height: totalHeight, position: 'relative' }}>
                                        <table
                                            className="w-full min-w-175 border-collapse text-sm"
                                            style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}
                                        >
                                            <tbody>
                                                {visibleItems.map((v, i) => (
                                                    <tr
                                                        key={v.id}
                                                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/40"
                                                        style={{ height: ROW_HEIGHT }}
                                                    >
                                                        {/* CVE */}
                                                        <td className="px-5 py-3">
                                                            {v.cve ? (
                                                                <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-semibold text-blue-700 tracking-tight">
                                                                    {v.cve}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-300 text-xs">—</span>
                                                            )}
                                                        </td>

                                                        {/* Severity */}
                                                        <td className="px-5 py-3">
                                                            <SeverityBadge severity={v.severity} />
                                                        </td>

                                                        {/* Score */}
                                                        <td className="px-5 py-3 w-36">
                                                            <ScoreBar score={v.score} />
                                                        </td>

                                                        {/* Description */}
                                                        <td className="px-5 py-3 max-w-xs">
                                                            <p
                                                                className="line-clamp-2 text-xs leading-relaxed text-gray-500"
                                                                title={v.description ?? ''}
                                                            >
                                                                {v.description ?? <span className="text-gray-300">—</span>}
                                                            </p>
                                                        </td>

                                                        {/* Detected at */}
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <span className="font-mono text-[11px] text-gray-400">
                                                                {v.detected_at
                                                                    ? new Date(v.detected_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                    : <span className="text-gray-300">—</span>
                                                                }
                                                            </span>
                                                        </td>

                                                        {/* Age */}
                                                        <td className="px-5 py-3">
                                                            <AgeBadge detectedAt={v.detected_at} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Footer count */}
                                <div className="border-t border-gray-100 px-5 py-2.5 text-right">
                                    <span className="text-xs text-gray-400 tabular-nums">
                                        {filtered.length} vulnérabilité{filtered.length !== 1 ? 's' : ''}
                                        {search ? ` trouvée${filtered.length !== 1 ? 's' : ''}` : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}