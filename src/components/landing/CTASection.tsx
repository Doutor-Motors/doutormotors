import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/images/hero-bg.jpg";

const features = [
  {
    icon: Shield,
    title: "Seguro",
    description: "Nunca incentivamos consertos inseguros",
  },
  {
    icon: Clock,
    title: "Rápido",
    description: "Diagnóstico em menos de 5 minutos",
  },
  {
    icon: Wrench,
    title: "Prático",
    description: "Guias de conserto passo a passo",
  },
];

const CTASection = () => {
  return (
    <section
      className="py-12 sm:py-16 md:py-20 relative"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-chakra text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-primary-foreground mb-3 sm:mb-4 px-2">
          Pronto para entender o que seu carro está sinalizando ?
        </h2>

        <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          Sem surpresas. Sem pressão. Sem termos técnicos.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dm-blue-2/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg"
            >
              <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary mx-auto mb-2 sm:mb-3" />
              <h3 className="font-chakra text-base sm:text-lg font-semibold uppercase text-primary-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Link to="/signup">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center justify-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-6 sm:px-8 text-sm sm:text-base"
            >
              <span>Começar Diagnóstico</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-dm-blue-1 text-dm-blue-1 hover:bg-dm-blue-1 hover:text-white font-chakra uppercase rounded-pill px-6 sm:px-8 text-sm sm:text-base"
            >
              Já Tenho Conta
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
