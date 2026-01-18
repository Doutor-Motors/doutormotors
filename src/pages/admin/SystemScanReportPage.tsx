import { useState } from "react";
import { 
  FileText, 
  Download, 
  Database, 
  Server, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { generateCurrentSystemReport } from "@/services/pdf/systemScanReportGenerator";
import { generateTechnicalReportPDF } from "@/services/pdf/technicalReportGenerator";
import { useToast } from "@/hooks/use-toast";

interface TableInfo {
  name: string;
  columns: number;
  hasRLS: boolean;
  purpose: string;
}

interface SecurityIssue {
  level: "critical" | "warning" | "info";
  description: string;
  status: "fixed" | "pending" | "manual";
}

interface Correction {
  type: string;
  description: string;
  status: "applied" | "pending";
}

const SystemScanReportPage = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingFull, setIsExportingFull] = useState(false);

  const tables: TableInfo[] = [
    { name: "profiles", columns: 8, hasRLS: true, purpose: "Dados do perfil do usuário" },
    { name: "user_roles", columns: 4, hasRLS: true, purpose: "Controle de papéis (admin/user)" },
    { name: "user_subscriptions", columns: 11, hasRLS: true, purpose: "Assinaturas e planos" },
    { name: "vehicles", columns: 10, hasRLS: true, purpose: "Veículos cadastrados" },
    { name: "diagnostics", columns: 8, hasRLS: true, purpose: "Sessões de diagnóstico" },
    { name: "diagnostic_items", columns: 13, hasRLS: true, purpose: "Itens de cada diagnóstico (DTCs)" },
    { name: "support_tickets", columns: 15, hasRLS: true, purpose: "Tickets de suporte" },
    { name: "ticket_messages", columns: 6, hasRLS: true, purpose: "Mensagens dos tickets" },
    { name: "data_recordings", columns: 13, hasRLS: true, purpose: "Gravações de dados OBD" },
    { name: "recording_data_points", columns: 5, hasRLS: true, purpose: "Pontos de dados gravados" },
    { name: "obd_settings", columns: 15, hasRLS: true, purpose: "Configurações OBD do usuário" },
    { name: "legal_consents", columns: 8, hasRLS: true, purpose: "Consentimentos legais" },
    { name: "system_alerts", columns: 15, hasRLS: true, purpose: "Alertas do sistema" },
    { name: "system_settings", columns: 7, hasRLS: true, purpose: "Configurações do sistema" },
    { name: "contact_messages", columns: 9, hasRLS: true, purpose: "Mensagens de contato" },
    { name: "user_notification_preferences", columns: 9, hasRLS: true, purpose: "Preferências de notificação" },
    { name: "video_transcription_cache", columns: 13, hasRLS: true, purpose: "Cache de transcrições de vídeo" },
    { name: "usage_tracking", columns: 10, hasRLS: true, purpose: "Controle de uso mensal (NOVA)" },
    { name: "coding_executions", columns: 14, hasRLS: true, purpose: "Histórico de codificações (NOVA)" },
  ];

  const securityIssues: SecurityIssue[] = [
    { level: "critical", description: "Tabela usage_tracking não existia - funcionalidade quebrada", status: "fixed" },
    { level: "critical", description: "Tabela coding_executions não existia - funcionalidade quebrada", status: "fixed" },
    { level: "warning", description: "RLS Policy 'USING (true)' em user_subscriptions para UPDATE", status: "fixed" },
    { level: "warning", description: "Extensões instaladas no schema 'public'", status: "manual" },
    { level: "warning", description: "Proteção de senhas vazadas desabilitada", status: "manual" },
    { level: "info", description: "Cache de vídeo permite SELECT público (intencional)", status: "pending" },
  ];

  const corrections: Correction[] = [
    { type: "Tabela Criada", description: "usage_tracking - Controle de uso mensal por usuário", status: "applied" },
    { type: "Tabela Criada", description: "coding_executions - Histórico de funções de codificação", status: "applied" },
    { type: "RLS Corrigido", description: "Substituída política USING(true) por verificação de usuário/admin", status: "applied" },
    { type: "Índices Criados", description: "Índices para diagnostic_items, diagnostics, vehicles, tickets", status: "applied" },
    { type: "Trigger Criado", description: "update_usage_tracking_updated_at para timestamp automático", status: "applied" },
    { type: "Hook Atualizado", description: "useUsageTracking.ts - Removido 'as any' type casting", status: "applied" },
    { type: "Hook Atualizado", description: "useCodingHistory.ts - Removido 'as any' type casting", status: "applied" },
  ];

  const recommendations = [
    "Habilitar 'Leaked Password Protection' nas configurações de autenticação do Supabase.",
    "Mover extensões do schema 'public' para um schema dedicado como 'extensions'.",
    "Implementar Stripe Webhooks para atualização automática de assinaturas.",
    "Adicionar tabela de auditoria (audit_logs) para registrar ações críticas.",
    "Implementar soft delete em tabelas críticas para evitar perda de dados.",
    "Configurar backups automáticos diários do banco de dados.",
    "Adicionar monitoramento de performance com métricas de tempo de resposta.",
    "Implementar rate limiting nas edge functions para evitar abuso.",
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      generateCurrentSystemReport();
      toast({
        title: "PDF Exportado!",
        description: "O relatório de varredura foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFullReport = async () => {
    setIsExportingFull(true);
    try {
      generateTechnicalReportPDF();
      toast({
        title: "Relatório Técnico Completo Exportado!",
        description: "O PDF com todas as 15 seções foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório técnico.",
        variant: "destructive",
      });
    } finally {
      setIsExportingFull(false);
    }
  };

  const getLevelBadge = (level: SecurityIssue["level"]) => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Aviso</Badge>;
      case "info":
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getStatusBadge = (status: SecurityIssue["status"]) => {
    switch (status) {
      case "fixed":
        return <Badge className="bg-green-600">✓ Corrigido</Badge>;
      case "pending":
        return <Badge variant="outline">⏳ Pendente</Badge>;
      case "manual":
        return <Badge variant="outline" className="border-orange-500 text-orange-600">👤 Manual</Badge>;
    }
  };

  const summary = {
    totalTables: tables.length,
    totalEdgeFunctions: 11,
    totalPages: 35,
    totalHooks: 17,
    securityWarnings: securityIssues.length,
    criticalIssuesFixed: securityIssues.filter(i => i.level === "critical" && i.status === "fixed").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-chakra text-foreground">
              Relatório de Varredura do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise completa da arquitetura e segurança do Doutor Motors
            </p>
          </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleExportFullReport}
            disabled={isExportingFull}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExportingFull ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Relatório Técnico Completo (PDF)
              </>
            )}
          </Button>
          <Button 
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="outline"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Relatório de Varredura
              </>
            )}
          </Button>
        </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{summary.totalTables}</p>
              <p className="text-sm text-muted-foreground">Tabelas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Server className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{summary.totalEdgeFunctions}</p>
              <p className="text-sm text-muted-foreground">Edge Functions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{summary.totalPages}</p>
              <p className="text-sm text-muted-foreground">Páginas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{summary.totalHooks}</p>
              <p className="text-sm text-muted-foreground">Hooks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{summary.securityWarnings}</p>
              <p className="text-sm text-muted-foreground">Avisos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold">{summary.criticalIssuesFixed}</p>
              <p className="text-sm text-muted-foreground">Corrigidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="corrections">Correções</TabsTrigger>
            <TabsTrigger value="tables">Banco de Dados</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Análise de Segurança
                </CardTitle>
                <CardDescription>
                  Problemas identificados e seus status de resolução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityIssues.map((issue, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getLevelBadge(issue.level)}
                        <span className="text-sm">{issue.description}</span>
                      </div>
                      {getStatusBadge(issue.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corrections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Correções Aplicadas
                </CardTitle>
                <CardDescription>
                  Todas as correções realizadas nesta varredura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {corrections.map((correction, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          {correction.type}
                        </Badge>
                        <span className="text-sm">{correction.description}</span>
                      </div>
                      <Badge className="bg-green-600">✓ Aplicado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Estrutura do Banco de Dados
                </CardTitle>
                <CardDescription>
                  Todas as tabelas do sistema com suas configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Tabela</th>
                        <th className="text-center p-3 font-semibold">Colunas</th>
                        <th className="text-center p-3 font-semibold">RLS</th>
                        <th className="text-left p-3 font-semibold">Finalidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables.map((table, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono text-xs">
                            {table.name}
                            {table.purpose.includes("NOVA") && (
                              <Badge className="ml-2 bg-green-600 text-xs">Nova</Badge>
                            )}
                          </td>
                          <td className="p-3 text-center">{table.columns}</td>
                          <td className="p-3 text-center">
                            {table.hasRLS ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">{table.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Recomendações Futuras
                </CardTitle>
                <CardDescription>
                  Melhorias sugeridas para evolução do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SystemScanReportPage;
