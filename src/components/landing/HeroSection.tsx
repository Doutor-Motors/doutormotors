import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/images/hero-banner.png";
import heroBg from "@/assets/images/hero-bg.jpg";
import textBarsLight from "@/assets/images/text-bars-light.png";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-[140px] pb-12 md:pb-20 overflow-hidden text-center lg:text-left"
      style={{ 
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      
      <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-6 md:gap-10 items-center">
        {/* Content */}
        <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
          <p className="flex items-center justify-center lg:justify-start gap-2 font-chakra text-sm uppercase text-primary-foreground mb-3">
            <img src={textBarsLight} alt="" className="w-7 h-4" />
            O médico digital do seu carro
          </p>
          
          <h1 className="font-chakra text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-3 md:mb-4">
            Diagnóstico Automotivo Inteligente
          </h1>
          
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
            Conecte seu OBD2, entenda os problemas do seu carro em linguagem simples, 
            descubra a urgência e saiba se pode resolver sozinho.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <Link to="/signup">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center justify-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-6 sm:px-8 text-sm sm:text-base"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link to="/#how-it-works">
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-dm-blue-1 text-dm-blue-1 hover:bg-dm-blue-1 hover:text-white font-chakra uppercase rounded-pill px-6 sm:px-8 text-sm sm:text-base"
              >
                Como Funciona
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-dm-blue-3">
            <div className="text-center lg:text-left">
              <span className="font-chakra text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">500+</span>
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">Códigos Suportados</p>
            </div>
            <div className="text-center lg:text-left">
              <span className="font-chakra text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">100%</span>
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">Em Português</p>
            </div>
            <div className="text-center lg:text-left">
              <span className="font-chakra text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">24/7</span>
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">Disponível</p>
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
