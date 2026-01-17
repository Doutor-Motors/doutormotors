import aboutBanner from "@/assets/images/about-banner.png";
import textBarsLight from "@/assets/images/text-bars-light.png";

const stats = [
  { value: "500+", label: "Códigos DTC" },
  { value: "50+", label: "Marcas Suportadas" },
  { value: "100%", label: "Em Português" },
  { value: "24/7", label: "Disponível" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-dm-space text-primary-foreground">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <figure className="relative">
          <img 
            src={aboutBanner} 
            alt="Equipamentos de diagnóstico automotivo" 
            className="w-full max-w-lg mx-auto rounded-lg"
          />
        </figure>

        {/* Content */}
        <div className="text-center lg:text-left">
          <p className="flex items-center justify-center lg:justify-start gap-2 font-chakra text-sm uppercase text-primary-foreground mb-3">
            <img src={textBarsLight} alt="" className="w-7 h-4" />
            Sobre Nós
          </p>
          
          <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-primary-foreground mb-6">
            Comprometidos com a Transparência
          </h2>
          
          <p className="text-dm-cadet mb-4 leading-relaxed">
            O Doutor Motors nasceu da frustração de não entender o que está acontecendo 
            com o próprio carro. Transformamos dados técnicos complexos em informações 
            claras e acionáveis.
          </p>
          
          <p className="text-dm-cadet mb-8 leading-relaxed">
            Nossa missão é democratizar o conhecimento automotivo, dando poder ao 
            proprietário do veículo para tomar decisões informadas sobre manutenção 
            e reparos.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-dm-blue-2 p-6 rounded-lg hover:bg-primary hover:-translate-y-2 transition-all cursor-pointer text-center"
              >
                <span className="font-chakra text-2xl md:text-3xl font-bold block mb-1">
                  {stat.value}
                </span>
                <span className="text-sm text-dm-cadet">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
