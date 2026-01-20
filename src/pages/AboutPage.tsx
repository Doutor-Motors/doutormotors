import { Link } from "react-router-dom";
import { ArrowRight, Users, Target, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroBg from "@/assets/images/hero-bg.jpg";
import aboutBanner from "@/assets/images/about-banner.png";
import textBarsLight from "@/assets/images/text-bars-light.png";
import textBarsDark from "@/assets/images/text-bars-dark.png";
import work1 from "@/assets/images/work-1.jpg";
import work2 from "@/assets/images/work-2.jpg";
import work3 from "@/assets/images/work-3.jpg";

const stats = [
  { value: "500+", label: "Códigos DTC" },
  { value: "50+", label: "Marcas Suportadas" },
  { value: "100%", label: "Em Português" },
  { value: "24/7", label: "Disponível" },
];

const values = [
  {
    icon: Users,
    title: "Foco no Cliente",
    description: "Colocamos as necessidades dos motoristas em primeiro lugar, simplificando informações complexas.",
  },
  {
    icon: Target,
    title: "Precisão",
    description: "Utilizamos dados técnicos precisos para fornecer diagnósticos confiáveis e acionáveis.",
  },
  {
    icon: Heart,
    title: "Transparência",
    description: "Acreditamos que todo motorista tem direito a entender o que está acontecendo com seu veículo.",
  },
  {
    icon: Award,
    title: "Excelência",
    description: "Buscamos constantemente melhorar nossa plataforma e base de conhecimento.",
  },
];

const team = [
  {
    image: work1,
    name: "Time de Engenharia",
    role: "Desenvolvimento & Inovação",
  },
  {
    image: work2,
    name: "Time Automotivo",
    role: "Especialistas em Diagnóstico",
  },
  {
    image: work3,
    name: "Time de Suporte",
    role: "Atendimento ao Cliente",
  },
];

const AboutPage = () => {
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
            Sobre Nós
          </p>
          
          <h1 className="font-chakra text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-3 md:mb-4 fade-in-up">
            Conheça o Doutor Motors
          </h1>
          
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto fade-in-up">
            Somos apaixonados por democratizar o conhecimento automotivo, 
            transformando dados técnicos em informações claras e acionáveis.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-dm-space text-primary-foreground">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <figure className="relative">
            <img 
              src={aboutBanner} 
              alt="Equipamentos de diagnóstico automotivo" 
              className="w-full max-w-lg mx-auto rounded-lg move-anim"
            />
          </figure>

          <div className="text-center lg:text-left">
            <p className="flex items-center justify-center lg:justify-start gap-2 font-chakra text-sm uppercase text-primary-foreground mb-3">
              <img src={textBarsLight} alt="" className="w-7 h-4" />
              Nossa Missão
            </p>
            
            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-primary-foreground mb-6">
              Comprometidos com a Transparência
            </h2>
            
            <p className="text-white/90 mb-4 leading-relaxed">
              O Doutor Motors nasceu da frustração de não entender o que está acontecendo 
              com o próprio carro. Transformamos dados técnicos complexos em informações 
              claras e acionáveis.
            </p>
            
            <p className="text-white/90 mb-8 leading-relaxed">
              Nossa missão é democratizar o conhecimento automotivo, dando poder ao 
              proprietário do veículo para tomar decisões informadas sobre manutenção 
              e reparos.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-dm-blue-2 p-6 rounded-lg hover:bg-primary hover:-translate-y-2 transition-all cursor-pointer text-center"
                >
                  <span className="font-chakra text-2xl md:text-3xl font-bold block mb-1">
                    {stat.value}
                  </span>
                  <span className="text-sm text-white/80">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
              <img src={textBarsDark} alt="" className="w-7 h-4" />
              Nossos Valores
            </p>
            
            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground">
              O Que Nos Guia
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-chakra text-lg font-semibold uppercase text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
              <img src={textBarsDark} alt="" className="w-7 h-4" />
              Nossa Equipe
            </p>
            
            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground">
              Quem Está Por Trás
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div 
                key={index}
                className="w-full"
              >
                <div className="relative group h-full">
                  <figure className="aspect-[4/5] overflow-hidden rounded-lg">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </figure>
                  
                  <div className="bg-card shadow-lg p-5 mx-3 -mt-14 relative text-center rounded-lg">
                    <h3 className="font-chakra text-base font-semibold uppercase text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
            Faça Parte da Nossa Comunidade
          </h2>
          
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Junte-se a milhares de motoristas que já entenderam que conhecimento é poder. 
            Comece a usar o Doutor Motors gratuitamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Começar Agora</span>
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

export default AboutPage;
