import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { MemoryStick } from 'lucide-react';
import { memo, useMemo } from 'react';

interface RamData {
    ram_gb: number;
    device_count: number;
}

interface RamDistributionChartProps {
    data: RamData[];
}

// Memoized tooltip
const CustomTooltip = memo(({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
            <p className="mb-1 font-semibold text-gray-800">
                {payload[0].payload.label}
            </p>
            <p className="text-sm font-medium text-indigo-600">
                {payload[0].value} appareils
            </p>
        </div>
    );
});

CustomTooltip.displayName = 'CustomTooltip';

export const RamDistributionChart = memo(
    ({ data }: RamDistributionChartProps) => {
        // Memoize formatted data and total
        const { formattedData, totalDevices } = useMemo(() => {
            if (!data || data.length === 0) {
                return { formattedData: [], totalDevices: 0 };
            }

            const formatted = data.map((item) => ({
                ...item,
                label: `${item.ram_gb} GB`,
            }));

            const total = data.reduce(
                (sum, item) => sum + item.device_count,
                0,
            );

            return { formattedData: formatted, totalDevices: total };
        }, [data]);

        const isEmpty = !data || data.length === 0;

        if (isEmpty) {
            return (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <MemoryStick className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-base">
                                Distribution RAM (GB)
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <MemoryStick className="mx-auto mb-3 h-12 w-12 text-gray-300" />
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
                            <MemoryStick className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-base">
                                Distribution RAM (GB)
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={formattedData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="label"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#d1d5db"
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#d1d5db"
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: '#eef2ff' }}
                            />
                            <Bar
                                dataKey="device_count"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                                isAnimationActive={false}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    },
);

RamDistributionChart.displayName = 'RamDistributionChart';
