import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, X, Crown, Activity, Database, Code2, Settings2, Sparkles, Headphones, Car, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroBg from "@/assets/images/hero-bg.jpg";
import serviceBg from "@/assets/images/service-bg.jpg";
import services1 from "@/assets/images/services-1.png";
import services2 from "@/assets/images/services-2.png";
import services3 from "@/assets/images/services-3.png";
import services4 from "@/assets/images/services-4.png";
import services5 from "@/assets/images/services-5.png";
import services6 from "@/assets/images/services-6.png";
import textBarsLight from "@/assets/images/text-bars-light.png";
import textBarsDark from "@/assets/images/text-bars-dark.png";
import { PLAN_FEATURES } from "@/hooks/useSubscription";

const services = [
  {
    icon: services1,
    title: "Diagnóstico OBD2 Inteligente",
    description: "Leitura completa de códigos de falha e sensores do seu veículo através do adaptador OBD2.",
    features: [
      "Leitura de códigos DTC",
      "Dados em tempo real dos sensores",
      "Compatível com veículos a partir de 1996*",
      "Conexão via Bluetooth ou Wi-Fi",
    ],
    note: "*Disponibilidade pode variar conforme veículo e adaptador compatível."
  },
  {
    icon: services2,
    title: "Análise de Urgência e Risco",
    description: "Nem todo problema é grave e o sistema te mostra isso.",
    features: [
      "Classificação automática por risco e urgência",
      "Indicadores visuais claros",
      "Alertas de segurança",
      "Recomendações objetivas do que fazer",
    ],
  },
  {
    icon: services3,
    title: "Linguagem Simples",
    description: "Você não precisa ser mecânico para entender seu carro.",
    features: [
      "Tradução técnica → linguagem humana",
      "Sem jargões complicados",
      "Exemplos e analogias do dia a dia",
      "Visual didático e explicativo",
    ],
  },
  {
    icon: services4,
    title: "Histórico Completo do Veículo",
    description: "Tudo que acontece com seu carro fica registrado.",
    features: [
      "Linha do tempo dos diagnósticos",
      "Relatórios organizados",
      "Cadastro de veículos",
      "Dados armazenados com segurança na nuvem",
    ],
  },
  {
    icon: services6,
    title: "Guias de Conserto Orientados",
    description: "Saiba quando pode resolver sozinho e quando não deve.",
    features: [
      "Guias passo a passo (quando disponíveis)",
      "Lista de ferramentas",
      "Nível de dificuldade claro",
      "Estimativa de tempo",
    ],
    note: "Nunca incentivamos consertos inseguros. O sistema sempre indica quando procurar um profissional."
  },
  {
    icon: services5,
    title: "Suporte Especializado",
    description: "Quando o problema exige ajuda profissional, você sabe exatamente o motivo.",
    features: [
      "Orientação técnica dentro da plataforma",
      "Diagnóstico claro para apresentar ao mecânico",
      "Comunicação mais transparente e sem surpresas",
    ],
  },
];

const PRO_BENEFITS = [
  {
    icon: Activity,
    title: "Diagnósticos Ilimitados",
    description: "Use quantas vezes precisar, sem limites mensais.",
  },
  {
    icon: Zap,
    title: "Dados em Tempo Real Avançados",
    description: "Visualize múltiplos parâmetros simultâneos com gráficos claros.",
  },
  {
    icon: Database,
    title: "Gravação e Exportação de Dados",
    description: "Exporte relatórios para análise técnica quando necessário.",
  },
  {
    icon: Sparkles,
    title: "Inteligência Artificial Automotiva",
    description: "Consultas ilimitadas para entender falhas, causas prováveis e próximos passos.",
  },
  {
    icon: Shield,
    title: "Alertas Personalizados",
    description: "Receba avisos conforme o uso e histórico do veículo.",
  },
  {
    icon: Headphones,
    title: "Suporte Prioritário",
    description: "Respostas mais rápidas sempre que precisar.",
  },
];

const COMPARISON_TABLE = [
  { feature: "Veículos cadastrados", basic: "1", pro: "10" },
  { feature: "Diagnósticos por mês", basic: "5", pro: "Ilimitado", highlight: true },
  { feature: "Funções de Coding", basic: "Não disponível", pro: "Ilimitado", highlight: true },
  { feature: "Gravações de Dados", basic: "Não disponível", pro: "Ilimitado", highlight: true },
  { feature: "Consultas IA", basic: "5/mês", pro: "Ilimitado" },
  { feature: "Parâmetros em tempo real", basic: "4", pro: "Ilimitado" },
  { feature: "Gravação de dados avançada", basic: false, pro: true },
  { feature: "Exportação CSV/PDF", basic: false, pro: true },
  { feature: "Configurações OBD avançadas", basic: false, pro: true },
  { feature: "Otimização de comunicação", basic: false, pro: true },
  { feature: "Suporte prioritário", basic: false, pro: true },
];

const ServicesPage = () => {
  const renderCellValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className={value === "Ilimitado" ? "font-semibold text-primary" : ""}>{value}</span>;
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section
        className="relative pt-32 sm:pt-36 md:pt-44 pb-12 md:pb-20 overflow-hidden text-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <p className="flex items-center justify-center gap-2 font-chakra text-xs sm:text-sm uppercase text-primary-foreground mb-2 sm:mb-3 fade-in-up">
            <img src={textBarsLight} alt="" className="w-5 h-3 sm:w-7 sm:h-4" />
            Nossos Serviços
          </p>

          <h1 className="font-chakra text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-3 md:mb-4 fade-in-up">
            Diagnóstico Inteligente Para Você Entender Seu Veículo
          </h1>

          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto fade-in-up">
            O Doutor Motors foi criado para transformar dados técnicos do seu carro em decisões claras, seguras e conscientes, sem mistério e sem dependência.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section
        className="py-20"
        style={{
          backgroundImage: `url(${serviceBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group"
              >
                <figure className="w-20 h-20 mx-auto mb-6">
                  <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
                </figure>

                <h3 className="font-chakra text-xl font-semibold uppercase text-foreground mb-3 text-center">
                  {service.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6 text-center">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-sm text-foreground text-left">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {(service as any).note && (
                  <div className="mt-6 pt-4 border-t border-border/40">
                    <p className="text-xs text-muted-foreground italic">
                      {(service as any).note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 mb-4">
              <Crown className="h-3 w-3 mr-1" />
              Recursos Exclusivos Pro
            </Badge>

            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground mb-4">
              Para quem quer controle total e zero limitações
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              O plano Pro é ideal para quem usa o sistema com frequência e quer ir além do diagnóstico básico.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground italic">
              Algumas funções avançadas podem variar conforme o modelo do veículo.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
              <img src={textBarsDark} alt="" className="w-7 h-4" />
              Planos
            </p>

            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground mb-4">
              Escolha o plano ideal para você
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compare os recursos e escolha o plano ideal para suas necessidades.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Basic Plan */}
            <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-transparent hover:border-muted-foreground/20 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Zap className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-chakra text-xl font-semibold uppercase text-foreground">
                    {PLAN_FEATURES.basic.name}
                  </h3>
                  <p className="text-3xl font-bold text-primary">{PLAN_FEATURES.basic.price}<span className="text-base font-normal text-muted-foreground">/mês</span></p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Incluído</p>
                <ul className="space-y-3">
                  {PLAN_FEATURES.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {PLAN_FEATURES.basic.limitations.length > 0 && (
                <div className="space-y-4 mb-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Limitações</p>
                  <ul className="space-y-3">
                    {PLAN_FEATURES.basic.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link to="/signup" className="mt-auto">
                <Button variant="outline" className="w-full font-chakra uppercase">
                  COMEÇAR DIAGNÓSTICO
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-primary relative overflow-hidden scale-[1.02] flex flex-col">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra text-xl font-semibold uppercase text-foreground">
                    {PLAN_FEATURES.pro.name}
                  </h3>
                  <p className="text-3xl font-bold text-primary">{PLAN_FEATURES.pro.price}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Incluído</p>
                <ul className="space-y-3">
                  {PLAN_FEATURES.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/signup" className="mt-auto">
                <Button className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                  Assinar Pro
                </Button>
              </Link>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Comparação Completa de Recursos</CardTitle>
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
                            <span className="text-xs text-muted-foreground font-normal">R$ 34,90/mês</span>
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-primary-foreground mb-4">
            Faça Parte da Nossa Comunidade
          </h2>

          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Milhares de motoristas já entenderam que conhecimento é poder, economia, segurança e tranquilidade também.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>COMEÇAR DIAGNÓSTICO</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
