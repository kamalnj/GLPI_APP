import { Card, CardContent } from '@/components/ui/card';

interface Props {
    overview: {
        machines_count: number;
        total_active_seconds: number;
        total_unlocks: number;
        last_activity: string;
    };
}

export default function StatsCards({ overview }: Props) {
    const hours = Math.floor(
        overview.total_active_seconds / 3600
    );

    const minutes = Math.floor(
        (overview.total_active_seconds % 3600) / 60
    );

    const cards = [
        {
            title: 'Machines',
            value: overview.machines_count,
        },
        {
            title: 'Temps actif',
            value: `${hours}h ${minutes}m`,
        },
        {
            title: 'Unlocks',
            value: overview.total_unlocks,
        },
        {
            title: 'Dernière activité',
            value: overview.last_activity,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground">
                            {card.title}
                        </div>

                        <div className="mt-2 text-2xl font-bold">
                            {card.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}