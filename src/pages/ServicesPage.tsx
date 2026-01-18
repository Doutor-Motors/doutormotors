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
    title: "Diagnóstico OBD2",
    description: "Leitura completa de códigos de falha e sensores do seu veículo via adaptador OBD2.",
    features: [
      "Leitura de todos os códigos DTC",
      "Dados em tempo real dos sensores",
      "Compatível com veículos 1996+",
      "Conexão Bluetooth ou Wi-Fi",
    ],
  },
  {
    icon: services2,
    title: "Análise de Urgência",
    description: "Classificação inteligente dos problemas por nível de risco e urgência de reparo.",
    features: [
      "Priorização automática de problemas",
      "Indicadores visuais de urgência",
      "Alertas de segurança",
      "Recomendações de ação",
    ],
  },
  {
    icon: services3,
    title: "Linguagem Simples",
    description: "Tradução técnica para linguagem humana. Entenda o problema sem ser mecânico.",
    features: [
      "Explicações em português claro",
      "Sem jargões técnicos",
      "Analogias do dia a dia",
      "Ilustrações explicativas",
    ],
  },
  {
    icon: services4,
    title: "Histórico Completo",
    description: "Mantenha um registro de todos os diagnósticos e manutenções do seu veículo.",
    features: [
      "Linha do tempo de eventos",
      "Relatórios exportáveis",
      "Múltiplos veículos",
      "Backup em nuvem",
    ],
  },
  {
    icon: services6,
    title: "Guias de Conserto",
    description: "Descubra se você pode resolver sozinho com nossos guias passo a passo.",
    features: [
      "Tutoriais em vídeo",
      "Lista de ferramentas",
      "Nível de dificuldade",
      "Tempo estimado",
    ],
  },
  {
    icon: services5,
    title: "Suporte Especializado",
    description: "Conecte-se com mecânicos parceiros para problemas mais complexos.",
    features: [
      "Chat com especialistas",
      "Orçamentos transparentes",
      "Mecânicos verificados",
      "Avaliações de clientes",
    ],
  },
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
        className="relative pt-40 pb-20 overflow-hidden text-center"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary-foreground mb-3 fade-in-up">
            <img src={textBarsLight} alt="" className="w-7 h-4" />
            Nossos Serviços
          </p>
          
          <h1 className="font-chakra text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-4 fade-in-up">
            Diagnóstico Completo Para Seu Veículo
          </h1>
          
          <p className="text-white/90 text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto fade-in-up">
            Oferecemos uma solução completa para você entender e cuidar do seu veículo 
            com inteligência e autonomia.
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
                    <li key={featureIndex} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
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
              Desbloqueie Todo o Potencial
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Diagnósticos ilimitados, funções avançadas de coding, gravação de dados profissional 
              e muito mais com o plano Pro.
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
              Escolha Seu Plano
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compare os recursos e escolha o plano ideal para suas necessidades.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Basic Plan */}
            <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-transparent hover:border-muted-foreground/20 transition-all">
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
              
              <Link to="/signup">
                <Button variant="outline" className="w-full font-chakra uppercase">
                  Começar Agora
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-primary relative overflow-hidden scale-[1.02]">
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
              
              <Link to="/signup">
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
            Pronto para Começar?
          </h2>
          
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Crie sua conta e comece a entender seu carro de verdade.
            Cancele a qualquer momento, sem compromisso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Criar Conta</span>
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
