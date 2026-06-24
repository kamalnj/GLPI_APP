// components/inventaire/details/SectionCard.tsx

export function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
            <span className="w-36 shrink-0 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </span>
            <span className="text-right text-sm font-medium text-foreground">
                {value ?? <span className="text-gray-300">—</span>}
            </span>
        </div>
    );
}

export function SectionCard({
    title,
    count,
    children,
}: {
    title: string;
    count?: number;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/60 px-5 py-4">
                <h2 className="text-sm font-semibold tracking-wide text-foreground">
                    {title}
                </h2>
                {count !== undefined && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {count}
                    </span>
                )}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}
