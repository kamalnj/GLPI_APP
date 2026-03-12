import { JSX, useState } from "react";
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Alertes', href: '/alertes' },
];

const alerts = {
  supervision: [
    { id: 1, pc: "PC-001", type: "CPU", value: 92, level: "critical" },
    { id: 2, pc: "PC-014", type: "RAM", value: 82, level: "warning" },
    { id: 3, pc: "PC-023", type: "Disk", value: 85, level: "warning" },
  ],
  vulnerabilities: [
    { id: 4, pc: "PC-002", issue: "Windows non supporté", level: "critical" },
    { id: 5, pc: "PC-010", issue: "Patch sécurité > 30 jours", level: "warning" },
    { id: 6, pc: "PC-018", issue: "Antivirus désactivé", level: "critical" },
  ],
  software: [
    { id: 7, pc: "PC-005", name: "uTorrent", level: "critical" },
    { id: 8, pc: "PC-011", name: "TeamViewer (perso)", level: "warning" },
    { id: 9, pc: "PC-020", name: "Steam", level: "warning" },
  ],
};

const all = [...alerts.supervision, ...alerts.vulnerabilities, ...alerts.software];
const totalCritical = all.filter(a => a.level === "critical").length;
const totalWarning  = all.filter(a => a.level === "warning").length;
const totalMachines = new Set(all.map(a => a.pc)).size;

const levelConfig: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  critical: { bg: "#fff1f1", border: "#fca5a5", text: "#dc2626", label: "Critique", dot: "#ef4444" },
  warning:  { bg: "#fffbeb", border: "#fcd34d", text: "#d97706", label: "Alerte",   dot: "#f59e0b" },
};

const CpuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2M9 2v2M2 15h2M2 9h2M15 20v2M9 20v2M20 15h2M20 9h2"/>
  </svg>
);
const RamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 19v-3M10 19v-3M14 19v-3M18 19v-3M8 11V9M16 11V9"/><rect x="2" y="9" width="20" height="8" rx="2"/>
  </svg>
);
const DiskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M12 8v4M12 16h.01"/>
  </svg>
);
const CodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
  </svg>
);

const typeIcon: Record<string, JSX.Element> = {
  CPU: <CpuIcon />,
  RAM: <RamIcon />,
  Disk: <DiskIcon />,
};

function ProgressBar({ value, lvl }: { value: number; lvl: string }) {
  const color = lvl === "critical" ? "#ef4444" : "#f59e0b";
  return (
    <div style={{ width: 72, height: 5, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", flexShrink: 0 }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}

function Badge({ lvl }: { lvl: string }) {
  const c = levelConfig[lvl];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 999, padding: "3px 10px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  );
}

function KPI({ label, value, bg, color }: { label: string; value: number; bg: string; color: string }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "18px 20px", border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function AlertRow({ item }: { item: any }) {
  const isSupervision = item.type !== undefined;
  const isVuln = item.issue !== undefined;
  const icon = isSupervision ? typeIcon[item.type] : isVuln ? <ShieldIcon /> : <CodeIcon />;
  const sub  = isSupervision ? `${item.type} — ${item.value}%` : isVuln ? item.issue : item.name;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 16px", background: "#fff", borderRadius: 10,
      border: "1px solid #e2e8f0", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <span style={{ color: "#94a3b8", flexShrink: 0 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.pc}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sub}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {isSupervision && <ProgressBar value={item.value} lvl={item.level} />}
        <Badge lvl={item.level} />
      </div>
    </div>
  );
}

function Section({ title, icon, items }: { title: string; icon: JSX.Element; items: any[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none",
          borderBottom: "1px solid #f1f5f9",
          padding: "0 0 10px 0", marginBottom: 12, cursor: "pointer",
        }}
      >
        <span style={{ color: "#cbd5e1" }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", flex: 1, textAlign: "left" }}>
          {title}
        </span>
        <span style={{ fontSize: 10, color: "#cbd5e1" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.length === 0
            ? <p style={{ fontSize: 13, color: "#cbd5e1", padding: "8px 0" }}>Aucune alerte.</p>
            : items.map(item => <AlertRow key={item.id} item={item} />)
          }
        </div>
      )}
    </div>
  );
}

export default function AlertesPage() {
  const [filter, setFilter] = useState("all");
  const filterFn = (item: any) => filter === "all" || item.level === filter;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Alertes" />

      <div style={{ padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Centre d'Alertes
          </h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
            Dernière mise à jour il y a 2 minutes
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          <KPI label="Critiques"      value={totalCritical} bg="#fff1f1" color="#ef4444" />
          <KPI label="Avertissements" value={totalWarning}  bg="#fffbeb" color="#f59e0b" />
          <KPI label="Machines"       value={totalMachines} bg="#f0f9ff" color="#3b82f6" />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[
            { key: "all",      label: "Toutes" },
            { key: "critical", label: "Critiques" },
            { key: "warning",  label: "Alertes" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "5px 13px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              cursor: "pointer", border: "1px solid",
              borderColor: filter === key ? "#0f172a" : "#e2e8f0",
              background: filter === key ? "#0f172a" : "#fff",
              color: filter === key ? "#fff" : "#64748b",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Sections */}
        <Section title="Supervision Système"     icon={<CpuIcon />}    items={alerts.supervision.filter(filterFn)} />
        <Section title="Vulnérabilités OS"       icon={<ShieldIcon />} items={alerts.vulnerabilities.filter(filterFn)} />
        <Section title="Logiciels Non Autorisés" icon={<CodeIcon />}   items={alerts.software.filter(filterFn)} />

      </div>
    </AppLayout>
  );
}