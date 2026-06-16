import { Network as NetworkIcon } from 'lucide-react';
import NetworksTable from '@/components/Collabs/NetworksTable';
import EmptyState from '@/components/Collabs/EmptyState';

interface NetworksPanelProps {
    networks: any[];
    visibleNetworks: any[];
    pageSize: number;
}

export default function NetworksPanel({
    networks,
    visibleNetworks,
    pageSize,
}: NetworksPanelProps) {
    return (
        <div
            role="tabpanel"
            id="panel-networks"
            aria-labelledby="tab-networks"
        >
            {visibleNetworks.length > 0 ? (
                <>
                    <NetworksTable networks={visibleNetworks} />
                    {networks.length > pageSize && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Affichage de {pageSize} sur {networks.length} réseaux
                        </p>
                    )}
                </>
            ) : (
                <EmptyState icon={NetworkIcon} label="Aucun réseau trouvé" />
            )}
        </div>
    );
}
