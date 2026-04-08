import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from 'recharts';
import {
  Shield,
  Cpu,
  AlertTriangle,
  Activity,
  Filter,
  Calendar,
  Download,
  Sparkles,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tableau de bord', href: dashboard().url },
];

const lineData = [
  { name: 'Jan', ordinateurs: 12, vuln: 8 },
  { name: 'Fév', ordinateurs: 18, vuln: 14 },
  { name: 'Mar', ordinateurs: 22, vuln: 19 },
  { name: 'Avr', ordinateurs: 28, vuln: 24 },
  { name: 'Mai', ordinateurs: 34, vuln: 30 },
  { name: 'Jun', ordinateurs: 40, vuln: 35 },
];

const cpuData = [
  { name: 'Srv-01', cpu: 65 },
  { name: 'Srv-02', cpu: 72 },
  { name: 'Srv-03', cpu: 58 },
  { name: 'Srv-04', cpu: 81 },
];

const radarData = [
  { metric: 'Sécurité', value: 92 },
  { metric: 'Performance', value: 76 },
  { metric: 'Fiabilité', value: 88 },
  { metric: 'Scalabilité', value: 81 },
  { metric: 'Conformité', value: 69 },
];

const deviceModelDistribution = [
  { name: 'Latitude 5500', count: 24 },
  { name: 'ThinkPad E14', count: 18 },
  { name: 'HP EliteBook', count: 15 },
  { name: 'Latitude 7420', count: 12 },
  { name: 'ThinkPad X1', count: 10 },
  { name: 'Dell Inspiron', count: 8 },
  { name: 'Asus VivoBook', count: 7 },
  { name: 'HP ProBook', count: 6 },
  { name: 'Lenovo IdeaPad', count: 5 },
  { name: 'Others', count: 13 },
];

const ramDistribution = [
  { name: '8GB', devices: 18 },
  { name: '16GB', devices: 42 },
  { name: '32GB', devices: 35 },
  { name: '64GB', devices: 12 },
  { name: '128GB', devices: 5 },
];

const overviewItems = [
  {
    title: 'Ordinateurs actifs',
    value: '128',
    icon: Cpu,
    color: 'bg-sky-500',
    subtitle: 'En ligne aujourd’hui',
    progress: '88%',
  },
  {
    title: 'Vulnérabilités',
    value: '42',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    subtitle: 'À corriger',
    progress: '68%',
  },
  {
    title: 'Score sécurité',
    value: '82%',
    icon: Shield,
    color: 'bg-violet-500',
    subtitle: 'Indice global',
    progress: '82%',
  },
  {
    title: 'Charge système',
    value: '68%',
    icon: Activity,
    color: 'bg-emerald-500',
    subtitle: 'Utilisation moyenne',
    progress: '68%',
  },
];

const machines = [
  { name: 'PC-001', status: 'Actif', vuln: 2, cpu: '45%' },
  { name: 'PC-002', status: 'Critique', vuln: 8, cpu: '88%' },
  { name: 'PC-003', status: 'Stable', vuln: 1, cpu: '30%' },
];

const statusStyles: Record<string, string> = {
  Actif: 'bg-emerald-100 text-emerald-700',
  Critique: 'bg-rose-100 text-rose-700',
  Stable: 'bg-slate-100 text-slate-700',
};

export default function Dashboard() {
  const [range, setRange] = useState('Mois');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tableau de bord" />

      <div className={`flex flex-col gap-6 p-6 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Synthèse</p>
            <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord sécurité</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Visualisez l’état de vos ordinateurs, priorisez les failles critiques et suivez les performances en temps réel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['Jour', 'Semaine', 'Mois'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                  range === option
                    ? 'bg-primary text-white shadow-sm scale-105'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:scale-105'
                }`}
              >
                {option}
              </button>
            ))}
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-all duration-200 hover:border-slate-300 hover:scale-105">
              <Filter className="w-4 h-4" /> Filtres
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md">
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewItems.map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
                </div>
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${item.color} bg-opacity-10 text-current transition-transform duration-200 hover:scale-110`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                <span>{item.subtitle}</span>
                <span className="font-semibold text-slate-900">{item.progress}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: item.progress }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Évolution globale</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ordinateurs connectés et vulnérabilités signalées</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                <ArrowUpRight className="h-4 w-4" /> +22% ce mois
              </div>
            </div>
            <div className="mt-6 h-80 min-h-72">
              <ResponsiveContainer>
                <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    dataKey="ordinateurs"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    type="monotone"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Line
                    dataKey="vuln"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    type="monotone"
                    animationDuration={1500}
                    animationEasing="ease-out"
                    animationBegin={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Santé globale</h2>
                <p className="mt-1 text-sm text-muted-foreground">Indicateurs de conformité et performance</p>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">92% optimal</span>
            </div>
            <div className="mt-6 h-80 min-h-72">
              <ResponsiveContainer>
                <RadarChart data={radarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} />
                  <Radar
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Performance serveurs</h2>
                <p className="mt-1 text-sm text-muted-foreground">Utilisation CPU par groupe de serveurs</p>
              </div>
              <div className="space-x-2 text-sm text-muted-foreground">
                <span className="rounded-full bg-slate-100 px-3 py-1">Max 81%</span>
              </div>
            </div>
            <div className="mt-6 h-72 min-h-64">
              <ResponsiveContainer>
                <BarChart data={cpuData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="cpu"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Priorités</h2>
            <p className="mt-1 text-sm text-muted-foreground">Actions recommandées pour réduire le risque.</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100 hover:scale-[1.02]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Serveur PC-002 en état critique</p>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Urgent</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">8 vulnérabilités ouvertes. Prioriser cet équipement.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100 hover:scale-[1.02]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Mise à jour du noyau serveur</p>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Important</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Planifier le déploiement des correctifs dans les 48h.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Nombre de matériels</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">118</p>
            <p className="mt-2 text-xs text-muted-foreground">Ordinateurs inventoriés</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Modèle dominant</p>
            <p className="mt-3 text-xl font-bold text-slate-900">Latitude 5500</p>
            <p className="mt-2 text-xs text-muted-foreground">24 unités (20%)</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
            <p className="text-sm text-muted-foreground">RAM moyen</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">22GB</p>
            <p className="mt-2 text-xs text-muted-foreground">Par appareil</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
            <p className="text-sm text-muted-foreground">Modèles distincts</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">14</p>
            <p className="mt-2 text-xs text-muted-foreground">Variantes différentes</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Répartition des modèles (Top 10)</h2>
            <p className="mt-1 text-sm text-muted-foreground">Distribution des ordinateurs par modèle</p>
            <div className="mt-6 h-80 min-h-72">
              <ResponsiveContainer>
                <BarChart data={deviceModelDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Répartition RAM</h2>
            <p className="mt-1 text-sm text-muted-foreground">Nombre d'ordinateurs par capacité RAM</p>
            <div className="mt-6 h-80 min-h-72">
              <ResponsiveContainer>
                <BarChart data={ramDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="devices"
                    fill="#8b5cf6"
                    radius={[0, 8, 8, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Insights intelligents</h2>
              <p className="mt-1 text-sm text-slate-300">Recommandations générées automatiquement pour optimiser votre sécurité.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 hover:scale-105">
              <Sparkles className="h-4 w-4" /> Action rapide
            </span>
          </div>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-200">
            <li>⚠️ Pic de vulnérabilités détecté sur les serveurs critiques, lancer une analyse ciblée.</li>
            <li>📈 La charge CPU monte de 12% : déployer une surveillance continue.</li>
            <li>🧠 Mettre à jour les systèmes Windows et Linux dans les 24 heures.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
