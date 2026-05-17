import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { memo, useMemo } from 'react';

interface VulnerabilityData {
  groupe: string;
  vulnerability_count: number;
}

interface TopGroupsVulnerabilitiesChartProps {
  data: VulnerabilityData[];
}

// Simple red color palette
const COLORS = [
  '#ef4444', '#f87171', '#fca5a5', '#fecaca',
  '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#ff6b6b', '#ff8787', '#ffa8a8', '#ffc9c9'
];

// Memoized tooltip
const CustomTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm">
      <p className="font-medium text-sm">{payload[0].name}</p>
      <p className="text-red-600 font-semibold">{payload[0].value} vulnérabilités</p>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

export const TopGroupsVulnerabilitiesChart = memo(({
  data,
}: TopGroupsVulnerabilitiesChartProps) => {
  // Memoize calculations
  const totalVulnerabilities = useMemo(() => 
    data?.reduce((sum, item) => sum + item.vulnerability_count, 0) || 0,
    [data]
  );

  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Top groupes avec vulnérabilités
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Top groupes avec vulnérabilités
          </CardTitle>
          <span className="text-2xl font-bold text-red-600">{totalVulnerabilities}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="vulnerability_count"
              nameKey="groupe"
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

TopGroupsVulnerabilitiesChart.displayName = 'TopGroupsVulnerabilitiesChart';