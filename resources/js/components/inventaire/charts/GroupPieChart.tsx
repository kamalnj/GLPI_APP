import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { memo, useMemo } from 'react';

export interface GroupStats {
    [groupe: string]: number;
}

const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4',
    '#84CC16', '#D946EF', '#0EA5E9', '#FB923C', '#4ADE80',
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value, payload: p } = payload[0];
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-md text-sm">
            <p className="font-medium text-gray-800 dark:text-gray-100">{name || p.groupe}</p>
            <p className="mt-1 font-semibold text-gray-700 dark:text-gray-300">{value} ordinateurs — {p.percentage}%</p>
        </div>
    );
};

export default memo(function GroupPieChart({ stats }: { stats: GroupStats }) {
    const chartData = useMemo(() => {
        const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
        return Object.entries(stats)
            .map(([groupe, count], index) => ({
                groupe: groupe || 'Non assigné',
                name: groupe || 'Non assigné',
                value: count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
                fill: COLORS[index % COLORS.length],
            }))
            .sort((a, b) => b.value - a.value);
    }, [stats]);

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Répartition par groupe</h3>
                <div className="text-center py-8 text-gray-400">Aucune donnée disponible</div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Répartition par groupe</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{chartData.length} groupe{chartData.length > 1 ? 's' : ''} — {total} ordinateurs</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Pie Chart */}
                <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                                isAnimationActive={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{total}</span>
                        <span className="text-xs text-gray-400 mt-0.5">PC total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {item.groupe}
                                </p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
                                <p className="text-xs text-gray-400">{item.percentage}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
