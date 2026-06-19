import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface RemoteOnsiteAverageProps {
    onsite_percent: number;
    remote_percent: number;
    onsite_avg_hours: number;
    remote_avg_hours: number;
}

const COLORS = ['#3b82f6', '#10b981'];

export function RemoteOnsiteAverage({
    onsite_percent,
    remote_percent,
    onsite_avg_hours,
    remote_avg_hours,
}: RemoteOnsiteAverageProps) {
    const data = [
        { name: 'On-site', value: onsite_percent },
        { name: 'Remote', value: remote_percent },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mode de travail - Répartition moyenne</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Pie Chart */}
                    <div>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip formatter={(value) => `${value}%`} />

                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="mb-1 text-sm text-gray-600">
                                On-site
                            </p>

                            <p className="text-2xl font-bold text-blue-600">
                                {onsite_percent}%
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Moyenne : {onsite_avg_hours} h par utilisateur
                                (ce mois)
                            </p>
                        </div>

                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="mb-1 text-sm text-gray-600">Remote</p>

                            <p className="text-2xl font-bold text-green-600">
                                {remote_percent}%
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Moyenne : {remote_avg_hours} h par utilisateur
                                (ce mois)
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
