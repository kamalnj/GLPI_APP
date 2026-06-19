import { AlertLevel } from '@/types/types';
import { AlertTriangle, XCircle } from 'lucide-react';

export default function LevelBadge({ level }: { level: AlertLevel }) {
    if (level === 'critical') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                <XCircle size={11} /> Critique
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            <AlertTriangle size={11} /> Alerte
        </span>
    );
}
