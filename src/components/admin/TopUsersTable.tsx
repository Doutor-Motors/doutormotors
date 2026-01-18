import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Crown, Activity } from 'lucide-react';

interface TopUser {
  id: string;
  name: string;
  email: string;
  plan: 'basic' | 'pro';
  diagnosticsCount: number;
  vehiclesCount: number;
  lastActive: string;
}

interface TopUsersTableProps {
  users: TopUser[];
  isLoading?: boolean;
}

export function TopUsersTable({ users, isLoading }: TopUsersTableProps) {
  const maxDiagnostics = Math.max(...users.map(u => u.diagnosticsCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Usuários Mais Ativos
        </CardTitle>
        <CardDescription>Top 10 usuários por número de diagnósticos</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Plano</TableHead>
                  <TableHead className="text-center">Veículos</TableHead>
                  <TableHead>Diagnósticos</TableHead>
                  <TableHead className="text-right">Última Atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {index === 0 ? (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
                        {user.plan === 'pro' ? 'Pro' : 'Basic'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{user.vehiclesCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(user.diagnosticsCount / maxDiagnostics) * 100} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-medium w-8 text-right">
                          {user.diagnosticsCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(user.lastActive).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TopUsersTable;
