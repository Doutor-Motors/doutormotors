import { useState } from "react";
import { 
  FileText, 
  Download, 
  Check, 
  ChevronRight,
  Shield,
  CreditCard,
  Users,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Target,
  Rocket,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { downloadMonetizationGuide } from "@/services/pdf/monetizationGuideGenerator";
import { PLAN_FEATURES } from "@/hooks/useSubscription";
import { USAGE_LIMITS } from "@/hooks/useUsageTracking";

const GUIDE_SECTIONS = [
  {
    id: "1",
    title: "Visão Geral da Monetização",
    icon: Target,
    status: "complete",
    description: "Objetivos, princípios e práticas a evitar",
    items: [
      "Objetivo da monetização dentro do produto",
      "Princípios de monetização segura (transparência, consentimento, controle)",
      "Práticas abusivas a evitar",
    ],
  },
  {
    id: "2",
    title: "Modelos de Monetização",
    icon: CreditCard,
    status: "complete",
    description: "Planos Basic e Pro com todos os detalhes",
    items: [
      `Plano Basic: R$ 0/mês com ${USAGE_LIMITS.basic.diagnostics} diagnósticos`,
      `Plano Pro: ${PLAN_FEATURES.pro.price} com recursos ilimitados`,
      "Comparativo detalhado de recursos",
      "Limitações e benefícios de cada plano",
    ],
  },
  {
    id: "3",
    title: "Implementação Técnica",
    icon: FileText,
    status: "complete",
    description: "Front-end e back-end da monetização",
    items: [
      "Hooks: useSubscription, useUsageTracking",
      "Componentes: FeatureGate, UpgradePrompt, PlanCard",
      "Tabelas: user_subscriptions, usage_tracking",
      "Edge Functions para pagamentos",
    ],
  },
  {
    id: "4",
    title: "Fluxo de Pagamento Seguro",
    icon: Shield,
    status: "complete",
    description: "Integração AbacatePay PIX e tratamento de falhas",
    items: [
      "Jornada do usuário (7 etapas)",
      "Integração com AbacatePay PIX QR Code",
      "Webhooks e eventos de confirmação",
      "Tratamento de falhas e estornos",
    ],
  },
  {
    id: "5",
    title: "Compliance e Proteção",
    icon: AlertTriangle,
    status: "complete",
    description: "Aspectos legais e comunicação de riscos",
    items: [
      "Consentimento explícito obrigatório",
      "Termos de uso e limites de responsabilidade",
      "Comunicação clara de riscos",
      "Avisos sobre não substituir mecânico",
    ],
  },
  {
    id: "6",
    title: "Onboarding Financeiro",
    icon: BookOpen,
    status: "complete",
    description: "Apresentação de planos e microcopy",
    items: [
      "Apresentação sem pressão",
      "Textos claros sobre o que é pago",
      "Microcopy para gerar confiança",
      "Emails transacionais",
    ],
  },
  {
    id: "7",
    title: "Métricas e Controle",
    icon: TrendingUp,
    status: "complete",
    description: "KPIs e monitoramento de abusos",
    items: [
      "Conversão, Churn, LTV, CAC",
      "Indicadores de problemas de confiança",
      "Alertas de uso anormal",
      "Monitoramento de fraudes",
    ],
  },
  {
    id: "8",
    title: "Roadmap de Evolução",
    icon: Rocket,
    status: "pending",
    description: "MVP, intermediário e B2B",
    items: [
      "Fase 1: MVP atual (Basic + Pro)",
      "Fase 2: Trial, plano anual, compra pontual",
      "Fase 3: B2B (Oficinas, Frotas, API)",
    ],
  },
];

const IMPLEMENTATION_CHECKLIST = [
  { id: "gateway", label: "Integração AbacatePay habilitada", done: true },
  { id: "products", label: "Planos Basic e Pro configurados", done: true },
  { id: "checkout", label: "Edge Function de checkout (create-pix-qrcode)", done: true },
  { id: "webhook", label: "Webhook de eventos (abacatepay-webhook)", done: true },
  { id: "sandbox", label: "Testes em modo sandbox (devMode)", done: true },
  { id: "emails", label: "Emails transacionais configurados", done: true },
  { id: "production", label: "Lançamento em produção", done: false },
];

export default function MonetizationGuidePage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadMonetizationGuide();
      toast.success("PDF gerado com sucesso!", {
        description: "O guia completo foi baixado.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const completedSections = GUIDE_SECTIONS.filter(s => s.status === "complete").length;
  const progressPercentage = (completedSections / GUIDE_SECTIONS.length) * 100;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary">
                Guia de Desenvolvimento
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">Monetização Segura</h1>
            <p className="text-muted-foreground mt-1">
              Guia completo para implementação de monetização no Doutor Motors
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Clock className="h-5 w-5 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Baixar PDF Completo
              </>
            )}
          </Button>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progresso da Implementação</CardTitle>
              <span className="text-2xl font-bold text-primary">
                {completedSections}/{GUIDE_SECTIONS.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedSections} de {GUIDE_SECTIONS.length} seções implementadas
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Planos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedSections}</p>
                  <p className="text-sm text-muted-foreground">Seções Prontas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{GUIDE_SECTIONS.length - completedSections}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Rocket className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Fases do Roadmap</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sections Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Seções do Guia</CardTitle>
            <CardDescription>
              Clique em cada seção para ver os detalhes incluídos no PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {GUIDE_SECTIONS.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-lg ${
                        section.status === "complete" 
                          ? "bg-green-500/10" 
                          : "bg-amber-500/10"
                      }`}>
                        <section.icon className={`h-5 w-5 ${
                          section.status === "complete" 
                            ? "text-green-500" 
                            : "text-amber-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {section.id}. {section.title}
                        </p>
                        <p className="text-sm text-muted-foreground font-normal">
                          {section.description}
                        </p>
                      </div>
                      <Badge 
                        variant={section.status === "complete" ? "default" : "secondary"}
                        className="ml-auto mr-4"
                      >
                        {section.status === "complete" ? "Implementado" : "Pendente"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-12 space-y-2">
                      {section.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Implementation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Checklist de Implementação
            </CardTitle>
            <CardDescription>
              Próximos passos para lançar a monetização em produção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {IMPLEMENTATION_CHECKLIST.map((item, index) => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    item.done ? "bg-green-500/5 border-green-500/20" : "bg-muted/50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                    item.done 
                      ? "bg-green-500 text-white" 
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}>
                    {item.done ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={item.done ? "line-through text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                  {!item.done && index === 0 && (
                    <Badge variant="outline" className="ml-auto">
                      Próximo Passo
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plans Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plano Basic</CardTitle>
              <CardDescription>{PLAN_FEATURES.basic.price}/mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLAN_FEATURES.basic.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                <strong>Limites:</strong> {USAGE_LIMITS.basic.diagnostics} diagnósticos, {USAGE_LIMITS.basic.coding_executions} codings, {USAGE_LIMITS.basic.ai_queries} consultas IA/mês
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Plano Pro</CardTitle>
                  <CardDescription>{PLAN_FEATURES.pro.price}</CardDescription>
                </div>
                <Badge className="bg-primary">Recomendado</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLAN_FEATURES.pro.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="text-sm text-muted-foreground">
                  +{PLAN_FEATURES.pro.features.length - 5} recursos adicionais
                </li>
              </ul>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                <strong>Sem limites:</strong> Diagnósticos, codings, gravações e consultas ilimitadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Guia Completo em PDF</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Baixe o guia completo com todas as 8 seções, tabelas comparativas, 
              checklists e roadmap de implementação.
            </p>
            <Button 
              size="lg" 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Baixar PDF Completo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
