import React from 'react';
import { FiAlertOctagon, FiAlertTriangle, FiLayers } from 'react-icons/fi';

interface Stats {
    totalComputers: number;
    vulnerableComputers: number;
    withoutSophos: number;
}

export default function KpiCards({ stats }: { stats: Stats }) {
    const cards = [
        {
            label: 'Total des ordinateurs',
            value: stats.totalComputers,
            icon: <FiLayers size={20} />,
            gradient: 'from-blue-500 to-blue-600',
            iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-foreground',
            border: 'border-border',
            hoverShadow: 'hover:shadow-blue-500/10',
        },
        {
            label: 'Ordinateurs vulnérables',
            value: stats.vulnerableComputers,
            icon: <FiAlertOctagon size={20} />,
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30',
            iconColor: 'text-red-600 dark:text-red-300',
            textColor: 'text-red-700 dark:text-red-300',
            border: 'border-border',
            hoverShadow: 'hover:shadow-red-500/10',
            percentage:
                stats.totalComputers > 0
                    ? Math.round(
                          (stats.vulnerableComputers / stats.totalComputers) *
                              100,
                      )
                    : 0,
        },
        {
            label: 'Ordinateurs sans Sophos',
            value: stats.withoutSophos,
            icon: <FiAlertTriangle size={20} />,
            gradient: 'from-orange-500 to-orange-600',
            iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30',
            iconColor: 'text-orange-600 dark:text-orange-300',
            textColor: 'text-orange-700 dark:text-orange-300',
            border: 'border-border',
            hoverShadow: 'hover:shadow-orange-500/10',
            percentage:
                stats.totalComputers > 0
                    ? Math.round(
                          (stats.withoutSophos / stats.totalComputers) * 100,
                      )
                    : 0,
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((kpi, index) => (
                    <div
                        key={kpi.label}
                        className={`group relative overflow-hidden rounded-2xl border ${kpi.border} bg-card p-5 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg ${kpi.hoverShadow} hover:-translate-y-1`}
                        style={{
                            animationDelay: `${index * 100}ms`,
                            animation: 'fadeInUp 0.5s ease-out forwards',
                        }}
                    >
                        {/* Decorative gradient bar */}
                        <div
                            className={`absolute top-0 left-0 h-1 w-full bg-linear-to-r ${kpi.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                        />

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {kpi.label}
                                </p>

                                <div className="flex items-baseline gap-2">
                                    <p
                                        className={`text-4xl font-bold ${kpi.textColor} tabular-nums`}
                                    >
                                        {kpi.value.toLocaleString('fr-FR')}
                                    </p>
                                    {kpi.percentage !== undefined && (
                                        <span className="text-sm font-medium text-muted-foreground">
                                            ({kpi.percentage}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.iconBg} ${kpi.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                            >
                                {kpi.icon}
                            </div>
                        </div>

                        {/* Progress bar for vulnerable/without sophos */}
                        {kpi.percentage !== undefined && (
                            <div className="mt-4">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={`h-full bg-linear-to-r ${kpi.gradient} transition-all duration-1000 ease-out`}
                                        style={{
                                            width: `${kpi.percentage}%`,
                                            animationDelay: `${index * 100 + 300}ms`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}</style>
        </>
    );
}
