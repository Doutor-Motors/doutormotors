import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Car, Shield, Database, AlertTriangle, Settings, Wrench } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQPage = () => {
  const faqCategories = [
    {
      title: "Sobre a Plataforma",
      icon: HelpCircle,
      questions: [
        {
          question: "O que é o DiagnosticoMaster?",
          answer: "O DiagnosticoMaster é uma plataforma informativa e educativa que ajuda você a entender os códigos de erro (DTC) do seu veículo. Conectamos informações técnicas a linguagem acessível, ajudando você a tomar decisões conscientes sobre a manutenção do seu carro."
        },
        {
          question: "A plataforma substitui um mecânico profissional?",
          answer: "Não. O DiagnosticoMaster é uma ferramenta educativa que fornece informações para ajudá-lo a entender o que está acontecendo com seu veículo. Para reparos e diagnósticos definitivos, sempre recomendamos consultar um profissional qualificado."
        },
        {
          question: "Preciso pagar para usar a plataforma?",
          answer: "Oferecemos um plano básico com funcionalidades essenciais. Para recursos avançados como histórico completo, múltiplos veículos e conteúdo premium, oferecemos planos pagos. Consulte nossa página de preços para mais detalhes."
        },
        {
          question: "Como faço para criar uma conta?",
          answer: "Clique em 'Cadastrar' no canto superior direito da página. Preencha seus dados e confirme seu email. Após a confirmação, você terá acesso ao painel de diagnósticos."
        }
      ]
    },
    {
      title: "Diagnóstico Automotivo",
      icon: Car,
      questions: [
        {
          question: "O que são códigos DTC?",
          answer: "DTC significa 'Diagnostic Trouble Code' (Código de Problema de Diagnóstico). São códigos padronizados que o computador do seu veículo gera quando detecta uma falha. Exemplo: P0300 indica falhas de ignição aleatórias em múltiplos cilindros."
        },
        {
          question: "Como leio os códigos do meu veículo?",
          answer: "Você precisa de um scanner OBD-II, que se conecta à porta de diagnóstico do seu veículo (geralmente localizada sob o painel do motorista). Existem scanners Bluetooth que se conectam ao seu smartphone."
        },
        {
          question: "Por que a luz de 'Check Engine' acendeu?",
          answer: "A luz de verificação do motor indica que o sistema de diagnóstico do veículo detectou uma falha. Pode ser algo simples como tampa do tanque mal fechada, ou algo mais sério. Recomendamos fazer uma leitura dos códigos para entender a causa."
        },
        {
          question: "O que significam as cores de prioridade?",
          answer: "🔴 Crítico: Problema que afeta a segurança ou pode causar danos graves. Procure um profissional imediatamente. 🟡 Atenção: Problema que precisa de atenção em breve, mas não é emergencial. 🟢 Preventivo: Manutenção preventiva ou ajuste menor."
        },
        {
          question: "Posso dirigir com a luz de Check Engine acesa?",
          answer: "Depende da situação. Se a luz estiver piscando, evite dirigir e procure um mecânico imediatamente. Se estiver fixa e o carro funciona normalmente, você pode dirigir com cautela até um profissional avaliar, mas não ignore o problema."
        }
      ]
    },
    {
      title: "Segurança e Auto-Reparo",
      icon: Shield,
      questions: [
        {
          question: "É seguro fazer reparos eu mesmo?",
          answer: "Alguns reparos simples podem ser feitos em casa, como troca de filtros de ar ou lâmpadas. Porém, reparos em sistemas críticos (freios, direção, suspensão, airbags) devem SEMPRE ser realizados por profissionais qualificados."
        },
        {
          question: "Quais sistemas são considerados críticos?",
          answer: "São considerados críticos e NÃO recomendamos auto-reparo: freios, direção, suspensão, airbags, cintos de segurança, sistema de combustível e componentes do motor que afetam a dirigibilidade."
        },
        {
          question: "Por que alguns códigos mostram 'Procure um profissional'?",
          answer: "Quando identificamos que um problema está relacionado a um sistema crítico de segurança, bloqueamos sugestões de 'faça você mesmo' para proteger você e seu veículo. Nesses casos, apenas um profissional deve realizar o reparo."
        },
        {
          question: "A plataforma me ensina a fazer reparos?",
          answer: "Não. O DiagnosticoMaster é informativo e educativo. Fornecemos links para conteúdo externo de fontes confiáveis, mas não criamos tutoriais de reparo próprios. Isso é intencional para sua segurança."
        }
      ]
    },
    {
      title: "Privacidade e Dados (LGPD)",
      icon: Database,
      questions: [
        {
          question: "Quais dados vocês coletam?",
          answer: "Coletamos apenas os dados necessários para o funcionamento da plataforma: informações de cadastro (nome, email), dados dos veículos que você registra e histórico de diagnósticos. Não vendemos seus dados."
        },
        {
          question: "Como posso excluir meus dados?",
          answer: "Você pode solicitar a exclusão completa dos seus dados a qualquer momento através do seu perfil, na seção 'Privacidade e Dados'. A exclusão é total e irreversível, conforme a LGPD."
        },
        {
          question: "Vocês compartilham meus dados com terceiros?",
          answer: "Não vendemos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Utilizamos apenas serviços essenciais de infraestrutura (como hospedagem) que seguem rigorosos padrões de segurança."
        },
        {
          question: "Por quanto tempo vocês mantêm meus dados?",
          answer: "Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, todos os dados são removidos em até 30 dias. Alguns dados podem ser mantidos por obrigações legais."
        },
        {
          question: "Como exerço meus direitos sob a LGPD?",
          answer: "Você pode: (1) Acessar seus dados no perfil; (2) Corrigir informações incorretas; (3) Solicitar exclusão completa; (4) Entrar em contato conosco para quaisquer outras solicitações sobre seus dados."
        }
      ]
    },
    {
      title: "Problemas Comuns",
      icon: AlertTriangle,
      questions: [
        {
          question: "Não consigo fazer login na minha conta",
          answer: "Verifique se está usando o email correto. Se esqueceu a senha, use a opção 'Esqueci minha senha'. Se o problema persistir, verifique se confirmou seu email de cadastro."
        },
        {
          question: "O scanner não conecta ao meu veículo",
          answer: "Verifique se: (1) O veículo é de 1996 ou mais novo; (2) A chave está na posição de ignição; (3) O Bluetooth está ativado no celular; (4) O scanner está firmemente conectado à porta OBD-II."
        },
        {
          question: "O código do meu veículo não aparece na plataforma",
          answer: "Nossa base de dados cobre a maioria dos códigos padrão OBD-II. Alguns códigos específicos de fabricantes podem não estar disponíveis. Entre em contato conosco para solicitar a inclusão."
        },
        {
          question: "Como faço para adicionar mais de um veículo?",
          answer: "Acesse 'Meus Veículos' no painel de controle e clique em 'Adicionar Veículo'. Dependendo do seu plano, pode haver limite de veículos cadastrados."
        }
      ]
    },
    {
      title: "Configurações e Conta",
      icon: Settings,
      questions: [
        {
          question: "Como altero minha senha?",
          answer: "Acesse seu Perfil, vá até a aba 'Alterar Senha', preencha a nova senha e confirme. Você receberá uma confirmação por email."
        },
        {
          question: "Como excluo minha conta?",
          answer: "Acesse seu Perfil, vá até a aba 'Privacidade e Dados' e clique em 'Solicitar Exclusão de Dados'. Esta ação é irreversível e removerá todos os seus dados da plataforma."
        },
        {
          question: "Posso exportar meus dados?",
          answer: "Sim. Você pode solicitar uma cópia dos seus dados através do seu perfil ou entrando em contato conosco. Forneceremos um arquivo com todas as informações associadas à sua conta."
        },
        {
          question: "Como entro em contato com o suporte?",
          answer: "Você pode entrar em contato através da nossa página de Contato, ou enviar um email diretamente para suporte@diagnosticomaster.com.br."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-32">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background pt-8 pb-16">
          <div className="container mx-auto px-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Página Inicial
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-chakra text-3xl md:text-4xl font-bold text-foreground">
                  Perguntas Frequentes
                </h1>
                <p className="text-muted-foreground">
                  Tire suas dúvidas sobre diagnóstico automotivo e a plataforma
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8">
              {faqCategories.map((category, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="font-chakra flex items-center gap-3">
                      <category.icon className="w-6 h-6 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                          <AccordionTrigger className="text-left font-medium hover:text-primary">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact CTA */}
            <Card className="mt-12 bg-primary/5 border-primary/20">
              <CardContent className="py-8 text-center">
                <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-chakra text-xl font-bold mb-2">
                  Não encontrou o que procurava?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Entre em contato conosco. Estamos aqui para ajudar!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/contato"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-chakra uppercase hover:bg-primary/90 transition-colors"
                  >
                    Fale Conosco
                  </Link>
                  <Link
                    to="/termos"
                    className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg font-chakra uppercase hover:bg-primary/10 transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
