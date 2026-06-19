import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { memo, useMemo } from 'react';

interface LowDiskData {
    groupe: string;
    low_disk_devices: number;
}

interface LowDiskDevicesByGroupeChartProps {
    data: LowDiskData[];
}

// Simple color palette
const COLORS = [
    '#f97316',
    '#fb923c',
    '#fdba74',
    '#fed7aa',
    '#ea580c',
    '#c2410c',
    '#9a3412',
    '#7c2d12',
    '#ff6b35',
    '#ff8c42',
    '#ffa94d',
    '#ffc078',
];

// Memoized tooltip
const CustomTooltip = memo(({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    return (
        <div className="rounded border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-sm font-medium">{payload[0].name}</p>
            <p className="font-semibold text-orange-600">
                {payload[0].value} appareils
            </p>
        </div>
    );
});

CustomTooltip.displayName = 'CustomTooltip';

export const LowDiskDevicesByGroupeChart = memo(
    ({ data }: LowDiskDevicesByGroupeChartProps) => {
        // Memoize calculations
        const totalDevices = useMemo(
            () =>
                data?.reduce((sum, item) => sum + item.low_disk_devices, 0) ||
                0,
            [data],
        );

        const isEmpty = !data || data.length === 0;

        if (isEmpty) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Faible espace disque par groupe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-64 items-center justify-center">
                        <p className="text-sm text-gray-500">
                            Aucune donnée disponible
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Faible espace disque par groupe
                        </CardTitle>
                        <span className="text-2xl font-bold text-orange-600">
                            {totalDevices}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                dataKey="low_disk_devices"
                                nameKey="groupe"
                                isAnimationActive={false}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
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

LowDiskDevicesByGroupeChart.displayName = 'LowDiskDevicesByGroupeChart';
