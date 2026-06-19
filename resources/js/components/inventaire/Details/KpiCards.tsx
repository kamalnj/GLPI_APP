// components/inventaire/details/KpiCards.tsx

import {
    FiLayers,
    FiAlertOctagon,
    FiAlertTriangle,
    FiClock,
} from 'react-icons/fi';

type SecurityKpis = {
    total: number;
    critical: number;
    high: number;
    last_detected: string | null;
};

export default function KpiCards({ kpis }: { kpis: SecurityKpis }) {
    const cards = [
        {
            label: 'Total',
            value: kpis.total,
            icon: <FiLayers size={18} />,
            color: 'text-gray-700',
            iconBg: 'bg-gray-100 text-gray-500',
            small: false,
        },
        {
            label: 'Critique',
            value: kpis.critical,
            icon: <FiAlertOctagon size={18} />,
            color: 'text-red-600',
            iconBg: 'bg-red-50 text-red-500',
            small: false,
        },
        {
            label: 'Élevé',
            value: kpis.high,
            icon: <FiAlertTriangle size={18} />,
            color: 'text-orange-500',
            iconBg: 'bg-orange-50 text-orange-400',
            small: false,
        },
        {
            label: 'Dernière détection',
            value: kpis.last_detected ?? 'N/A',
            icon: <FiClock size={18} />,
            color: 'text-gray-700',
            iconBg: 'bg-gray-100 text-gray-500',
            small: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {cards.map((kpi) => (
                <div
                    key={kpi.label}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
                >
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${kpi.iconBg} shrink-0`}
                    >
                        {kpi.icon}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[10px] font-medium tracking-wide text-gray-400 uppercase sm:text-xs">
                            {kpi.label}
                        </div>
                        <div
                            className={`leading-tight font-bold ${
                                kpi.small
                                    ? 'mt-0.5 font-mono text-xs sm:text-sm'
                                    : 'text-xl sm:text-2xl'
                            } ${kpi.color}`}
                        >
                            {kpi.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
