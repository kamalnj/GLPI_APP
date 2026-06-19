import { Progress } from '@/components/ui/progress';
type Volume = {
    id: number;
    name: string | null;
    mountpoint: string | null;
    total_size: number | null;
    free_size: number | null;
    free_percent: number | null;
    encryption_tool: string | null;
    date_mod: string | null;
};

function num(v: number | null) {
    return v === null || Number.isNaN(v) ? '—' : v;
}

export default function VolumesTable({ volumes }: { volumes: Volume[] }) {
    function formatMemory(mb: number): string {
        if (mb < 1024) {
            return `${mb} Mo`;
        }
        return `${(mb / 1024).toFixed(2)} Go`;
    }
    return (
        <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                    <tr>
                        <th className="px-3 py-2 text-left">Mount</th>
                        <th className="px-3 py-2 text-left">Nom</th>
                        <th className="px-3 py-2 text-left">Libre %</th>
                        <th className="px-3 py-2 text-left">Libre</th>
                        <th className="px-3 py-2 text-left">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {volumes.map((v) => (
                        <tr key={v.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{v.mountpoint ?? '—'}</td>
                            <td className="px-3 py-2">{v.name ?? '—'}</td>
                            <td className="px-3 py-2">
                                <Progress
                                    value={v.free_percent ?? 0}
                                    className="w-full"
                                />
                                {v.free_percent !== null
                                    ? `${v.free_percent} %`
                                    : '—'}
                            </td>
                            <td className="px-3 py-2">
                                {v.free_size !== null
                                    ? formatMemory(v.free_size)
                                    : '—'}
                            </td>
                            <td className="px-3 py-2">
                                {v.total_size !== null
                                    ? formatMemory(v.total_size)
                                    : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
