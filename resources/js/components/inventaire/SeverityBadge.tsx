// components/inventaire/details/SeverityBadge.tsx

const severityConfig: Record<
    string,
    { label: string; color: string; bg: string; dot: string }
> = {
    CRITICAL: {
        label: 'Critical',
        color: 'text-red-700',
        bg: 'bg-red-50 border-red-200',
        dot: 'bg-red-500',
    },
    HIGH: {
        label: 'High',
        color: 'text-orange-700',
        bg: 'bg-orange-50 border-orange-200',
        dot: 'bg-orange-400',
    },
    MEDIUM: {
        label: 'Medium',
        color: 'text-yellow-700',
        bg: 'bg-yellow-50 border-yellow-200',
        dot: 'bg-yellow-400',
    },
    LOW: {
        label: 'Low',
        color: 'text-blue-700',
        bg: 'bg-blue-50 border-blue-200',
        dot: 'bg-blue-400',
    },
    INFO: {
        label: 'Info',
        color: 'text-gray-600',
        bg: 'bg-gray-50 border-gray-200',
        dot: 'bg-gray-400',
    },
};

export default function SeverityBadge({ severity }: { severity: string | null }) {
    const cfg =
        severityConfig[severity?.toUpperCase() ?? ''] ?? severityConfig['INFO'];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color} ${cfg.bg}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}