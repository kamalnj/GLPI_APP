export default function StatCard({
    icon,
    label,
    count,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    color: string;
}) {
    return (
        <div
            className={`flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-card-foreground shadow-sm ${color}`}
        >
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
