import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  );
}
