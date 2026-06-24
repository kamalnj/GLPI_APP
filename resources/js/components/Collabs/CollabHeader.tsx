import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface CollabHeaderProps {
    userName: string;
}

export default function CollabHeader({ userName }: CollabHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {userName}
                </h1>
            </div>

            <Link
                href="/collaborateurs"
                className="inline-flex items-center gap-2 self-start rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:self-auto"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour
            </Link>
        </div>
    );
}
