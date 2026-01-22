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
    title: "Foco no motorista",
    description: "Tudo começa pela necessidade real de quem está dirigindo. Informação clara vem antes de qualquer coisa.",
  },
  {
    icon: Target,
    title: "Precisão técnica",
    description: "Usamos bases técnicas confiáveis e validações constantes para entregar diagnósticos consistentes.",
  },
  {
    icon: Heart,
    title: "Transparência",
    description: "Você tem o direito de entender o que seu carro está informando sem surpresas ou termos confusos.",
  },
  {
    icon: Award,
    title: "Segurança em primeiro lugar",
    description: "Nunca incentivamos consertos inseguros. Sempre indicamos quando o correto é procurar um profissional.",
  },
];

const team = [
  {
    image: work1,
    name: "Time de Engenharia",
    role: "Desenvolvimento do sistema, dados e inteligência aplicada.",
  },
  {
    image: work2,
    name: "Time Automotivo",
    role: "Especialistas em diagnóstico, leitura de falhas e interpretação técnica.",
  },
  {
    image: work3,
    name: "Time de Suporte",
    role: "Pessoas prontas para ajudar você a entender melhor seu veículo e o sistema.",
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
            O Doutor Motors existe para que você nunca mais fique no escuro sobre seu carro.
          </h1>

          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto fade-in-up">
            Somos movidos pela ideia de que todo motorista merece entender o que está acontecendo com o próprio veículo sem depender da sorte, da boa vontade de terceiros ou de linguagem técnica confusa.

            Transformamos dados automotivos complexos em informações claras, acessíveis e seguras para o dia a dia.
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
              Transparência, clareza e responsabilidade
            </h2>

            <p className="text-white/90 mb-4 leading-relaxed">
              O Doutor Motors nasceu de uma frustração real: a sensação de não saber se um problema no carro é simples, grave ou se você pode estar sendo enganado.


              Nossa missão é democratizar o conhecimento automotivo, traduzindo códigos técnicos em explicações simples, indicando riscos, urgência e o melhor caminho a seguir, seja resolver sozinho ou procurar um profissional qualificado.
            </p>

            <p className="text-white/90 mb-8 leading-relaxed">
              Nosso compromisso é com a informação correta e a segurança do motorista, sempre.
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
              O que guia cada decisão do Doutor Motors
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
              Pessoas reais por trás da tecnologia
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
            Milhares de motoristas já entenderam que conhecimento é poder, economia, segurança e tranquilidade também.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Começar Diagnóstico</span>
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
