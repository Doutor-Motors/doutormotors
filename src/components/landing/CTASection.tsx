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
          Pronto para Entender Seu Carro?
        </h2>
        
        <p className="text-dm-cadet text-lg max-w-2xl mx-auto mb-8">
          Comece agora gratuitamente e tenha acesso ao diagnóstico completo do seu veículo. 
          Sem surpresas, sem custos escondidos.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-dm-blue-2/50 backdrop-blur-sm p-6 rounded-lg"
            >
              <feature.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-chakra text-lg font-semibold uppercase text-primary-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-dm-cadet text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

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
          <Link to="/login">
            <Button 
              size="lg"
              variant="outline"
              className="border-dm-blue-1 text-dm-blue-1 hover:bg-dm-blue-1 hover:text-white font-chakra uppercase rounded-pill px-8"
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
