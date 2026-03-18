
export default function ScoreBar({ score }: { score: number | null }) {
    if (score === null) return <span className="text-xs text-gray-400">—</span>;
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    const pct = Math.min((numScore / 10) * 100, 100);
    const color =
        numScore >= 9
            ? 'bg-red-500'
            : numScore >= 7
              ? 'bg-orange-400'
              : numScore >= 4
                ? 'bg-yellow-400'
                : 'bg-blue-400';
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="font-mono text-xs font-semibold text-gray-700">
                {numScore.toFixed(1)}
            </span>
        </div>
    );
}