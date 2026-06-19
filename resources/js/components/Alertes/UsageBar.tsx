import { AlertLevel } from '@/types/types';

export default function UsageBar({
    value,
    level,
    inverted = false,
}: {
    value: number;
    level: AlertLevel;
    inverted?: boolean;
}) {
    const fill = inverted ? 100 - value : value;
    const color = level === 'critical' ? 'bg-red-500' : 'bg-amber-400';

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${Math.min(fill, 100)}%` }}
                />
            </div>
            <span className="text-xs text-gray-600">{value}%</span>
        </div>
    );
}
