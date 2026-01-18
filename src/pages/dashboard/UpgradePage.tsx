import { useState } from "react";
import { 
  Crown, 
  Shield, 
  Zap, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  Sparkles,
  Database,
  Code2,
  Settings2,
  Headphones,
  Car,
  Activity,
  TrendingUp,
  Star,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlanCard } from "@/components/subscription/PlanCard";
import { useSubscription, PlanType } from "@/hooks/useSubscription";
import { USAGE_LIMITS } from "@/hooks/useUsageTracking";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ComparisonRow {
  feature: string;
  basic: string | boolean;
  pro: string | boolean;
  highlight?: boolean;
}

const COMPARISON_TABLE: ComparisonRow[] = [
  { feature: "Veículos cadastrados", basic: "1", pro: "10" },
  { feature: "Diagnósticos por mês", basic: `${USAGE_LIMITS.basic.diagnostics}`, pro: "Ilimitado", highlight: true },
  { feature: "Funções de Coding", basic: `${USAGE_LIMITS.basic.coding_executions}/mês`, pro: "Ilimitado", highlight: true },
  { feature: "Gravações de Dados", basic: `${USAGE_LIMITS.basic.data_recordings}/mês`, pro: "Ilimitado", highlight: true },
  { feature: "Consultas IA", basic: `${USAGE_LIMITS.basic.ai_queries}/mês`, pro: "Ilimitado" },
  { feature: "Parâmetros em tempo real", basic: "4", pro: "Ilimitado" },
  { feature: "Gravação de dados avançada", basic: false, pro: true },
  { feature: "Exportação CSV/PDF", basic: false, pro: true },
  { feature: "Configurações OBD avançadas", basic: false, pro: true },
  { feature: "Otimização de comunicação", basic: false, pro: true },
  { feature: "Configuração ATST personalizada", basic: false, pro: true },
  { feature: "Funções de codificação avançadas", basic: false, pro: true },
  { feature: "Suporte prioritário", basic: false, pro: true },
  { feature: "Sem anúncios", basic: false, pro: true },
];

const PRO_BENEFITS = [
  {
    icon: Activity,
    title: "Diagnósticos Ilimitados",
    description: "Realize quantos diagnósticos precisar, quando quiser, sem se preocupar com limites mensais.",
  },
  {
    icon: Database,
    title: "Gravação de Dados Completa",
    description: "Grave dados em tempo real com até 20 parâmetros simultâneos e exporte para análise detalhada.",
  },
  {
    icon: Code2,
    title: "Funções de Coding Avançadas",
    description: "Acesse funções de programação como reset de adaptações, calibrações e configuração de módulos.",
  },
  {
    icon: Settings2,
    title: "Configurações OBD Pro",
    description: "Otimize a comunicação com ajustes de timing, protocolos personalizados e comandos avançados.",
  },
  {
    icon: Sparkles,
    title: "Inteligência Artificial",
    description: "Consultas ilimitadas ao assistente de IA para diagnósticos precisos e soluções personalizadas.",
  },
  {
    icon: Headphones,
    title: "Suporte Prioritário",
    description: "Atendimento rápido e prioritário para todas as suas dúvidas e problemas técnicos.",
  },
];

const TESTIMONIALS = [
  {
    name: "Carlos M.",
    role: "Mecânico Profissional",
    text: "O plano Pro transformou minha oficina. Os diagnósticos ilimitados e as funções de coding economizam horas do meu dia.",
    rating: 5,
  },
  {
    name: "Ana Paula S.",
    role: "Entusiasta Automotivo",
    text: "Consegui diagnosticar problemas no meu carro que oficinas não encontravam. A gravação de dados é incrível!",
    rating: 5,
  },
  {
    name: "Roberto L.",
    role: "Proprietário de Frota",
    text: "Gerencio 8 veículos com facilidade. O suporte prioritário já me salvou várias vezes.",
    rating: 5,
  },
];

export default function UpgradePage() {
  const { currentPlan, isLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState("benefits");

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === currentPlan) return;

    if (plan === "pro") {
      toast.info("Integração de pagamento em desenvolvimento", {
        description: "Em breve você poderá fazer upgrade para o plano Pro!",
      });
    } else {
      toast.info("Alteração de plano", {
        description: "Entre em contato com o suporte para alterar seu plano.",
      });
    }
  };

  const renderCellValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className={value === "Ilimitado" ? "font-semibold text-primary" : ""}>{value}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Upgrade para Pro
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Desbloqueie Todo o Potencial
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Diagnósticos ilimitados, funções avançadas de coding, gravação de dados profissional 
            e muito mais. Leve sua experiência automotiva ao próximo nível.
          </p>
        </div>

        {/* Alerta de Desenvolvimento */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sistema de Pagamento em Desenvolvimento</AlertTitle>
          <AlertDescription>
            A integração com Stripe está sendo implementada. Em breve você poderá assinar o plano Pro.
          </AlertDescription>
        </Alert>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <PlanCard
            planType="basic"
            isCurrentPlan={currentPlan === "basic"}
            onSelect={handleSelectPlan}
            isLoading={isLoading}
          />
          <PlanCard
            planType="pro"
            isCurrentPlan={currentPlan === "pro"}
            onSelect={handleSelectPlan}
            isLoading={isLoading}
          />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="benefits">Benefícios Pro</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="benefits" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRO_BENEFITS.map((benefit, index) => (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparação Completa de Recursos</CardTitle>
                <CardDescription>Veja todas as diferenças entre os planos Basic e Pro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-medium">Recurso</th>
                        <th className="text-center p-4 font-medium w-32">
                          <div className="flex flex-col items-center">
                            <span>Basic</span>
                            <span className="text-xs text-muted-foreground font-normal">R$ 0/mês</span>
                          </div>
                        </th>
                        <th className="text-center p-4 font-medium w-32 bg-primary/5">
                          <div className="flex flex-col items-center">
                            <span className="flex items-center gap-1">
                              <Crown className="h-4 w-4 text-amber-500" />
                              Pro
                            </span>
                            <span className="text-xs text-muted-foreground font-normal">R$ 29,90/mês</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {COMPARISON_TABLE.map((row, index) => (
                        <tr key={index} className={row.highlight ? "bg-primary/5" : ""}>
                          <td className="p-4 text-sm">
                            {row.feature}
                            {row.highlight && (
                              <Badge variant="outline" className="ml-2 text-xs">Popular</Badge>
                            )}
                          </td>
                          <td className="text-center p-4 text-sm">
                            {renderCellValue(row.basic)}
                          </td>
                          <td className="text-center p-4 text-sm bg-primary/5">
                            {renderCellValue(row.pro)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-12 text-center">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pronto para o Upgrade?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Junte-se a milhares de usuários que já aproveitam todos os benefícios do plano Pro.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => handleSelectPlan("pro")}
              disabled={currentPlan === "pro"}
            >
              <Crown className="h-5 w-5" />
              {currentPlan === "pro" ? "Você já é Pro!" : "Assinar Pro - R$ 29,90/mês"}
            </Button>
            {currentPlan !== "pro" && (
              <p className="text-xs text-muted-foreground mt-3">
                Cancele a qualquer momento. Sem compromisso.
              </p>
            )}
          </CardContent>
        </Card>

        {/* FAQ Quick Links */}
        <div className="text-center pb-8">
          <p className="text-sm text-muted-foreground">
            Tem dúvidas? Confira nossa{" "}
            <a href="/faq" className="text-primary hover:underline">página de FAQ</a>
            {" "}ou{" "}
            <a href="/contact" className="text-primary hover:underline">entre em contato</a>.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
