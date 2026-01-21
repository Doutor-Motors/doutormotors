import { Link } from "react-router-dom";
import { ArrowRight, Bluetooth, Scan, FileText, Wrench, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroBg from "@/assets/images/hero-bg.jpg";
import work1 from "@/assets/images/work-1.jpg";
import work2 from "@/assets/images/work-2.jpg";
import work3 from "@/assets/images/work-3.jpg";
import services5 from "@/assets/images/services-5.png";
import textBarsLight from "@/assets/images/text-bars-light.png";
import textBarsDark from "@/assets/images/text-bars-dark.png";

const steps = [
  {
    image: work1,
    step: "Passo 1",
    title: "Conecte o OBD2",
    description: "Plugue o adaptador OBD2 no seu veículo e conecte via Bluetooth ou Wi-Fi.",
    icon: Bluetooth,
    details: [
      "Localize a porta OBD2 (geralmente embaixo do volante)",
      "Conecte o adaptador na porta",
      "Ligue a ignição do veículo",
      "Pareie via Bluetooth ou Wi-Fi",
    ],
  },
  {
    image: work2,
    step: "Passo 2",
    title: "Execute o Diagnóstico",
    description: "O sistema lê todos os códigos de falha e sensores do seu veículo.",
    icon: Scan,
    details: [
      "Clique em 'Iniciar Diagnóstico'",
      "Aguarde a leitura completa",
      "Veja os dados em tempo real",
      "Análise automática dos códigos",
    ],
  },
  {
    image: work3,
    step: "Passo 3",
    title: "Receba o Relatório",
    description: "Veja os problemas organizados por prioridade com explicações simples.",
    icon: FileText,
    details: [
      "Relatório em linguagem simples",
      "Priorização por urgência",
      "Custos estimados de reparo",
      "Recomendações de ação",
    ],
  },
];

const faqs = [
  {
    question: "Preciso de um adaptador OBD2?",
    answer: "Sim, você precisará de um adaptador OBD2 compatível com Bluetooth ou Wi-Fi. Recomendamos adaptadores que suportam o protocolo ELM327. Você pode encontrar opções a partir de R$50.",
  },
  {
    question: "Meu carro é compatível?",
    answer: "O Doutor Motors é compatível com todos os veículos fabricados a partir de 1996 que possuem porta OBD2. Isso inclui a grande maioria dos carros de passeio vendidos no Brasil.",
  },
  {
    question: "O diagnóstico substitui o mecânico?",
    answer: "O Doutor Motors é uma ferramenta de apoio que ajuda você a entender os problemas do seu veículo. Para reparos complexos, sempre recomendamos consultar um profissional.",
  },
  {
    question: "Posso usar em vários carros?",
    answer: "Sim! Com o plano Pro, você pode cadastrar até 5 veículos e alternar entre eles facilmente. O plano básico permite 1 veículo.",
  },
];

const HowItWorksPage = () => {
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
            Como Funciona
          </p>
          
          <h1 className="font-chakra text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-3 md:mb-4 fade-in-up">
            Diagnóstico em 3 Passos Simples
          </h1>
          
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto fade-in-up">
            Entenda como o Doutor Motors transforma dados técnicos complexos 
            em informações claras e acionáveis.
          </p>
        </div>
      </section>

      {/* Steps Detail Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center mb-20 last:mb-0 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <figure className="relative group">
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="w-full rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-primary w-20 h-20 rounded-lg flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                </figure>
              </div>

              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <p className="font-chakra text-sm uppercase text-primary font-bold mb-2">
                  {step.step}
                </p>
                <h2 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground mb-4">
                  {step.title}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-3 text-foreground">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Car Image Section */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <img 
            src={services5} 
            alt="Carro vermelho" 
            className="w-full max-w-md mx-auto move-anim"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
              <img src={textBarsDark} alt="" className="w-7 h-4" />
              Perguntas Frequentes
            </p>
            
            <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground">
              Dúvidas Comuns
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="font-chakra text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
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
            Pronto para Experimentar?
          </h2>
          
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Crie sua conta e faça seu primeiro diagnóstico em menos de 5 minutos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Comece Agora</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/servicos">
              <Button 
                size="lg"
                variant="outline"
                className="border-dm-blue-1 text-dm-blue-1 hover:bg-dm-blue-1 hover:text-white font-chakra uppercase rounded-pill px-8"
              >
                Ver Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
