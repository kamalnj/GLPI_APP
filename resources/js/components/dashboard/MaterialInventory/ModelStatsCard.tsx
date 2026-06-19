import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Cpu, TrendingUp } from 'lucide-react';

interface ModelStatsCardProps {
    differentModelsCount: number;
    topModel: {
        computer_model: string;
        count: number;
    } | null;
    totalMachines: number;
}

export function ModelStatsCard({
    differentModelsCount,
    topModel,
    totalMachines,
}: ModelStatsCardProps) {
    const topModelPercentage = topModel
        ? Math.round((topModel.count / totalMachines) * 100)
        : 0;

    const stats = [
        {
            title: 'Nombre de machines',
            value: totalMachines,
            description: 'machines détectées',
            icon: Cpu,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Nombre de modèles',
            value: differentModelsCount,
            description: 'modèles différents détectés',
            icon: TrendingUp,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            title: 'Modèle principal',
            value: topModel?.computer_model || 'N/A',
            description: topModel
                ? `${topModel.count} appareils (${topModelPercentage}%)`
                : 'Aucune donnée',
            icon: Monitor,
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            isText: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div
                            className={`absolute top-0 right-0 left-0 h-1 bg-linear-to-r ${stat.gradient}`}
                        />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-6 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.iconBg} rounded-lg p-2.5`}>
                                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div
                                className={`${stat.isText ? 'text-xl' : 'text-3xl'} bg-linear-to-r font-bold ${stat.gradient} mb-1 bg-clip-text text-transparent`}
                            >
                                {stat.value}
                            </div>
                            <p className="text-xs font-medium text-gray-500"></p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
