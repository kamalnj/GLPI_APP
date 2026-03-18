import { AlertLevel } from '@/types/types';
import { AlertTriangle, XCircle } from 'lucide-react';


export default function LevelBadge({ level }: { level: AlertLevel }) {
    if (level === 'critical') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <XCircle size={11} /> Critique
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <AlertTriangle size={11} /> Alerte
        </span>
    );
}