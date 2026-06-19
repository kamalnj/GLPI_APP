import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Device {
    id: number;
    name: string;
    model: string;
    software_count: number;
    avg_free_percent: number;
}

interface DevicesWithLowDiskProps {
    devices: Device[];
}

export function DevicesWithLowDisk({ devices }: DevicesWithLowDiskProps) {
    if (!devices || devices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Appareils en alerte (Au-dessus moyenne + disque faible)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Aucun appareil ne correspond aux critères d'alerte
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Appareils en alerte (Au-dessus moyenne + disque faible)
                </CardTitle>
                <span className="text-2xl font-bold text-red-600">
                    {devices.length}
                </span>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Modèle</TableHead>
                                <TableHead className="text-right">
                                    Logiciels
                                </TableHead>
                                <TableHead className="text-right">
                                    Espace libre
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.slice(0, 20).map((device) => (
                                <TableRow
                                    key={device.id}
                                    className={
                                        device.avg_free_percent < 10
                                            ? 'bg-red-50'
                                            : device.avg_free_percent < 20
                                              ? 'bg-orange-50'
                                              : ''
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {device.name}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {device.model}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                            {device.software_count}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                device.avg_free_percent < 10
                                                    ? 'bg-red-100 text-red-800'
                                                    : device.avg_free_percent <
                                                        20
                                                      ? 'bg-orange-100 text-orange-800'
                                                      : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {device.avg_free_percent.toFixed(1)}
                                            %
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {devices.length > 20 && (
                    <p className="mt-4 text-xs text-muted-foreground">
                        Affichage des 20 premiers appareils sur {devices.length}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
