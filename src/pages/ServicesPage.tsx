import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const ServicesPage = () => {
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

      {/* Pricing Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
              <img src={textBarsDark} alt="" className="w-7 h-4" />
              Planos
            </p>
            
            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground mb-4">
              Comece Grátis
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experimente todas as funcionalidades sem compromisso. 
              Upgrade quando precisar de mais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-transparent hover:border-primary transition-all">
              <h3 className="font-chakra text-xl font-semibold uppercase text-foreground mb-2">
                Plano Gratuito
              </h3>
              <p className="text-3xl font-bold text-primary mb-4">R$0<span className="text-base font-normal text-muted-foreground">/mês</span></p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>3 diagnósticos por mês</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>1 veículo cadastrado</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Histórico básico</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                  Começar Grátis
                </Button>
              </Link>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-primary relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">
                Popular
              </div>
              <h3 className="font-chakra text-xl font-semibold uppercase text-foreground mb-2">
                Plano Pro
              </h3>
              <p className="text-3xl font-bold text-primary mb-4">R$29<span className="text-base font-normal text-muted-foreground">/mês</span></p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Diagnósticos ilimitados</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Até 5 veículos</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Histórico completo</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                  Assinar Pro
                </Button>
              </Link>
            </div>
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
          <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-primary-foreground mb-4">
            Pronto para Começar?
          </h2>
          
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Crie sua conta grátis e comece a entender seu carro de verdade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Criar Conta Grátis</span>
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
