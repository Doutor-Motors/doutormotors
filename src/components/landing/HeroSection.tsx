import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/images/hero-banner.png";
import heroBg from "@/assets/images/hero-bg.jpg";
import textBarsLight from "@/assets/images/text-bars-light.png";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen pt-32 pb-20 overflow-hidden text-center lg:text-left"
      style={{ 
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
        {/* Content */}
        <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
          <p className="flex items-center justify-center lg:justify-start gap-2 font-chakra text-sm uppercase text-primary-foreground mb-3">
            <img src={textBarsLight} alt="" className="w-7 h-4" />
            O médico digital do seu carro
          </p>
          
          <h1 className="font-chakra text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-4">
            Diagnóstico Automotivo Inteligente
          </h1>
          
          <p className="text-dm-cadet text-base md:text-lg mb-8 leading-relaxed">
            Conecte seu OBD2, entenda os problemas do seu carro em linguagem simples, 
            descubra a urgência e saiba se pode resolver sozinho.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/#how-it-works">
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-secondary font-chakra uppercase rounded-pill px-8"
              >
                Como Funciona
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-dm-blue-3">
            <div className="text-center lg:text-left">
              <span className="font-chakra text-2xl md:text-3xl font-bold text-primary-foreground">500+</span>
              <p className="text-dm-cadet text-xs md:text-sm">Códigos Suportados</p>
            </div>
            <div className="text-center lg:text-left">
              <span className="font-chakra text-2xl md:text-3xl font-bold text-primary-foreground">100%</span>
              <p className="text-dm-cadet text-xs md:text-sm">Em Português</p>
            </div>
            <div className="text-center lg:text-left">
              <span className="font-chakra text-2xl md:text-3xl font-bold text-primary-foreground">24/7</span>
              <p className="text-dm-cadet text-xs md:text-sm">Disponível</p>
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div className="relative lg:absolute lg:right-0 lg:bottom-0 lg:w-1/2">
          <img 
            src={heroBanner} 
            alt="Veículo motorizado vermelho" 
            className="w-full max-w-lg mx-auto lg:max-w-none move-anim"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
