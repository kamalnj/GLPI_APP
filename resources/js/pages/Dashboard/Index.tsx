import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Activity } from 'lucide-react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModelStatsCard } from '@/components/dashboard/MaterialInventory/ModelStatsCard';
import { ModelDistributionChart } from '@/components/dashboard/MaterialInventory/ModelDistributionChart';
import { RamDistributionChart } from '@/components/dashboard/MaterialInventory/RamDistributionChart';
import { ChartSkeleton } from '@/components/dashboard/ChartSkeleton';
import { DevicesWithLowDisk, SoftwareStats } from '@/components/dashboard/SoftwareInventory';
import {
  LowDiskDevicesByGroupeChart,
  TopGroupsVulnerabilitiesChart,
  TopGroupsSoftwaresChart,
} from '@/components/dashboard/GroupsStats';

interface DashboardPageProps {
  total_machines: number;
  different_models_count: number;
  top_model: {
    computer_model: string;
    count: number;
  } | null;
  models_distribution: Array<{
    name: string;
    value: number;
  }> | null;
  ram_distribution: Array<{
    ram_gb: number;
    device_count: number;
  }> | null;
  software_stats: {
    average_softwares_per_device: number;
    devices_above_average: number;
    top_installed_softwares: Array<{
      name: string;
      count: number;
    }>;
    devices_above_average_with_low_disk: Array<{
      id: number;
      name: string;
      model: string;
      software_count: number;
      avg_free_percent: number;
    }>;
    top_device_by_software_count: {
      id: number;
      name: string;
      computer_model: string;
      software_count: number;
    } | null;
  } | null;
  groups_stats: {
    low_disk_by_groupe: Array<{
      groupe: string;
      low_disk_devices: number;
    }>;
    top_groups_vulnerabilities: Array<{
      groupe: string;
      vulnerability_count: number;
    }>;
    top_groups_softwares: Array<{
      groupe: string;
      software_count: number;
      device_count: number;
      avg_software_per_device: number;
    }>;
  } | null;
  last_updated?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tableau de bord', href: dashboard().url },
];


export default function Index({
  total_machines,
  different_models_count,
  top_model,
  models_distribution,
  ram_distribution,
  software_stats,
  groups_stats,
}: DashboardPageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tableau de bord" />
      <h1 className="text-2xl font-bold tracking-tight ml-7 mt-3">Inventaire des matières</h1>
      <div className="space-y-8 p-6">
        {/* Stats Cards - Load immediately */}
        <section className="mb-8">
          <ModelStatsCard
            differentModelsCount={different_models_count}
            topModel={top_model}
            totalMachines={total_machines}
          />
        </section>

        {/* Charts Section - With loading state */}
        <section className="mt-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="transition-all duration-300 hover:scale-[1.02]">
              {models_distribution ? (
                <ModelDistributionChart data={models_distribution} />
              ) : (
                <ChartSkeleton />
              )}
            </div>
            <div className="transition-all duration-300 hover:scale-[1.02]">
              {ram_distribution ? (
                <RamDistributionChart data={ram_distribution} />
              ) : (
                <ChartSkeleton />
              )}
            </div>
          </div>
        </section>

        <h1 className="text-2xl font-bold tracking-tight ml-7 mt-3">Inventaire des logiciels</h1>
        <section className="mt-8">
          {software_stats ? (
            <SoftwareStats
              average_softwares_per_device={software_stats.average_softwares_per_device}
              devices_above_average={software_stats.devices_above_average}
              top_installed_softwares={software_stats.top_installed_softwares}
              top_device_by_software_count={software_stats.top_device_by_software_count}
            />
          ) : (
            <ChartSkeleton />
          )}
        </section>
        <section className="mt-8">
          {software_stats && software_stats.devices_above_average_with_low_disk.length > 0 ? (
            <DevicesWithLowDisk devices={software_stats.devices_above_average_with_low_disk} />
          ) : (
            <ChartSkeleton />
          )}
        </section>

        {/* Groups Stats Section */}
        <h1 className="text-2xl font-bold tracking-tight ml-7 mt-8">Statistiques par groupe</h1>
        <section className="mt-8">
          <div className="grid grid-cols-2 xl:grid-cols-2 gap-8">
            <div className="transition-all duration-300 hover:scale-[1.02]">
              {groups_stats?.low_disk_by_groupe && groups_stats.low_disk_by_groupe.length > 0 ? (
                <LowDiskDevicesByGroupeChart data={groups_stats.low_disk_by_groupe} />
              ) : groups_stats !== null ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Appareils avec faible espace disque par groupe</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-80">
                    <p className="text-muted-foreground">Aucun appareil avec faible espace disque détecté</p>
                  </CardContent>
                </Card>
              ) : (
                <ChartSkeleton />
              )}
          
            </div>
                      <div className="transition-all duration-300 hover:scale-[1.02]">
              {groups_stats?.top_groups_vulnerabilities && groups_stats.top_groups_vulnerabilities.length > 0 ? (
                <TopGroupsVulnerabilitiesChart data={groups_stats.top_groups_vulnerabilities} />
              ) : (
                <ChartSkeleton />
              )}
            </div>
      
            <div className="transition-all duration-300 hover:scale-[1.02]">
              {groups_stats?.top_groups_softwares && groups_stats.top_groups_softwares.length > 0 ? (
                <TopGroupsSoftwaresChart data={groups_stats.top_groups_softwares} />
              ) : (
                <ChartSkeleton />
              )}
            </div>
          </div>
        </section>

        {/* Empty State */}
        {total_machines === 0 && (
          <section className="flex flex-col items-center justify-center py-20 px-6 mt-12">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <Activity className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Aucune machine détectée
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Commencez par ajouter des machines pour visualiser vos statistiques et analyses.
            </p>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
           

  