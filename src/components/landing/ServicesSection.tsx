import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import serviceBg from "@/assets/images/service-bg.jpg";
import services1 from "@/assets/images/services-1.png";
import services2 from "@/assets/images/services-2.png";
import services3 from "@/assets/images/services-3.png";
import services4 from "@/assets/images/services-4.png";
import services5 from "@/assets/images/services-5.png";
import services6 from "@/assets/images/services-6.png";
import textBarsDark from "@/assets/images/text-bars-dark.png";

const services = [
  {
    icon: services1,
    title: "Diagnóstico OBD2",
    description: "Leitura completa de códigos de falha e sensores do seu veículo via adaptador OBD2.",
  },
  {
    icon: services2,
    title: "Análise de Urgência",
    description: "Classificação inteligente dos problemas por nível de risco e urgência de reparo.",
  },
  {
    icon: services3,
    title: "Linguagem Simples",
    description: "Tradução técnica para linguagem humana. Entenda o problema sem ser mecânico.",
  },
  {
    icon: services4,
    title: "Acompanhamento de Diagnósticos",
    description: "Tenha acesso aos diagnósticos realizados e às recomendações do sistema para seu veículo.",
  },
  {
    icon: services6,
    title: "Orientações Inteligentes"
    ,
    description: "Entenda as possíveis soluções e saiba quando o melhor caminho é procurar um profissional.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="py-12 sm:py-16 md:py-20 text-center"
      style={{
        backgroundImage: `url(${serviceBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <p className="flex items-center justify-center gap-2 font-chakra text-xs sm:text-sm uppercase text-primary mb-2 sm:mb-3">
          <img src={textBarsDark} alt="" className="w-5 h-3 sm:w-7 sm:h-4" />
          Nossos Serviços
        </p>

        <h2 className="font-chakra text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground mb-6 sm:mb-8 md:mb-10 px-2">
          Diagnóstico Completo Para Seu Veículo
        </h2>

        {/* First 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {services.slice(0, 3).map((service, index) => (
            <div
              key={index}
              className="bg-card p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group"
            >
              <figure className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
                <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
              </figure>
              <h3 className="font-chakra text-base sm:text-lg font-semibold uppercase text-foreground mb-1 sm:mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                {service.description}
              </p>
              <Link
                to="/signup"
                className="font-chakra text-xs sm:text-sm uppercase text-primary font-bold hover:underline"
              >
                Saiba Mais
              </Link>
            </div>
          ))}
        </div>

        {/* Last 2 cards - centered */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-6 sm:mb-10">
          {services.slice(3, 5).map((service, index) => (
            <div
              key={index}
              className="bg-card p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <figure className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
                <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
              </figure>
              <h3 className="font-chakra text-base sm:text-lg font-semibold uppercase text-foreground mb-1 sm:mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                {service.description}
              </p>
              <Link
                to="/signup"
                className="font-chakra text-xs sm:text-sm uppercase text-primary font-bold hover:underline"
              >
                Saiba Mais
              </Link>
            </div>
          ))}
        </div>

        {/* Featured Car Image - Between cards and button */}
        <div className="flex items-center justify-center mb-6 sm:mb-10">
          <img
            src={services5}
            alt="Carro vermelho"
            className="w-full max-w-[280px] sm:max-w-sm animate-float"
          />
        </div>

        <Link to="/signup">
          <Button
            size="lg"
            className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 mx-auto border border-transparent hover:border-foreground transition-all hover:-translate-y-1 text-sm sm:text-base px-6 sm:px-8"
          >
            <span>Ver Todos os Recursos</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ServicesSection;
