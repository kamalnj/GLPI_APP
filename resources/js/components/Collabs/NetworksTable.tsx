import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Network {
    ssid: string;
    occurrences: number;
}

interface Props {
    networks: Network[];
}

export default function NetworksTable({ networks }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Réseaux utilisés</CardTitle>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SSID</TableHead>
                            <TableHead>Occurrences</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {networks.map((network) => (
                            <TableRow key={network.ssid}>
                                <TableCell>
                                    {network.ssid}
                                </TableCell>

                                <TableCell>
                                    {network.occurrences}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}