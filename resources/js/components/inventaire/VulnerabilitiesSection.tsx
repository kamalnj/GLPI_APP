// components/inventaire/details/VulnerabilitiesSection.tsx

import { FiShield } from 'react-icons/fi';
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

export default function VulnerabilitiesSection({
    vulnerabilities,
    severityChartCurrent,
    severityChartPrevious,
    chartView,
    setChartView,
}: Props) {
    const hasChart =
        severityChartCurrent?.length > 0 || severityChartPrevious?.length > 0;
    const chartData =
        chartView === 'current' ? severityChartCurrent : severityChartPrevious;

    return (
        <div className="flex flex-col gap-6">
            {hasChart && (
                <VulnerabilitySeverityChart
                    data={chartData}
                    chartView={chartView}
                    setChartView={setChartView}
                />
            )}

            <SectionCard
                title="Vulnérabilités détectées"
                count={vulnerabilities?.length ?? 0}
            >
                {!vulnerabilities || vulnerabilities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400">
                        <FiShield size={36} className="text-gray-300" />
                        <p className="text-sm">Aucune vulnérabilité détectée.</p>
                    </div>
                ) : (
                    <div className="-mx-5 overflow-x-auto">
                        <table className="w-full min-w-150 border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        CVE
                                    </th>
                                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Sévérité
                                    </th>
                                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Score
                                    </th>
                                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Description
                                    </th>
                                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Détecté le
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vulnerabilities.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="cursor-pointer transition-colors hover:bg-gray-50/80"
                                    >
                                        <td className="px-4 sm:px-5 py-3.5">
                                            <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-blue-700">
                                                {v.cve ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-5 py-3.5">
                                            <SeverityBadge severity={v.severity} />
                                        </td>
                                        <td className="px-4 sm:px-5 py-3.5">
                                            <ScoreBar score={v.score} />
                                        </td>
                                        <td className="max-w-xs px-4 sm:px-5 py-3.5">
                                            <p
                                                className="line-clamp-2 text-xs leading-relaxed text-gray-600"
                                                title={v.description ?? ''}
                                            >
                                                {v.description ?? '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 sm:px-5 py-3.5">
                                            <span className="font-mono text-xs text-gray-500">
                                                {v.detected_at ?? '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
}