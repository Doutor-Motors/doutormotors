import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import textBarsDark from "@/assets/images/text-bars-dark.png";

// Pool of testimonial data to randomly select from
const testimonialPool = [
  {
    name: "Carlos Silva",
    role: "Proprietário de Honda Civic",
    rating: 5,
    text: "Salvou meu bolso! A luz do motor acendeu e o mecânico queria cobrar R$400 só pra ver o que era. Com o CarDoc, descobri que era só o sensor de oxigênio e resolvi sozinho seguindo o guia.",
  },
  {
    name: "Marina Santos",
    role: "Motorista de Fiat Argo",
    rating: 5,
    text: "Finalmente entendo o que acontece com meu carro! Antes ficava perdida quando o mecânico falava códigos técnicos. Agora sei exatamente o que precisa de atenção urgente e o que pode esperar.",
  },
  {
    name: "Roberto Almeida",
    role: "Dono de oficina mecânica",
    rating: 5,
    text: "Recomendo pros meus clientes! É uma ferramenta séria que ajuda as pessoas a entenderem seus carros. Meus clientes chegam mais informados e a comunicação fica muito mais fácil.",
  },
  {
    name: "Fernanda Costa",
    role: "Motorista de Volkswagen Polo",
    rating: 5,
    text: "Economizei mais de R$800 em diagnósticos! O app me mostrou exatamente qual era o problema e o mecânico confirmou. Agora não vou mais às cegas para a oficina.",
  },
  {
    name: "João Pedro Mendes",
    role: "Entusiasta automotivo",
    rating: 5,
    text: "Como alguém que gosta de fazer manutenção própria, esse app é perfeito. Me ajuda a identificar problemas rapidamente e dá soluções passo a passo que posso seguir.",
  },
  {
    name: "Luciana Ferreira",
    role: "Motorista de Toyota Corolla",
    rating: 5,
    text: "Minha luz do motor acendia sempre e eu morria de medo. Agora sei que a maioria eram alertas simples. O app me dá tranquilidade e conhecimento sobre meu carro.",
  },
  {
    name: "Ricardo Oliveira",
    role: "Motorista de Chevrolet Onix",
    rating: 5,
    text: "Incrível como algo tão simples pode fazer tanta diferença. Conectei o OBD2, escaneei e em segundos tinha todas as informações que precisava. Super recomendo!",
  },
  {
    name: "Patrícia Nascimento",
    role: "Motorista de Hyundai HB20",
    rating: 5,
    text: "Estava com medo de ser enganada na oficina. Agora chego sabendo exatamente o que meu carro tem. A explicação em português simples faz toda a diferença!",
  },
  {
    name: "André Souza",
    role: "Motorista de Renault Sandero",
    rating: 5,
    text: "Melhor investimento que fiz pro meu carro depois do seguro. O app já me economizou muito dinheiro mostrando problemas que eu mesmo pude resolver.",
  },
];

// Function to shuffle and pick random testimonials
const getRandomTestimonials = () => {
  const shuffled = [...testimonialPool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  const timestamp = Date.now();
  
  return selected.map((testimonial, index) => ({
    id: index + 1,
    ...testimonial,
    // Use thispersondoesnotexist.com with unique timestamp for each image
    image: `https://thispersondoesnotexist.com/?t=${timestamp}-${index}-${Math.random()}`,
  }));
};

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Generate random testimonials on component mount
  const testimonials = useMemo(() => getRandomTestimonials(), []);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-dm-blue-4/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
            <img src={textBarsDark} alt="" className="w-7 h-4" />
            Depoimentos
          </p>
          <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-foreground">
            O Que Nossos Usuários Dizem
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-card/80 hover:bg-card shadow-lg rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-card/80 hover:bg-card shadow-lg rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div 
                    className={`bg-card rounded-2xl p-8 md:p-10 shadow-xl transition-all duration-500 ${
                      index === activeIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
                    }`}
                  >
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Quote className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-scale-in"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-foreground text-lg md:text-xl text-center leading-relaxed mb-8 italic">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-chakra font-bold text-foreground text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          {[
            { value: "1.500+", label: "Usuários Ativos" },
            { value: "4.8", label: "Avaliação Média" },
            { value: "98%", label: "Satisfação" },
            { value: "24h", label: "Suporte" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-4 rounded-lg bg-card/50 hover:bg-card transition-colors"
            >
              <span className="font-chakra text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </span>
              <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
