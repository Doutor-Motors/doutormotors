import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import work1 from "@/assets/images/work-1.jpg";
import work2 from "@/assets/images/work-2.jpg";
import work3 from "@/assets/images/work-3.jpg";
import textBarsDark from "@/assets/images/text-bars-dark.png";

const steps = [
  {
    image: work1,
    step: "Passo 1",
    title: "Conecte o OBD2",
    description: "Plugue o adaptador OBD2 no seu veículo e conecte via Bluetooth ou Wi-Fi.",
  },
  {
    image: work2,
    step: "Passo 2",
    title: "Execute o Diagnóstico",
    description: "O sistema lê todos os códigos de falha e sensores do seu veículo.",
  },
  {
    image: work3,
    step: "Passo 3",
    title: "Receba o Relatório",
    description: "Veja os problemas organizados por prioridade com explicações simples.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
            <img src={textBarsDark} alt="" className="w-7 h-4" />
            Como Funciona
          </p>
          
          <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground">
            Diagnóstico em 3 Passos Simples
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div 
              key={index}
              className="w-full"
            >
              <div className="relative group h-full">
                <figure className="aspect-[4/5] overflow-hidden rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </figure>
                
                <div className="bg-card shadow-lg p-5 mx-3 -mt-14 relative text-center rounded-lg">
                  <p className="font-chakra text-sm uppercase text-primary font-bold mb-1">
                    {item.step}
                  </p>
                  <h3 className="font-chakra text-base font-semibold uppercase text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <Link 
                    to="/signup"
                    className="bg-primary text-primary-foreground w-9 h-9 rounded-full flex items-center justify-center mx-auto hover:bg-dm-blue-3 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/signup">
            <Button 
              size="lg"
              className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 mx-auto border border-transparent hover:border-foreground transition-all hover:-translate-y-1"
            >
              <span>Experimente Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
