import { useState } from "react";
import { Crown, Shield, Zap, Clock, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlanCard } from "@/components/subscription/PlanCard";
import { useSubscription, PlanType, PLAN_FEATURES } from "@/hooks/useSubscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpgradePage() {
  const { currentPlan, subscription, createSubscription, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === currentPlan) return;

    setSelectedPlan(plan);

    // TODO: Integrar com Stripe quando estiver pronto
    // Por enquanto, apenas mostra mensagem
    if (plan === "pro") {
      toast.info("Integração de pagamento em desenvolvimento", {
        description: "Em breve você poderá fazer upgrade para o plano Pro!",
      });
    } else {
      // Downgrade para basic
      toast.info("Alteração de plano", {
        description: "Entre em contato com o suporte para alterar seu plano.",
      });
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Diagnósticos Ilimitados",
      description: "Realize quantos diagnósticos precisar sem limitações",
    },
    {
      icon: Shield,
      title: "Gravação de Dados",
      description: "Grave e analise dados em tempo real com gráficos detalhados",
    },
    {
      icon: Crown,
      title: "Funções de Codificação",
      description: "Acesse funções avançadas de codificação para marcas selecionadas",
    },
    {
      icon: Clock,
      title: "Suporte Prioritário",
      description: "Receba atendimento prioritário em todos os seus chamados",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Escolha seu Plano</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial do OBD Car Scanner com o plano Pro.
            Diagnósticos ilimitados, gravação de dados e muito mais.
          </p>
        </div>

        {/* Alerta de Desenvolvimento */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sistema de Pagamento em Desenvolvimento</AlertTitle>
          <AlertDescription>
            A integração com sistema de pagamento está em desenvolvimento.
            Por enquanto, você pode visualizar os planos disponíveis.
            <br />
            <strong>Lembrete:</strong> Integrar Stripe para pagamentos recorrentes.
          </AlertDescription>
        </Alert>

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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

        {/* Destaques Pro */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Por que escolher o Pro?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparação Detalhada */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Comparação Completa
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Recurso</th>
                      <th className="text-center p-4 font-medium">Basic</th>
                      <th className="text-center p-4 font-medium bg-primary/5">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4">Veículos</td>
                      <td className="text-center p-4">1</td>
                      <td className="text-center p-4 bg-primary/5">10</td>
                    </tr>
                    <tr>
                      <td className="p-4">Diagnósticos/mês</td>
                      <td className="text-center p-4">5</td>
                      <td className="text-center p-4 bg-primary/5">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="p-4">Parâmetros tempo real</td>
                      <td className="text-center p-4">4</td>
                      <td className="text-center p-4 bg-primary/5">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="p-4">Gravação de dados</td>
                      <td className="text-center p-4 text-muted-foreground">—</td>
                      <td className="text-center p-4 bg-primary/5">✓</td>
                    </tr>
                    <tr>
                      <td className="p-4">Exportação CSV</td>
                      <td className="text-center p-4 text-muted-foreground">—</td>
                      <td className="text-center p-4 bg-primary/5">✓</td>
                    </tr>
                    <tr>
                      <td className="p-4">Otimização OBD</td>
                      <td className="text-center p-4 text-muted-foreground">—</td>
                      <td className="text-center p-4 bg-primary/5">✓</td>
                    </tr>
                    <tr>
                      <td className="p-4">Configuração ATST</td>
                      <td className="text-center p-4 text-muted-foreground">—</td>
                      <td className="text-center p-4 bg-primary/5">✓</td>
                    </tr>
                    <tr>
                      <td className="p-4">Funções de codificação</td>
                      <td className="text-center p-4 text-muted-foreground">—</td>
                      <td className="text-center p-4 bg-primary/5">✓</td>
                    </tr>
                    <tr>
                      <td className="p-4">Suporte prioritário</td>
                      <td className="text-center p-4 text-muted-foreground">—</td>
                      <td className="text-center p-4 bg-primary/5">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
