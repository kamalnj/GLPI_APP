import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Computer } from '@/features/inventaire/types';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

type Props = {
    computers: Computer[];
};

function formatDate(value: string | null) {
    if (!value) return '—';
    return value.replace('T', ' ').slice(0, 16);
}

export default function InventaireTable({ computers }: Props) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">Nom</TableHead>
                        <TableHead className="w-[30%]">Contact</TableHead>
                        <TableHead className="w-[25%]">
                            Dernière MAJ de l'inventaire
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {computers.map((computer) => (
                        <TableRow
                            key={computer.id}
                            className="transition hover:bg-muted/50"
                        >
                            <TableCell className="font-medium">
                                {computer.name ?? '—'}
                            </TableCell>

                            <TableCell>{computer.contact ?? '—'}</TableCell>

                            <TableCell>
                                {formatDate(computer.last_inventory_update)}
                            </TableCell>

                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/inventaire/${computer.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Détails
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
