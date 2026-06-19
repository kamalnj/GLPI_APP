import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
                <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
            </CardContent>
        </Card>
    );
}
