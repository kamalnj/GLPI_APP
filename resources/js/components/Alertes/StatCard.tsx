export default function StatCard({
    icon,
    label,
    count,
    color
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    color: string;
}) {
    return (
        <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${color} bg-white shadow-sm`}>
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        </div>
    );
}