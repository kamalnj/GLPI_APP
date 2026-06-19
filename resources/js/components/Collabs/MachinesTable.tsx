import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Machine {
    machine_name: string;
    total_active_seconds: number;
    total_unlocks: number;
    last_activity: string;
}

interface Props {
    machines: Machine[];
}

export default function MachinesTable({ machines }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Machines</CardTitle>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Machine</TableHead>
                            <TableHead>Unlocks</TableHead>
                            <TableHead>Last Activity</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {machines.map((machine) => (
                            <TableRow key={machine.machine_name}>
                                <TableCell>{machine.machine_name}</TableCell>

                                <TableCell>{machine.total_unlocks}</TableCell>

                                <TableCell>{machine.last_activity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
