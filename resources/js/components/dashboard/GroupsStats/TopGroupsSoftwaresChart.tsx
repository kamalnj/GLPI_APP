import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Package } from 'lucide-react';
import { memo, useMemo } from 'react';

interface SoftwareGroupData {
  groupe: string;
  software_count: number;
  device_count: number;
  avg_software_per_device: number;
}

interface TopGroupsSoftwaresChartProps {
  data: SoftwareGroupData[];
}

// Simple blue color palette
const COLORS = [
  '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
  '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#3b9eff', '#5aabff', '#7ab8ff', '#99c5ff'
];

// Memoized tooltip
const CustomTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm">
      <p className="font-medium text-sm">{data.groupe}</p>
      <p className="text-blue-600 font-semibold">{data.software_count} logiciels</p>
      <p className="text-gray-600 text-xs mt-1">{data.device_count} appareils</p>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

export const TopGroupsSoftwaresChart = memo(({
  data,
}: TopGroupsSoftwaresChartProps) => {
  // Memoize calculations
  const { totalSoftware, totalDevices } = useMemo(() => ({
    totalSoftware: data?.reduce((sum, item) => sum + item.software_count, 0) || 0,
    totalDevices: data?.reduce((sum, item) => sum + item.device_count, 0) || 0,
  }), [data]);

  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-blue-500" />
            Top groupes avec le plus de logiciels
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
            <Package className="h-5 w-5 text-blue-500" />
            Top groupes avec le plus de logiciels
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalSoftware}</div>
            <div className="text-xs text-gray-500">{totalDevices} appareils</div>
          </div>
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
              dataKey="software_count"
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

TopGroupsSoftwaresChart.displayName = 'TopGroupsSoftwaresChart';