import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format, differenceInDays, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Crown,
  Users,
  CreditCard,
  TrendingUp,
  Edit,
  XCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

interface SubscriptionWithProfile {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    name: string;
    email: string;
    phone?: string | null;
  };
  isVirtual?: boolean;
}

type FilterType = 'all' | 'pro' | 'basic' | 'active' | 'cancelled' | 'expired' | 'expiring_soon';

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useAdminNotifications();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithProfile | null>(null);
  const [newPlanType, setNewPlanType] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [newExpiresAt, setNewExpiresAt] = useState<string>('');
  const [cancelingSubscription, setCancelingSubscription] = useState<SubscriptionWithProfile | null>(null);
  const [grantProUser, setGrantProUser] = useState<SubscriptionWithProfile | null>(null);
  const [proDuration, setProDuration] = useState<'1month' | '3months' | '6months' | '1year' | 'lifetime'>('1month');
  const [revokeProUser, setRevokeProUser] = useState<SubscriptionWithProfile | null>(null);

  // Fetch all subscriptions with profiles - include users without subscriptions (Basic)
  const { data: subscriptions, isLoading, refetch } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      // Fetch all profiles first (all users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email, phone')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get all subscriptions
      const { data: subs, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Create subscription map
      const subMap = new Map(subs.map(s => [s.user_id, s]));

      // Merge: show all users, with their subscription or default Basic
      const result: SubscriptionWithProfile[] = (profiles || []).map(profile => {
        const existingSub = subMap.get(profile.user_id);
        if (existingSub) {
          return {
            ...existingSub,
            profile: { name: profile.name, email: profile.email, phone: profile.phone },
            isVirtual: false,
          };
        }
        // User without subscription = Basic (virtual)
        return {
          id: `virtual-${profile.user_id}`,
          user_id: profile.user_id,
          plan_type: 'basic',
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: { name: profile.name, email: profile.email, phone: profile.phone },
          isVirtual: true,
        };
      });

      return result;
    },
  });

  // Realtime subscription for profiles and user_subscriptions
  useEffect(() => {
    const profilesChannel = supabase
      .channel("admin-subs-profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        refetch();
      })
      .subscribe();

    const subsChannel = supabase
      .channel("admin-subs-subscriptions")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_subscriptions" }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subsChannel);
    };
  }, [refetch]);

  // Grant Pro mutation
  const grantProMutation = useMutation({
    mutationFn: async ({ userId, expiresAt }: { userId: string; expiresAt: string | null }) => {
      // Check if user already has a subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: 'pro',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan_type: 'pro',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Plano Pro concedido com sucesso!');
      notifySuccess('Plano Pro Concedido', `${grantProUser?.profile?.name} agora é Pro!`);
      setGrantProUser(null);
    },
    onError: (error) => {
      toast.error('Erro ao conceder Pro: ' + error.message);
      notifyError('Erro', 'Não foi possível conceder o plano Pro');
    },
  });

  // Revoke Pro mutation
  const revokeProMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_type: 'basic',
          status: 'active',
          expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Plano Pro removido');
      notifySuccess('Plano Alterado', `${revokeProUser?.profile?.name} voltou para Basic`);
      setRevokeProUser(null);
    },
    onError: (error) => {
      toast.error('Erro ao remover Pro: ' + error.message);
      notifyError('Erro', 'Não foi possível remover o plano Pro');
    },
  });

  // Update subscription mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, userId, updates, isVirtual }: { 
      id: string; 
      userId: string;
      updates: Partial<SubscriptionWithProfile>; 
      isVirtual: boolean;
    }) => {
      if (isVirtual) {
        // Create new subscription for virtual user
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan_type: updates.plan_type || 'basic',
            status: updates.status || 'active',
            started_at: new Date().toISOString(),
            expires_at: updates.expires_at || null,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Assinatura atualizada com sucesso');
      notifySuccess('Assinatura Atualizada', `Alterações salvas para ${editingSubscription?.profile?.name}`);
      setEditingSubscription(null);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar assinatura: ' + error.message);
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          expires_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Assinatura cancelada');
      notifySuccess('Assinatura Cancelada', `${cancelingSubscription?.profile?.name} teve a assinatura cancelada`);
      setCancelingSubscription(null);
    },
    onError: (error) => {
      toast.error('Erro ao cancelar assinatura: ' + error.message);
    },
  });

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions) return [];

    let filtered = subscriptions;

    // Apply filter type
    switch (filterType) {
      case 'pro':
        filtered = filtered.filter(s => s.plan_type === 'pro');
        break;
      case 'basic':
        filtered = filtered.filter(s => s.plan_type === 'basic');
        break;
      case 'active':
        filtered = filtered.filter(s => s.status === 'active');
        break;
      case 'cancelled':
        filtered = filtered.filter(s => s.status === 'cancelled');
        break;
      case 'expired':
        filtered = filtered.filter(s => s.status === 'expired');
        break;
      case 'expiring_soon':
        filtered = filtered.filter(s => {
          if (!s.expires_at) return false;
          const daysUntilExpiry = differenceInDays(new Date(s.expires_at), new Date());
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
        });
        break;
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.profile?.name?.toLowerCase().includes(searchLower) ||
        sub.profile?.email?.toLowerCase().includes(searchLower) ||
        sub.profile?.phone?.toLowerCase().includes(searchLower) ||
        sub.plan_type.toLowerCase().includes(searchLower) ||
        sub.status.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [subscriptions, filterType, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    if (!subscriptions) return { total: 0, active: 0, pro: 0, basic: 0, expiringSoon: 0 };

    const expiringSoon = subscriptions.filter(s => {
      if (!s.expires_at || s.status !== 'active') return false;
      const daysUntilExpiry = differenceInDays(new Date(s.expires_at), new Date());
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }).length;

    return {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      pro: subscriptions.filter(s => s.plan_type === 'pro' && s.status === 'active').length,
      basic: subscriptions.filter(s => s.plan_type === 'basic' && s.status === 'active').length,
      expiringSoon,
    };
  }, [subscriptions]);

  const handleEdit = (subscription: SubscriptionWithProfile) => {
    setEditingSubscription(subscription);
    setNewPlanType(subscription.plan_type);
    setNewStatus(subscription.status);
    setNewExpiresAt(subscription.expires_at ? format(new Date(subscription.expires_at), 'yyyy-MM-dd') : '');
  };

  const handleSaveEdit = () => {
    if (!editingSubscription) return;

    updateMutation.mutate({
      id: editingSubscription.id,
      userId: editingSubscription.user_id,
      updates: {
        plan_type: newPlanType,
        status: newStatus,
        expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
      },
      isVirtual: editingSubscription.isVirtual || false,
    });
  };

  const handleGrantPro = () => {
    if (!grantProUser) return;

    let expiresAt: string | null = null;
    const now = new Date();

    switch (proDuration) {
      case '1month':
        expiresAt = addMonths(now, 1).toISOString();
        break;
      case '3months':
        expiresAt = addMonths(now, 3).toISOString();
        break;
      case '6months':
        expiresAt = addMonths(now, 6).toISOString();
        break;
      case '1year':
        expiresAt = addYears(now, 1).toISOString();
        break;
      case 'lifetime':
        expiresAt = null;
        break;
    }

    grantProMutation.mutate({ userId: grantProUser.user_id, expiresAt });
  };

  const handleRevokePro = () => {
    if (!revokeProUser) return;
    revokeProMutation.mutate(revokeProUser.user_id);
  };

  const getPlanBadge = (plan: string) => {
    if (plan === 'pro') {
      return (
        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
          <Crown className="h-3 w-3 mr-1" />
          Pro
        </Badge>
      );
    }
    return <Badge variant="secondary">Basic</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Ativo</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExpiryBadge = (expiresAt: string | null, status: string) => {
    if (!expiresAt || status !== 'active') return null;
    
    const daysUntilExpiry = differenceInDays(new Date(expiresAt), new Date());
    
    if (daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expirado
        </Badge>
      );
    }
    
    if (daysUntilExpiry <= 3) {
      return (
        <Badge className="bg-red-500/20 text-red-500 border-red-500/30 ml-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {daysUntilExpiry} dias
        </Badge>
      );
    }
    
    if (daysUntilExpiry <= 7) {
      return (
        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 ml-2">
          <Clock className="h-3 w-3 mr-1" />
          {daysUntilExpiry} dias
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Gerenciar Assinaturas
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as assinaturas dos usuários em tempo real
          </p>
        </div>

        {/* Alerts for expiring subscriptions */}
        {stats.expiringSoon > 0 && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Atenção</AlertTitle>
            <AlertDescription>
              {stats.expiringSoon} assinatura(s) Pro expirando nos próximos 7 dias.{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-amber-500"
                onClick={() => setFilterType('expiring_soon')}
              >
                Ver assinaturas
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${filterType === 'all' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterType === 'active' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterType('active')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterType === 'pro' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterType('pro')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plano Pro</p>
                  <p className="text-2xl font-bold text-amber-500">{stats.pro}</p>
                </div>
                <Crown className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterType === 'basic' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterType('basic')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plano Basic</p>
                  <p className="text-2xl font-bold">{stats.basic}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterType === 'expiring_soon' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterType('expiring_soon')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expirando</p>
                  <p className="text-2xl font-bold text-amber-500">{stats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assinaturas</CardTitle>
                <CardDescription>
                  {filteredSubscriptions.length} de {stats.total} assinaturas
                  {filterType !== 'all' && (
                    <Button
                      variant="link"
                      className="p-0 h-auto ml-2 text-xs"
                      onClick={() => setFilterType('all')}
                    >
                      Limpar filtro
                    </Button>
                  )}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email, telefone ou plano..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filterType === 'pro' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('pro')}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Button>
                  <Button
                    variant={filterType === 'basic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('basic')}
                  >
                    Basic
                  </Button>
                  <Button
                    variant={filterType === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('active')}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativos
                  </Button>
                  <Button
                    variant={filterType === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('cancelled')}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelados
                  </Button>
                  <Button
                    variant={filterType === 'expiring_soon' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('expiring_soon')}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Expirando
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Expira</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhuma assinatura encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.profile?.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {sub.profile?.email || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {sub.profile?.phone ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {sub.profile.phone}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getPlanBadge(sub.plan_type)}</TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(sub.started_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {sub.expires_at ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(sub.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  {sub.plan_type === 'pro' ? 'Vitalício' : '-'}
                                </span>
                              )}
                              {getExpiryBadge(sub.expires_at, sub.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Grant Pro button - only for Basic users */}
                              {sub.plan_type === 'basic' && sub.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setGrantProUser(sub)}
                                  title="Dar Pro"
                                  className="text-amber-500 hover:text-amber-600"
                                >
                                  <ArrowUpCircle className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Revoke Pro button - only for Pro users */}
                              {sub.plan_type === 'pro' && sub.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setRevokeProUser(sub)}
                                  title="Remover Pro"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ArrowDownCircle className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(sub)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {sub.status === 'active' && !sub.isVirtual && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setCancelingSubscription(sub)}
                                  title="Cancelar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grant Pro Dialog */}
        <Dialog open={!!grantProUser} onOpenChange={(open) => !open && setGrantProUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Conceder Plano Pro
              </DialogTitle>
              <DialogDescription>
                Conceder acesso Pro para <strong>{grantProUser?.profile?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Duração do Plano</Label>
                <Select value={proDuration} onValueChange={(v: any) => setProDuration(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Mês</SelectItem>
                    <SelectItem value="3months">3 Meses</SelectItem>
                    <SelectItem value="6months">6 Meses</SelectItem>
                    <SelectItem value="1year">1 Ano</SelectItem>
                    <SelectItem value="lifetime">Vitalício</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-sm text-amber-500">
                  <strong>Atenção:</strong> O usuário terá acesso imediato a todos os recursos Pro.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantProUser(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGrantPro} 
                disabled={grantProMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {grantProMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Crown className="h-4 w-4 mr-2" />
                Conceder Pro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Pro Dialog */}
        <AlertDialog open={!!revokeProUser} onOpenChange={(open) => !open && setRevokeProUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Plano Pro</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o plano Pro de <strong>{revokeProUser?.profile?.name}</strong>?
                O usuário será rebaixado para o plano Basic e perderá acesso aos recursos exclusivos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevokePro}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {revokeProMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Remover Pro
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Assinatura</DialogTitle>
              <DialogDescription>
                Alterar assinatura de <strong>{editingSubscription?.profile?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={newPlanType} onValueChange={setNewPlanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <Input
                  type="date"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para vitalício (sem expiração)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSubscription(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation */}
        <AlertDialog open={!!cancelingSubscription} onOpenChange={(open) => !open && setCancelingSubscription(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar a assinatura de <strong>{cancelingSubscription?.profile?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Não, manter</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelingSubscription && cancelMutation.mutate(cancelingSubscription.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sim, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
