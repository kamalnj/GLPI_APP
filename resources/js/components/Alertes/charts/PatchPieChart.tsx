import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { memo } from 'react';

export interface PatchStats {
    critical: number;
    alert: number;
    up_to_date: number;
    total: number;
}

const PATCH_SEGMENTS = [
    {
        key: 'critical' as const,
        label: 'Critique',
        sub: 'Patch > 90 jours',
        color: '#E24B4A',
        textClass: 'text-red-700 dark:text-red-300',
        bgClass: 'bg-red-50 dark:bg-red-900/30',
        dotClass: 'bg-red-500',
    },
    {
        key: 'alert' as const,
        label: 'Alerte',
        sub: 'Patch 30–90 jours',
        color: '#EF9F27',
        textClass: 'text-amber-700 dark:text-amber-300',
        bgClass: 'bg-amber-50 dark:bg-amber-900/30',
        dotClass: 'bg-amber-400',
    },
    {
        key: 'up_to_date' as const,
        label: 'À jour',
        sub: 'Patch < 30 jours',
        color: '#639922',
        textClass: 'text-green-700 dark:text-green-300',
        bgClass: 'bg-green-50 dark:bg-green-900/30',
        dotClass: 'bg-green-600',
    },
];

const PatchTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value, payload: p } = payload[0];
    const seg = PATCH_SEGMENTS.find((s) => s.label === name);
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md dark:border-gray-700 dark:bg-gray-900">
            <p className="font-medium text-gray-800 dark:text-gray-100">
                {name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{p.sub}</p>
            <p className="mt-1 font-semibold" style={{ color: seg?.color }}>
                {value} PC — {p.pct}%
            </p>
        </div>
    );
};

export default memo(function PatchPieChart({ stats }: { stats: PatchStats }) {
    const { critical, alert, up_to_date, total } = stats;
    const chartData = [
        {
            name: 'Critique',
            value: critical,
            sub: 'Patch > 90 jours',
            pct: Math.round((critical / total) * 100),
        },
        {
            name: 'Alerte',
            value: alert,
            sub: 'Patch 30–90 jours',
            pct: Math.round((alert / total) * 100),
        },
        {
            name: 'À jour',
            value: up_to_date,
            sub: 'Patch < 30 jours',
            pct: Math.round((up_to_date / total) * 100),
        },
    ];
    const counts = { critical, alert, up_to_date };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Patches Windows
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                        {critical + alert} PC non à jour sur {total}
                    </p>
                </div>
                {critical > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {critical} critique{critical > 1 ? 's' : ''}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-6">
                <div
                    className="relative shrink-0"
                    style={{ width: 180, height: 180 }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={58}
                                outerRadius={82}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                                isAnimationActive={false}
                            >
                                {chartData.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={PATCH_SEGMENTS[i].color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<PatchTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl leading-none font-semibold text-gray-800 dark:text-gray-100">
                            {total}
                        </span>
                        <span className="mt-0.5 text-xs text-gray-400">
                            PC total
                        </span>
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    {PATCH_SEGMENTS.map((seg) => {
                        const count = counts[seg.key];
                        const pct = Math.round((count / total) * 100);
                        return (
                            <div
                                key={seg.key}
                                className={`flex items-center justify-between rounded-lg px-3 py-2 ${seg.bgClass}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2.5 w-2.5 shrink-0 rounded-sm ${seg.dotClass}`}
                                    />
                                    <div>
                                        <p
                                            className={`text-xs font-medium ${seg.textClass}`}
                                        >
                                            {seg.label}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {seg.sub}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-sm font-semibold ${seg.textClass}`}
                                    >
                                        {count} PC
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {pct}%
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
