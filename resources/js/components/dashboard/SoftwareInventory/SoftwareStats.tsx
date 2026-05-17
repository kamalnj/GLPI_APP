import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp } from 'lucide-react';

interface SoftwareStatsProps {
  average_softwares_per_device: number;
  devices_above_average: number;
  top_installed_softwares: Array<{
    name: string;
    count: number;
  }>;
  top_device_by_software_count: {
    id: number;
    name: string;
    computer_model: string;
    software_count: number;
  } | null;
}

export function SoftwareStats({
  average_softwares_per_device,
  devices_above_average,
  top_installed_softwares,
  top_device_by_software_count,
}: SoftwareStatsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne logiciels/appareil
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {average_softwares_per_device.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              applications par appareil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Au-dessus de la moyenne
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices_above_average}</div>
            <p className="text-xs text-muted-foreground">
              appareils avec surcharge logicielle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Installed Softwares */}
      <Card>
        <CardHeader>
          <CardTitle>Top 15 des logiciels les plus installés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top_installed_softwares.slice(0, 10).map((software, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{software.name}</p>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (software.count /
                            Math.max(
                              ...top_installed_softwares.map((s) => s.count)
                            )) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {software.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Device by Software Count */}
      {top_device_by_software_count && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">
              Appareil avec le plus de logiciels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{top_device_by_software_count.name}</p>
              <p className="text-sm text-orange-800">
                Modèle: {top_device_by_software_count.computer_model}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {top_device_by_software_count.software_count} logiciels
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
