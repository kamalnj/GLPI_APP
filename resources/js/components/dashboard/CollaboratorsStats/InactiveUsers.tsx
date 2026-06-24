import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { AlertCircle } from 'lucide-react';

interface InactiveUser {
    user_name: string;
    last_30_active_seconds: number;
    last_30_active_time: string;
    last_30_active_days: number;
    total_machines: number;
}

interface InactiveUsersProps {
    users: InactiveUser[];
}

export function InactiveUsers({ users }: InactiveUsersProps) {
    if (users.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Utilisateurs inactifs (30 derniers jours)
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex h-48 items-center justify-center">
                    <p className="text-muted-foreground">
                        Aucun utilisateur inactif détecté
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Utilisateurs inactifs (30 derniers jours)
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>

                                <TableHead className="text-right">
                                    Temps actif
                                </TableHead>

                                <TableHead className="text-right">
                                    Jours actifs
                                </TableHead>

                                <TableHead className="text-right">
                                    Machines
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow
                                    key={user.user_name}
                                    className=" hover:bg-muted/50 text-amber-500 dark:hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        {user.user_name}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                                            {user.last_30_active_time}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right text-gray-600">
                                        {user.last_30_active_days}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="text-gray-600">
                                            {user.total_machines}
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
