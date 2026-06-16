import { Cpu } from 'lucide-react';
import MachinesTable from '@/components/Collabs/MachinesTable';
import EmptyState from '@/components/Collabs/EmptyState';

interface MachinesPanelProps {
    machines: any[];
    visibleMachines: any[];
    pageSize: number;
}

export default function MachinesPanel({
    machines,
    visibleMachines,
    pageSize,
}: MachinesPanelProps) {
    return (
        <div
            role="tabpanel"
            id="panel-machines"
            aria-labelledby="tab-machines"
        >
            {visibleMachines.length > 0 ? (
                <>
                    <MachinesTable machines={visibleMachines} />
                    {machines.length > pageSize && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Affichage de {pageSize} sur {machines.length} machines
                        </p>
                    )}
                </>
            ) : (
                <EmptyState icon={Cpu} label="Aucune machine trouvée" />
            )}
        </div>
    );
}
