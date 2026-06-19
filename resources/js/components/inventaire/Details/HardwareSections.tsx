// components/inventaire/details/HardwareSections.tsx

import { InfoRow, SectionCard } from './SectionCard';

type CPU = {
    cpu_name: string | null;
    frequence: string | null;
    nbr_cores: number | null;
    nbr_threads: number | null;
};

type RAM = {
    ram_name: string | null;
    size: number | null;
    serial: string | null;
};

type OS = {
    os_name: string | null;
    os_version_name: string | null;
    os_arch_name: string | null;
    install_date: string | null;
};

const formatMemory = (mb: number) =>
    mb < 1024 ? `${mb} Mo` : `${(mb / 1024).toFixed(2)} Go`;

export function OsSection({ os }: { os: OS | null }) {
    return (
        <SectionCard title="Système d'exploitation">
            <InfoRow label="Nom" value={os?.os_name} />
            <InfoRow label="Version" value={os?.os_version_name} />
            <InfoRow label="Architecture" value={os?.os_arch_name} />
            <InfoRow label="Installation" value={os?.install_date} />
        </SectionCard>
    );
}

export function CpuSection({ cpu }: { cpu: CPU | null }) {
    return (
        <SectionCard title="Processeur (CPU)">
            <InfoRow label="Modèle" value={cpu?.cpu_name} />
            <InfoRow label="Fréquence" value={cpu?.frequence} />
            <InfoRow label="Cœurs" value={cpu?.nbr_cores?.toString()} />
            <InfoRow label="Threads" value={cpu?.nbr_threads?.toString()} />
        </SectionCard>
    );
}

export function RamSection({ ram }: { ram: RAM | null }) {
    return (
        <SectionCard title="Mémoire (RAM)">
            <InfoRow label="Modèle" value={ram?.ram_name} />
            <InfoRow
                label="Capacité"
                value={ram?.size != null ? formatMemory(ram.size) : null}
            />
            <InfoRow label="Numéro de série" value={ram?.serial} />
        </SectionCard>
    );
}
