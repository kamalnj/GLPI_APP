import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Unlock } from 'lucide-react';

interface TopUnlocksUser {
    user_name: string;
    total_unlocks: number;
    active_days: number;
    avg_unlocks_per_day: number;
}

interface TopUnlocksUsersProps {
    users: TopUnlocksUser[];
}

export function TopUnlocksUsers({ users }: TopUnlocksUsersProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5" />
                    Utilisateurs avec le plus de déverrouillages (30j)
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">#</TableHead>

                                <TableHead>Utilisateur</TableHead>

                                <TableHead className="text-right">
                                    Déverrouillages
                                </TableHead>

                                <TableHead className="text-right">
                                    Jours actifs
                                </TableHead>

                                <TableHead className="text-right">
                                    Moyenne/jour
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {users.map((user, index) => (
                                <TableRow key={user.user_name}>
                                    <TableCell className="font-medium text-gray-500">
                                        {index + 1}
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {user.user_name}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                                            {user.total_unlocks}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right text-gray-600">
                                        {user.active_days}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="text-gray-600">
                                            {user.avg_unlocks_per_day}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
