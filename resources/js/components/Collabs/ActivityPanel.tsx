import { Activity as ActivityIcon } from 'lucide-react';
import ActivityTable from '@/components/Collabs/ActivityTable';
import EmptyState from '@/components/Collabs/EmptyState';

type ActivityPeriod = 'day' | 'week' | 'month';

interface ActivityPanelProps {
    activities: any[];
    activityPeriod: ActivityPeriod;
    onPeriodChange: (period: ActivityPeriod) => void;
}

const PERIODS: { key: ActivityPeriod; label: string }[] = [
    { key: 'day', label: 'Jour' },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
];

export default function ActivityPanel({
    activities,
    activityPeriod,
    onPeriodChange,
}: ActivityPanelProps) {
    return (
        <div role="tabpanel" id="panel-activity" aria-labelledby="tab-activity">
            <div
                className="mb-4 inline-flex gap-1 rounded-lg border p-1"
                role="group"
                aria-label="Période d'activité"
            >
                {PERIODS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => onPeriodChange(key)}
                        aria-pressed={activityPeriod === key}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                            activityPeriod === key
                                ? 'bg-foreground text-background'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activities.length > 0 ? (
                <ActivityTable activities={activities} type={activityPeriod} />
            ) : (
                <EmptyState
                    icon={ActivityIcon}
                    label="Aucune activité récente"
                />
            )}
        </div>
    );
}
