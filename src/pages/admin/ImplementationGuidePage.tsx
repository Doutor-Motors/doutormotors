import { useState, useMemo } from "react";
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target, 
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Zap,
  Database,
  CreditCard,
  Smartphone,
  Shield,
  Bell,
  BarChart3,
  Users,
  Wrench,
  Globe,
  Layers,
  GitBranch,
  FileText,
  Download,
  RefreshCw,
  Wifi,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GapItem {
  id: string;
  module: string;
  title: string;
  description: string;
  impact: string;
  risk: "critical" | "high" | "medium" | "low";
  affectedFeature: string;
  userImpact: string;
  technicalRisk: string;
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: "technical" | "functional" | "strategic";
  timeframe: "short" | "medium" | "long";
  priority: number;
  dependencies?: string[];
}

const ImplementationGuidePage = () => {
  const [openGaps, setOpenGaps] = useState<string[]>([]);
  const { features, isLoading, lastUpdated, refetch, categories, overallProgress: systemProgress } = useSystemStatus();

  const toggleGap = (id: string) => {
    setOpenGaps(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  // Função para verificar status de uma feature
  const isFeatureComplete = (featureId: string): boolean => {
    const feature = features.find((f) => f.id === featureId);
    return feature?.status === "complete";
  };

  // System completion metrics - AGORA EM TEMPO REAL
  const systemMetrics = useMemo(() => ({
    frontend: categories.frontend.percentage,
    backend: categories.edge_functions.percentage,
    database: categories.database.percentage,
    integrations: categories.integrations.percentage,
    security: categories.security.percentage,
    testing: 30, // Testes ainda são manuais
  }), [categories]);

  const overallProgress = systemProgress;

  // Gap Analysis Data - AGORA DINÂMICO baseado no estado real
  const gaps: GapItem[] = useMemo(() => {
    const dynamicGaps: GapItem[] = [];
    
    // Verificar Stripe/AbacatePay
    if (!isFeatureComplete("abacatepay-integration")) {
      dynamicGaps.push({
        id: "pix-payments",
        module: "Pagamentos",
        title: "Nenhum pagamento PIX confirmado ainda",
        description: "A integração AbacatePay está configurada mas ainda não houve pagamentos confirmados.",
        impact: "Monetização não está gerando receita real ainda.",
        risk: "high",
        affectedFeature: "Upgrade de plano, pagamentos recorrentes",
        userImpact: "Sistema funcionando em modo demonstração/teste",
        technicalRisk: "Baixo - Integração já existe, falta tráfego real",
      });
    }
    
    // OBD Real
    dynamicGaps.push({
      id: "obd-real",
      module: "Diagnóstico OBD",
      title: "Conexão OBD não testada com hardware real",
      description: "O protocolo ELM327 está implementado mas não foi validado com adaptadores físicos reais.",
      impact: "Diagnósticos podem falhar com dispositivos OBD-II reais.",
      risk: "critical",
      affectedFeature: "Central de Diagnóstico, Leitura de DTCs",
      userImpact: "Funcionalidade principal pode não funcionar em ambiente real",
      technicalRisk: "Alto - Core feature do sistema",
    });
    
    // App Nativo
    if (!isFeatureComplete("capacitor-setup")) {
      dynamicGaps.push({
        id: "native-app",
        module: "App Mobile",
        title: "PWA atual tem limitações de conectividade",
        description: "Sistema está como PWA. Web Bluetooth funciona apenas no Chrome Android e Desktop. WiFi OBD não funciona em navegadores. Safari/iOS não suporta Web Bluetooth.",
        impact: "Usuários iPhone não podem usar Bluetooth. Nenhum usuário pode usar adaptadores WiFi pelo navegador.",
        risk: "high",
        affectedFeature: "Conexão OBD via Bluetooth em iOS, Conexão WiFi em todos dispositivos",
        userImpact: "Usuários iOS ficam limitados ao modo demonstração. Usuários com adaptador WiFi não conseguem conectar.",
        technicalRisk: "Médio - Solução é criar app nativo com Capacitor (já configurado no projeto)",
      });
    }
    
    // Push Notifications
    dynamicGaps.push({
      id: "push-native",
      module: "Notificações",
      title: "Push Notifications nativas não implementadas",
      description: "FCM (Firebase Cloud Messaging) não está integrado ao app Capacitor.",
      impact: "Notificações não funcionam quando app está fechado.",
      risk: "medium",
      affectedFeature: "Alertas de diagnóstico, lembretes de manutenção",
      userImpact: "Usuários não recebem notificações importantes",
      technicalRisk: "Baixo - Implementação bem documentada",
    });
    
    // Analytics
    dynamicGaps.push({
      id: "analytics",
      module: "Métricas",
      title: "Analytics de uso não implementado",
      description: "Não há tracking de eventos de usuário para análise de comportamento.",
      impact: "Impossível medir engajamento e identificar pontos de melhoria.",
      risk: "medium",
      affectedFeature: "Dashboard admin, tomada de decisões",
      userImpact: "Indireto - afeta evolução do produto",
      technicalRisk: "Baixo - Integração simples com GA4 ou similar",
    });
    
    // Offline
    dynamicGaps.push({
      id: "offline",
      module: "Experiência",
      title: "Modo offline não implementado",
      description: "App não funciona sem conexão à internet.",
      impact: "Usuários em áreas sem sinal não podem acessar histórico.",
      risk: "medium",
      affectedFeature: "Histórico de diagnósticos, dados de veículos",
      userImpact: "Acesso limitado em garagens subterrâneas ou áreas rurais",
      technicalRisk: "Médio - Requer estratégia de sync",
    });
    
    // E2E Tests
    dynamicGaps.push({
      id: "e2e-tests",
      module: "Qualidade",
      title: "Cobertura de testes E2E limitada",
      description: "Apenas testes básicos implementados com Playwright.",
      impact: "Regressões podem passar despercebidas.",
      risk: "medium",
      affectedFeature: "Todas as funcionalidades",
      userImpact: "Potenciais bugs em produção",
      technicalRisk: "Baixo - Playwright já configurado",
    });
    
    return dynamicGaps;
  }, [features]);

  // Immediate implementation priorities - DINÂMICO baseado no estado real
  const immediatePriorities = useMemo(() => {
    const priorities = [];
    
    // AbacatePay - Verificar se já está funcionando
    if (!isFeatureComplete("abacatepay-integration")) {
      priorities.push({
        order: 1,
        title: "Confirmar Pagamentos PIX AbacatePay",
        justification: "Integração AbacatePay já configurada, aguardando primeiro pagamento confirmado.",
        tasks: [
          "✅ Edge function create-pix-qrcode já criada",
          "✅ Webhook abacatepay-webhook já implementado",
          "✅ Atualização de user_subscriptions configurada",
          "Aguardando primeiro pagamento real para validação completa",
        ],
        estimatedEffort: "Aguardando pagamento real",
      });
    }
    
    priorities.push({
      order: priorities.length + 1,
      title: "Validação OBD com Hardware Real",
      justification: "Core feature do sistema. Precisa funcionar com adaptadores ELM327 reais.",
      tasks: [
        "Adquirir adaptadores OBD-II (Bluetooth e WiFi)",
        "Testar protocolo com diferentes veículos",
        "Ajustar timeouts e tratamento de erros",
        "Documentar compatibilidade",
      ],
      estimatedEffort: "3-5 dias",
    });
    
    priorities.push({
      order: priorities.length + 1,
      title: "Build App Nativo (LEMBRETE FUTURO)",
      justification: "DECISÃO: Por enquanto, manter como PWA. Quando quiser suporte completo a iPhone + WiFi, criar app nativo. Atualmente: Chrome Android e Desktop com Bluetooth funcionam. Safari/iOS e WiFi não funcionam.",
      tasks: [
        "⏳ FUTURO: Configurar ambiente de build Android (Android Studio)",
        "⏳ FUTURO: Gerar APK/AAB de produção para Google Play",
        "⏳ FUTURO: Configurar ambiente Xcode para iOS (requer Mac)",
        "⏳ FUTURO: Gerar IPA e submeter para App Store",
        "✅ ATUAL: Capacitor já está configurado no projeto",
        "✅ ATUAL: Código de conexão Bluetooth/WiFi nativo já existe",
      ],
      estimatedEffort: "2-4 dias quando decidir implementar",
    });
    
    priorities.push({
      order: priorities.length + 1,
      title: "Rate Limiting nas Edge Functions",
      justification: "Proteção crítica contra abusos e ataques antes de ir para produção.",
      tasks: [
        "Implementar middleware de rate limiting",
        "Configurar limites por IP e por usuário",
        "Adicionar headers de retry-after",
        "Monitorar e ajustar limites",
      ],
      estimatedEffort: "1 dia",
    });
    
    priorities.push({
      order: priorities.length + 1,
      title: "Habilitar Leaked Password Protection",
      justification: "Configuração simples que aumenta significativamente a segurança.",
      tasks: [
        "Acessar Supabase Dashboard → Auth → Settings",
        "Habilitar 'Leaked Password Protection'",
        "Testar cadastro com senha vazada conhecida",
      ],
      estimatedEffort: "15 minutos",
    });
    
    return priorities;
  }, [features]);

  // Evolution Roadmap
  const roadmap: RoadmapItem[] = [
    {
      id: "r1",
      title: "Sistema de Gamificação",
      description: "Badges por diagnósticos realizados, ranking de usuários, conquistas desbloqueáveis para aumentar engajamento.",
      category: "functional",
      timeframe: "medium",
      priority: 1,
    },
    {
      id: "r2",
      title: "Marketplace de Oficinas",
      description: "Integração com oficinas parceiras para agendamento de serviços, orçamentos automáticos baseados em diagnósticos.",
      category: "strategic",
      timeframe: "long",
      priority: 2,
    },
    {
      id: "r3",
      title: "IA Preditiva de Manutenção",
      description: "Análise de padrões de uso para prever manutenções necessárias antes de falhas, baseado em histórico de diagnósticos.",
      category: "technical",
      timeframe: "long",
      priority: 3,
    },
    {
      id: "r4",
      title: "Modo Offline Completo",
      description: "Sincronização local de dados com IndexedDB, acesso ao histórico sem internet, queue de operações.",
      category: "technical",
      timeframe: "medium",
      priority: 4,
    },
    {
      id: "r5",
      title: "Integração com Seguradoras",
      description: "API para seguradoras acessarem histórico de manutenção, potencial desconto para usuários do app.",
      category: "strategic",
      timeframe: "long",
      priority: 5,
    },
    {
      id: "r6",
      title: "Reconhecimento de Voz",
      description: "Comandos de voz para iniciar diagnóstico, navegar pelo app enquanto dirige (hands-free).",
      category: "functional",
      timeframe: "medium",
      priority: 6,
    },
    {
      id: "r7",
      title: "Widget para Home Screen",
      description: "Widget nativo mostrando status do veículo, próxima manutenção, alertas pendentes.",
      category: "functional",
      timeframe: "short",
      priority: 7,
    },
    {
      id: "r8",
      title: "Sistema de Referral",
      description: "Programa de indicação com benefícios para quem indica e quem é indicado, tracking de conversões.",
      category: "strategic",
      timeframe: "short",
      priority: 8,
    },
    {
      id: "r9",
      title: "Integração com Calendário",
      description: "Sincronização de lembretes de manutenção com Google Calendar, Apple Calendar.",
      category: "functional",
      timeframe: "short",
      priority: 9,
    },
    {
      id: "r10",
      title: "Dashboard de Frota",
      description: "Visão consolidada para empresas com múltiplos veículos, gestão de frotas, relatórios agregados.",
      category: "strategic",
      timeframe: "long",
      priority: 10,
    },
    {
      id: "r11",
      title: "API Pública",
      description: "API documentada para integrações de terceiros, autenticação OAuth, rate limiting por tier.",
      category: "technical",
      timeframe: "long",
      priority: 11,
    },
    {
      id: "r12",
      title: "Suporte a Veículos Elétricos",
      description: "Diagnósticos específicos para EVs, monitoramento de bateria, planejamento de rotas com carregadores.",
      category: "functional",
      timeframe: "long",
      priority: 12,
    },
  ];

  const getRiskBadge = (risk: GapItem["risk"]) => {
    switch (risk) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "high":
        return <Badge className="bg-orange-500">Alto</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-black">Médio</Badge>;
      case "low":
        return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  const getCategoryBadge = (category: RoadmapItem["category"]) => {
    switch (category) {
      case "technical":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Técnico</Badge>;
      case "functional":
        return <Badge variant="outline" className="border-green-500 text-green-600">Funcional</Badge>;
      case "strategic":
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Estratégico</Badge>;
    }
  };

  const getTimeframeBadge = (timeframe: RoadmapItem["timeframe"]) => {
    switch (timeframe) {
      case "short":
        return <Badge className="bg-green-600">Curto Prazo</Badge>;
      case "medium":
        return <Badge className="bg-blue-600">Médio Prazo</Badge>;
      case "long":
        return <Badge className="bg-purple-600">Longo Prazo</Badge>;
    }
  };

  const criticalGaps = gaps.filter(g => g.risk === "critical").length;
  const highGaps = gaps.filter(g => g.risk === "high").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-chakra text-foreground">
                Guia de Implementação
              </h1>
              <p className="text-muted-foreground">
                Documentação viva e estratégica do sistema Doutor Motors
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Última atualização: {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Important Reminder Card */}
        <Card className="border-2 border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-300 mb-1">📱 LEMBRETE: App Nativo Pendente</h3>
                <p className="text-sm text-foreground/80 mb-2">
                  <strong>Decisão atual:</strong> Sistema funcionando como PWA (app web instalável).
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-green-500/20 rounded border border-green-500/30">
                    <span className="text-green-300 font-medium">✅ Funciona agora:</span>
                    <p className="text-foreground/70 mt-1">Chrome Android + Desktop com Bluetooth</p>
                  </div>
                  <div className="p-2 bg-red-500/20 rounded border border-red-500/30">
                    <span className="text-red-300 font-medium">❌ Não funciona:</span>
                    <p className="text-foreground/70 mt-1">iPhone/Safari (Bluetooth), WiFi (todos)</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Quando precisar suporte completo:</strong> Criar app nativo com Capacitor (já configurado no projeto).
                  Veja detalhes na aba "Prioridades" → item #3.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="gaps">Análise de Gap</TabsTrigger>
            <TabsTrigger value="priorities">Prioridades</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
          </TabsList>

          {/* Tab: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Progresso do Sistema
                  </CardTitle>
                  <CardDescription>
                    Estado atual de desenvolvimento por área
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(systemMetrics).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">
                          {key === "frontend" ? "Frontend" :
                           key === "backend" ? "Backend (Edge Functions)" :
                           key === "database" ? "Banco de Dados" :
                           key === "integrations" ? "Integrações Externas" :
                           key === "security" ? "Segurança" : "Testes"}
                        </span>
                        <span className={value >= 80 ? "text-green-600" : value >= 50 ? "text-yellow-600" : "text-red-600"}>
                          {value}%
                        </span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{overallProgress}%</div>
                    <p className="text-sm text-muted-foreground mt-1">Progresso Geral</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600 font-medium">Gaps Críticos</span>
                      <span className="font-bold">{criticalGaps}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600 font-medium">Gaps de Alta Prioridade</span>
                      <span className="font-bold">{highGaps}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total de Gaps</span>
                      <span className="font-bold">{gaps.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Resumo Funcional do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  O <strong>Doutor Motors</strong> é uma plataforma de diagnóstico automotivo que permite aos usuários 
                  conectar um adaptador OBD-II ao veículo e obter análises inteligentes de códigos de erro (DTCs), 
                  soluções guiadas e histórico completo de manutenção.
                </p>
                
                <h4 className="text-lg font-semibold mt-4">O que já está definido e funcionando:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none p-0">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Sistema de autenticação completo (Supabase Auth)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Cadastro e gestão de veículos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Protocolo ELM327 implementado (Bluetooth/WiFi)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Motor de diagnóstico com análise de DTCs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Sistema de tickets de suporte
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Painel administrativo completo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Banco de dados com RLS 100% configurado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    11 Edge Functions para lógica de backend
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Gravação de dados em tempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Geração de relatórios em PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Sistema de auditoria (audit_logs)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Controle de uso por plano (usage_tracking)
                  </li>
                </ul>

                <h4 className="text-lg font-semibold mt-4">O que ainda precisa de validação:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none p-0">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Pagamentos PIX via AbacatePay (configurado, aguardando pagamento real)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    Build nativo do app (APK/IPA)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    Validação com hardware OBD real
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    Push notifications nativas (FCM)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    Analytics de uso (GA4, Mixpanel)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    Modo offline
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Gap Analysis */}
          <TabsContent value="gaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Análise de Gap por Módulo
                </CardTitle>
                <CardDescription>
                  Componentes, funções e fluxos que precisam de implementação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gaps.map((gap) => (
                  <Collapsible 
                    key={gap.id} 
                    open={openGaps.includes(gap.id)}
                    onOpenChange={() => toggleGap(gap.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        gap.risk === "critical" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900" :
                        gap.risk === "high" ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900" :
                        "bg-muted/50 border-border"
                      }`}>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded">
                            {gap.module}
                          </span>
                          <span className="font-medium text-left">{gap.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRiskBadge(gap.risk)}
                          {openGaps.includes(gap.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 border border-t-0 rounded-b-lg bg-background space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Descrição</h4>
                          <p className="text-sm text-muted-foreground">{gap.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1">Funcionalidade Afetada</h4>
                            <p className="text-sm">{gap.affectedFeature}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1">Impacto no Usuário</h4>
                            <p className="text-sm">{gap.userImpact}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1">Risco Técnico</h4>
                            <p className="text-sm">{gap.technicalRisk}</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Priorities */}
          <TabsContent value="priorities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Implementações Imediatas (Prioridade)
                </CardTitle>
                <CardDescription>
                  O que deve ser implementado primeiro, ordenado por impacto e urgência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {immediatePriorities.map((priority) => (
                  <div 
                    key={priority.order}
                    className="p-5 border rounded-lg bg-gradient-to-r from-muted/50 to-transparent"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                        {priority.order}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{priority.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {priority.estimatedEffort}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Justificativa:</strong> {priority.justification}
                        </p>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Tarefas:</h4>
                          <ul className="space-y-1">
                            {priority.tasks.map((task, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Roadmap */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Roadmap de Evolução Contínua
                </CardTitle>
                <CardDescription>
                  Sugestões técnicas, funcionais e estratégicas para evolução do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmap.map((item) => (
                    <Card key={item.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                          <span className="text-xs text-muted-foreground font-mono">#{item.priority}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {getCategoryBadge(item.category)}
                          {getTimeframeBadge(item.timeframe)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Documentation */}
          <TabsContent value="docs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Arquitetura do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Frontend
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• React 18 + TypeScript</li>
                      <li>• Vite como bundler</li>
                      <li>• Tailwind CSS + shadcn/ui</li>
                      <li>• React Router DOM v6</li>
                      <li>• React Query para estado de servidor</li>
                      <li>• Zustand para estado global</li>
                      <li>• Capacitor para app nativo</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Backend (Supabase)
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• PostgreSQL com RLS</li>
                      <li>• 19 tabelas configuradas</li>
                      <li>• 11 Edge Functions (Deno)</li>
                      <li>• Auth com JWT</li>
                      <li>• Realtime subscriptions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Padrões e Convenções
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Estrutura de Pastas</h4>
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`src/
├── components/     # Componentes React
│   ├── ui/         # shadcn/ui base
│   ├── admin/      # Painel admin
│   └── dashboard/  # Dashboard usuário
├── hooks/          # Hooks customizados
├── pages/          # Páginas/rotas
├── services/       # Lógica de negócio
├── store/          # Zustand stores
└── utils/          # Utilitários`}
                    </pre>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Convenções de Código</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Componentes: PascalCase</li>
                      <li>• Hooks: use + camelCase</li>
                      <li>• Arquivos: kebab-case ou camelCase</li>
                      <li>• Variáveis CSS: semantic tokens</li>
                      <li>• Edge Functions: kebab-case</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Como Atualizar Este Guia
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Este guia é uma <strong>documentação viva</strong> que deve ser atualizada conforme o sistema evolui.
                  Para manter a documentação atualizada:
                </p>
                <ol>
                  <li>
                    <strong>Ao completar uma implementação:</strong> Remova o gap correspondente da lista e 
                    atualize as métricas de progresso.
                  </li>
                  <li>
                    <strong>Ao identificar novos gaps:</strong> Adicione-os à análise com nível de risco, 
                    impacto e descrição técnica.
                  </li>
                  <li>
                    <strong>Ao surgir novas ideias:</strong> Adicione ao roadmap com categoria 
                    (técnico/funcional/estratégico) e timeframe apropriado.
                  </li>
                  <li>
                    <strong>Ao mudar prioridades:</strong> Reordene a lista de implementações imediatas 
                    com justificativa atualizada.
                  </li>
                </ol>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900 mt-4">
                  <p className="text-blue-800 dark:text-blue-200 m-0">
                    <strong>💡 Dica:</strong> Use este guia como base para planejamento de sprints e 
                    comunicação com stakeholders sobre o estado do projeto.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ImplementationGuidePage;
