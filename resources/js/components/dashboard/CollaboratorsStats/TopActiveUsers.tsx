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

import { Activity } from 'lucide-react';

interface TopActiveUser {
  user_name: string;
  active_seconds: number;
  active_time: string;
  machines_count: number;
}

interface TopActiveUsersProps {
  users: TopActiveUser[];
}

export function TopActiveUsers({ users }: TopActiveUsersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Top 10 utilisateurs les plus actifs
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>

                <TableHead>Utilisateur</TableHead>

                <TableHead className="text-right">Temps actif</TableHead>

                <TableHead className="text-right">Machines</TableHead>
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
                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                      {user.active_time}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-gray-600">{user.machines_count}</span>
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
