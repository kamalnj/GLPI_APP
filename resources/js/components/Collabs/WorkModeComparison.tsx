import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { Building2, Wifi } from 'lucide-react';

interface Props {
    userName: string;
    onsite_hours: number;
    remote_hours: number;
    mode: 'current' | 'previous';
}

const MODES = [
    { key: 'current' as const, label: 'Mois courant' },
    { key: 'previous' as const, label: 'Mois précédent' },
];

export default function WorkModeComparison({
    userName,
    onsite_hours,
    remote_hours,
    mode,
}: Props) {
    const total = onsite_hours + remote_hours;

    const { onsitePercent, remotePercent } = useMemo(() => ({
        onsitePercent: total ? (onsite_hours / total) * 100 : 0,
        remotePercent: total ? (remote_hours / total) * 100 : 0,
    }), [onsite_hours, remote_hours, total]);

    const switchMode = useCallback(
        (newMode: 'current' | 'previous') => {
            if (newMode === mode) return;
            router.get(
                `/collaborateurs/${userName}`,
                { mode: newMode },
                { preserveState: true, replace: true }
            );
        },
        [mode, userName]
    );

    return (
        <Card className="overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-emerald-500 to-blue-500" />

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold">
                        On-site vs Remote
                    </CardTitle>

                    <div
                        role="group"
                        aria-label="Période"
                        className="inline-flex gap-0.5 rounded-lg border bg-muted p-0.5"
                    >
                        {MODES.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => switchMode(key)}
                                aria-pressed={mode === key}
                                className={`rounded-md px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    mode === key
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {total === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Aucune donnée disponible
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border bg-muted/40 p-3">
                                <div className="mb-2 flex items-center gap-1.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                        <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        On-site
                                    </span>
                                </div>
                                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                    {onsite_hours}
                                    <span className="text-sm font-medium">h</span>
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {onsitePercent.toFixed(1)}% du total
                                </p>
                            </div>

                            <div className="rounded-xl border bg-muted/40 p-3">
                                <div className="mb-2 flex items-center gap-1.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                        <Wifi className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Remote
                                    </span>
                                </div>
                                <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                                    {remote_hours}
                                    <span className="text-sm font-medium">h</span>
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {remotePercent.toFixed(1)}% du total
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div
                                role="meter"
                                aria-label={`On-site ${onsitePercent.toFixed(1)}%, Remote ${remotePercent.toFixed(1)}%`}
                                aria-valuenow={onsitePercent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    style={{ width: `${onsitePercent}%` }}
                                    className="bg-emerald-500 transition-all duration-500 ease-in-out"
                                />
                                <div
                                    style={{ width: `${remotePercent}%` }}
                                    className="bg-blue-500 transition-all duration-500 ease-in-out"
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                    On-site
                                </span>
                                <span className="flex items-center gap-1.5">
                                    Remote
                                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}