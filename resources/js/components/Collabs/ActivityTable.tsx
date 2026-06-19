import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Activity {
    date?: string;
    year?: number;
    period?: number;
    active_seconds: number;
    unlock_count: number;
}

interface Props {
    activities: Activity[];
    type?: 'day' | 'week' | 'month';
}

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function getLabel(a: Activity, type: 'day' | 'week' | 'month') {
    if (type === 'day') {
        return a.date ?? '-';
    }

    if (type === 'week') {
        return `Semaine ${a.period} - ${a.year}`;
    }

    return `${String(a.period).padStart(2, '0')}/${a.year}`;
}

export default function ActivityTable({ activities, type = 'day' }: Props) {
    const parentRef = useRef<HTMLDivElement>(null);

    const formattedActivities = useMemo(() => {
        return activities.map((a) => ({
            ...a,
            label: getLabel(a, type),
            formatted_time: formatDuration(a.active_seconds),
        }));
    }, [activities, type]);

    const virtualizer = useVirtualizer({
        count: formattedActivities.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 53, // Row height (44px + 8px padding + 1px border)
        overscan: 10,
    });

    const virtualItems = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();

    const paddingTop =
        virtualItems.length > 0 ? (virtualItems?.[0]?.start ?? 0) : 0;
    const paddingBottom =
        virtualItems.length > 0
            ? totalSize - (virtualItems?.[virtualItems.length - 1]?.end ?? 0)
            : 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    {type === 'day'
                        ? 'Heures par jour'
                        : type === 'week'
                          ? 'Heures par semaine'
                          : 'Heures par mois'}
                </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
                <div
                    ref={parentRef}
                    style={{
                        height: '500px',
                        overflow: 'auto',
                    }}
                >
                    <Table>
                        <TableHeader
                            style={{ position: 'sticky', top: 0, zIndex: 10 }}
                        >
                            <TableRow>
                                <TableHead>Période</TableHead>
                                <TableHead>Temps actif</TableHead>
                                <TableHead>Unlocks</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paddingTop > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        style={{ height: paddingTop }}
                                    />
                                </TableRow>
                            )}
                            {virtualItems.map((virtualItem) => {
                                const activity =
                                    formattedActivities[virtualItem.index];
                                return (
                                    <TableRow key={virtualItem.key}>
                                        <TableCell>{activity.label}</TableCell>

                                        <TableCell className="font-medium">
                                            {activity.formatted_time}
                                        </TableCell>

                                        <TableCell>
                                            {activity.unlock_count}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {paddingBottom > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        style={{ height: paddingBottom }}
                                    />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
