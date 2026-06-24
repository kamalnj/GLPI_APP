import { KpiStats } from '@/types/types';
import { HardDrive, Download, Clock } from 'lucide-react';

interface Props {
    stats: KpiStats;
}

// ── Barre segmentée ──────────────────────────────────────────────────────────
function SegBar({
    segments,
}: {
    segments: { value: number; color: string }[];
}) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return null;

    return (
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
            {segments.map((seg, i) => (
                <div
                    key={i}
                    className="h-full rounded-sm"
                    style={{ background: seg.color, flex: seg.value }}
                />
            ))}
        </div>
    );
}

// ── Ligne légende ────────────────────────────────────────────────────────────
function LegendRow({
    color,
    icon,
    label,
    value,
}: {
    color?: string;
    icon?: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {color && (
                    <span
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: color }}
                    />
                )}
                {icon && <span className="text-muted-foreground">{icon}</span>}
                {label}
            </div>
            <span className="text-xs font-medium text-foreground">{value}</span>
        </div>
    );
}

// ── Pied de carte ────────────────────────────────────────────────────────────
function CardFoot({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {children}
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-border" />;
}

// ── Label de santé ───────────────────────────────────────────────────────────
function healthLabel(pct: number): { text: string; color: string } {
    if (pct >= 90) return { text: 'Bon', color: '#3B6D11' };
    if (pct >= 70) return { text: 'Acceptable', color: '#854F0B' };
    return { text: 'Critique', color: '#A32D2D' };
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function KpiCards({ stats }: Props) {
    const health = healthLabel(stats.healthPct);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Card 1 — Santé globale */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground">
                <p className="text-xs text-muted-foreground">Santé du parc</p>

                <div>
                    <span
                        className="text-[42px] leading-none font-medium"
                        style={{ color: health.color }}
                    >
                        {stats.healthPct}
                    </span>
                    <span className="ml-0.5 text-lg text-muted-foreground">%</span>
                    <p
                        className="mt-1.5 text-sm font-medium"
                        style={{ color: health.color }}
                    >
                        {health.text}
                    </p>
                </div>

                <SegBar
                    segments={[
                        { value: stats.machinesOk, color: '#639922' },
                        { value: stats.machinesAlert, color: '#EF9F27' },
                        { value: stats.machinesCritical, color: '#E24B4A' },
                    ]}
                />

                <div className="flex flex-col gap-2">
                    <LegendRow
                        color="#639922"
                        label="Machines saines"
                        value={stats.machinesOk}
                    />
                    <LegendRow
                        color="#EF9F27"
                        label="Machines en alerte"
                        value={stats.machinesAlert}
                    />
                    <LegendRow
                        color="#E24B4A"
                        label="Machines critiques"
                        value={stats.machinesCritical}
                    />
                </div>

                <Divider />
                <CardFoot>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
                    {stats.totalMachines} machines au total
                </CardFoot>
            </div>

            {/* Card 2 — Alertes actives */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground">
                <p className="text-xs text-muted-foreground">Alertes actives</p>

                <div>
                    <span className="text-[42px] leading-none font-medium text-red-800 dark:text-red-300">
                        {stats.totalCritical}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-red-800 dark:text-red-300">
                        critiques
                    </p>
                </div>

                <Divider />

                <div className="flex flex-col gap-2">
                    <LegendRow
                        icon={<HardDrive size={13} />}
                        label="Disques"
                        value={stats.countDisk}
                    />
                    <LegendRow
                        icon={<Download size={13} />}
                        label="Patches"
                        value={stats.countPatch}
                    />
                    <LegendRow
                        icon={<Clock size={13} />}
                        label="Inventaire"
                        value={stats.countInventory}
                    />
                </div>

                <Divider />
                <CardFoot>
                    <Clock size={11} />
                    Total : {stats.totalCritical + stats.totalAlert} alertes
                    ouvertes
                </CardFoot>
            </div>

            {/* Card 3 — Machines concernées */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground">
                <p className="text-xs text-muted-foreground">Machines concernées</p>

                <div>
                    <span className="text-[42px] leading-none font-medium text-foreground">
                        {stats.machinesWithAlerts}
                    </span>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        sur {stats.totalMachines} machines
                    </p>
                </div>

                <SegBar
                    segments={[
                        { value: stats.machinesCritical, color: '#E24B4A' },
                        { value: stats.machinesAlert, color: '#EF9F27' },
                        { value: stats.machinesOk, color: '#D3D1C7' },
                    ]}
                />

                <div className="flex flex-col gap-2">
                    <LegendRow
                        color="#E24B4A"
                        label="Niveau critique"
                        value={stats.machinesCritical}
                    />
                    <LegendRow
                        color="#EF9F27"
                        label="Niveau alerte"
                        value={stats.machinesAlert}
                    />
                    <LegendRow
                        color="#D3D1C7"
                        label="OK"
                        value={stats.machinesOk}
                    />
                </div>

                <Divider />
                <CardFoot>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
                    Données actuelles
                </CardFoot>
            </div>
        </div>
    );
}
