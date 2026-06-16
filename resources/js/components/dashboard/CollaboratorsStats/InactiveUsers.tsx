import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

        <CardContent className="flex items-center justify-center h-48">
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
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>

                <TableHead className="text-right">Temps actif</TableHead>

                <TableHead className="text-right">Jours actifs</TableHead>

                <TableHead className="text-right">Machines</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_name} className="bg-red-50">
                  <TableCell className="font-medium">
                    {user.user_name}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                      {user.last_30_active_time}
                    </span>
                  </TableCell>

                  <TableCell className="text-right text-gray-600">
                    {user.last_30_active_days}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-gray-600">{user.total_machines}</span>
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
