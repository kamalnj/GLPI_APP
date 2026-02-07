import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AntivirusTable from '@/components/inventaire/AntivirusTable';
import VolumesTable from '@/components/inventaire/VolumesTable';
import InfoCard from '@/components/inventaire/InfoCard';

type Antivirus = {
    id: number;
    name: string | null;
    antivirus_version: string | null;
    date_mod: string | null;
};

type Volume = {
    id: number;
    name: string | null;
    mountpoint: string | null;
    total_size: number | null;
    free_size: number | null;
    free_percent: number | null;
    encryption_tool: string | null;
    date_mod: string | null;
};
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

type Computer = {
    id: number;
    name: string | null;
    contact: string | null;
    last_inventory_update: string | null;
    cpu?: CPU[] | null;
    ram?: RAM[] | null;
    os?: OS[] | null;
    antiviruses: Antivirus[];
    volumes: Volume[];
};

type PageProps = {
    computer: Computer;
};

export default function Details({ computer }: PageProps) {
    const cpu0 = computer.cpu?.[0] ?? null;
    const os0 = computer.os?.[0] ?? null;
    const ram0 = computer.ram?.[0] ?? null;
function formatMemory(mb: number): string {
    if (mb < 1024) {
        return `${mb} Mo`;
    }
    return `${(mb / 1024).toFixed(2)} Go`;
}


    return (
        <AppLayout>
            <Head title={`Details - ${computer.name ?? 'Computer'}`} />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">
                            {computer.name ?? '—'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Dernière date MAJ inventaire :{' '}
                            {computer.last_inventory_update ?? '—'}
                        </div>
                    </div>

                    <Link
                        href="/inventaire"
                        className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium"
                    >
                        Retour
                    </Link>
                </div>
                {/* 3 Cartes */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* OS */}
                    <InfoCard
                        title="Système d’exploitation"
                        lines={[
                            os0?.os_name,
                            os0?.os_version_name
                                ? `Version : ${os0.os_version_name}`
                                : null,
                            os0?.os_arch_name
                                ? `Architecture : ${os0.os_arch_name}`
                                : null,
                        ]}
                    />

                    {/* CPU */}
                    <InfoCard
                        title="Processeur (CPU)"
                        lines={[
                            cpu0?.cpu_name,
                            cpu0?.frequence
                                ? `Fréquence : ${cpu0.frequence}`
                                : null,
                            cpu0?.nbr_cores != null
                                ? `Cœurs : ${cpu0.nbr_cores}`
                                : null,
                            cpu0?.nbr_threads != null
                                ? `Threads : ${cpu0.nbr_threads}`
                                : null,
                        ]}
                    />

                    {/* RAM  */}
                    <InfoCard
                        title="Mémoire (RAM)"
                        lines={[
                            ram0?.ram_name,
                           ram0?.size != null
    ? `Taille : ${formatMemory(ram0.size)}`
    : null,


                       ] }
                    />
                </div>

                {/* Volumes */}
                <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="font-medium">Volumes</div>
                        <div className="text-sm text-muted-foreground">
                            {computer.volumes.length}
                        </div>
                    </div>

                    {computer.volumes.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No volume data.
                        </div>
                    ) : (
                        <VolumesTable volumes={computer.volumes} />
                    )}
                </div>

                {/* Antivirus */}
                <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="font-medium">Antiviruses</div>
                        <div className="text-sm text-muted-foreground">
                            {computer.antiviruses.length}
                        </div>
                    </div>

                    {computer.antiviruses.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No antivirus data.
                        </div>
                    ) : (
                        <AntivirusTable antiviruses={computer.antiviruses} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
