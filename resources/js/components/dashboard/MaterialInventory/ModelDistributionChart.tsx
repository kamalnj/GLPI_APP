import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Laptop } from 'lucide-react';
import { memo, useMemo } from 'react';

interface ModelData {
    name: string;
    value: number;
    fill?: string;
}

interface ModelDistributionChartProps {
    data: ModelData[];
}

const COLORS = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
    '#84cc16',
];

// Memoized tooltip
const CustomTooltip = memo(({ active, payload, totalDevices }: any) => {
    if (!active || !payload?.[0]) return null;

    const percent = ((payload[0].value / totalDevices) * 100).toFixed(1);
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
            <p className="mb-1 font-semibold text-gray-800">
                {payload[0].name}
            </p>
            <p className="text-sm font-medium text-violet-600">
                {payload[0].value} appareils ({percent}%)
            </p>
        </div>
    );
});

CustomTooltip.displayName = 'CustomTooltip';

export const ModelDistributionChart = memo(
    ({ data }: ModelDistributionChartProps) => {
        // Memoize data with colors assigned
        const { chartData, totalDevices } = useMemo(() => {
            if (!data || data.length === 0) {
                return { chartData: [], totalDevices: 0 };
            }

            const total = data.reduce((sum, item) => sum + item.value, 0);
            const dataWithColors = data.map((item, index) => ({
                ...item,
                fill: COLORS[index % COLORS.length],
            }));

            return { chartData: dataWithColors, totalDevices: total };
        }, [data]);

        const isEmpty = !data || data.length === 0;

        if (isEmpty) {
            return (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Laptop className="h-5 w-5 text-violet-600" />
                            <CardTitle className="text-base">
                                Répartition des modèles (Top 10)
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <Laptop className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="text-sm text-gray-500">
                                Aucune donnée disponible
                            </p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Laptop className="h-5 w-5 text-violet-600" />
                            <CardTitle className="text-base">
                                Répartition des modèles
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                innerRadius={60}
                                dataKey="value"
                                nameKey="name"
                                isAnimationActive={false}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip
                                        totalDevices={totalDevices}
                                    />
                                }
                            />
                            <Legend
                                wrapperStyle={{ fontSize: '14px' }}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    },
);

ModelDistributionChart.displayName = 'ModelDistributionChart';
