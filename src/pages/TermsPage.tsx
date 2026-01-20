import { Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, FileText, Scale, Users, Car, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermsPage = () => {
  const lastUpdated = "15 de Janeiro de 2025";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mt-8 mb-4 text-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-chakra text-3xl md:text-4xl font-bold uppercase text-foreground">
                  Termos de Uso
                </h1>
                <p className="text-muted-foreground">Última atualização: {lastUpdated}</p>
              </div>
            </div>
          </div>

          {/* Aviso Importante */}
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                    Aviso Importante
                  </h3>
                  <p className="text-orange-700 dark:text-orange-400">
                    O <strong>Doutor Motors</strong> é uma plataforma <strong>informativa e educativa</strong>. 
                    Não somos uma oficina mecânica, não prestamos serviços de reparo automotivo e não fornecemos 
                    instruções diretas para reparos. Todas as informações são de caráter educativo para ajudá-lo 
                    a entender melhor seu veículo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo dos Termos */}
          <div className="space-y-8">
            {/* 1. Aceitação dos Termos */}
            <Card id="aceitacao">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  1. Aceitação dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Ao acessar e utilizar a plataforma Doutor Motors, você concorda expressamente com estes 
                  Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar 
                  nossos serviços.
                </p>
                <p>
                  O uso contínuo da plataforma após alterações nos termos constitui aceitação das 
                  modificações. Recomendamos revisar periodicamente esta página.
                </p>
              </CardContent>
            </Card>

            {/* 2. Natureza do Serviço */}
            <Card id="natureza">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  2. Natureza do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>2.1. Plataforma Informativa:</strong></p>
                <ul>
                  <li>O Doutor Motors é uma plataforma de diagnóstico automotivo <strong>informativo e educativo</strong>.</li>
                  <li>Realizamos a leitura de códigos de diagnóstico (DTCs) através de dispositivos OBD2.</li>
                  <li>Fornecemos informações educativas sobre os problemas identificados.</li>
                  <li>Indicamos o nível de risco e complexidade de cada problema.</li>
                </ul>

                <p><strong>2.2. O que NÃO fazemos:</strong></p>
                <ul>
                  <li>Não somos uma oficina mecânica.</li>
                  <li>Não prestamos serviços de reparo automotivo.</li>
                  <li>Não fornecemos instruções passo a passo para reparos.</li>
                  <li>Não vendemos peças ou serviços mecânicos.</li>
                  <li>Não oferecemos orçamentos de reparo.</li>
                </ul>

                <p><strong>2.3. Links Externos:</strong></p>
                <p>
                  Quando disponibilizamos links para tutoriais ou guias externos (como CarCareKiosk, YouTube, etc.), 
                  estes são de propriedade e responsabilidade de seus respectivos criadores. Não temos controle 
                  sobre o conteúdo desses sites e não nos responsabilizamos por informações neles contidas.
                </p>
              </CardContent>
            </Card>

            {/* 3. Isenção de Responsabilidade */}
            <Card id="isencao" className="border-red-200 dark:border-red-800 scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  3. Isenção de Responsabilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>3.1. Sem Garantia de Precisão:</strong></p>
                <p>
                  As informações fornecidas pela plataforma são baseadas em bancos de dados de diagnóstico 
                  automotivo e inteligência artificial. Não garantimos a precisão, completude ou aplicabilidade 
                  das informações para seu veículo específico.
                </p>

                <p><strong>3.2. Responsabilidade do Usuário:</strong></p>
                <ul>
                  <li>Qualquer ação tomada com base nas informações da plataforma é de inteira responsabilidade do usuário.</li>
                  <li>Reparos realizados por você ou por terceiros são de sua exclusiva responsabilidade.</li>
                  <li>Recomendamos sempre consultar um mecânico profissional qualificado.</li>
                </ul>

                <p><strong>3.3. Exclusão de Responsabilidade:</strong></p>
                <p>
                  O Doutor Motors e seus desenvolvedores não se responsabilizam por quaisquer danos diretos, 
                  indiretos, incidentais, consequenciais ou punitivos resultantes de:
                </p>
                <ul>
                  <li>Uso ou incapacidade de uso da plataforma.</li>
                  <li>Erros ou imprecisões nas informações fornecidas.</li>
                  <li>Reparos realizados com base em informações da plataforma.</li>
                  <li>Danos ao veículo, lesões pessoais ou danos materiais.</li>
                  <li>Perda de dados ou interrupção de negócios.</li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Sistemas Críticos de Segurança */}
            <Card id="seguranca" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Shield className="w-5 h-5" />
                  4. Sistemas Críticos de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Problemas relacionados aos seguintes sistemas devem <strong>SEMPRE</strong> ser avaliados 
                  e reparados exclusivamente por profissionais qualificados:
                </p>
                <ul className="text-red-700 dark:text-red-400">
                  <li><strong>Sistema de Freios:</strong> ABS, freio de estacionamento, discos, pastilhas, fluido.</li>
                  <li><strong>Sistema de Direção:</strong> Direção hidráulica, elétrica, componentes da direção.</li>
                  <li><strong>Sistema de Suspensão:</strong> Amortecedores, molas, braços, buchas.</li>
                  <li><strong>Sistema de Airbag:</strong> Módulos, sensores, cintos de segurança.</li>
                  <li><strong>Sistema de Combustível:</strong> Injeção, bomba de combustível, linhas de pressão.</li>
                </ul>
                <p className="font-semibold text-red-700 dark:text-red-400">
                  ⚠️ Nunca tente reparar esses sistemas por conta própria. Reparos inadequados podem 
                  resultar em acidentes graves, lesões ou morte.
                </p>
              </CardContent>
            </Card>

            {/* 5. Cadastro e Conta */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  5. Cadastro e Conta de Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>5.1. Requisitos:</strong></p>
                <ul>
                  <li>Você deve ter pelo menos 18 anos para criar uma conta.</li>
                  <li>As informações fornecidas devem ser verdadeiras e atualizadas.</li>
                  <li>Você é responsável por manter a confidencialidade da sua senha.</li>
                </ul>

                <p><strong>5.2. Uso da Conta:</strong></p>
                <ul>
                  <li>Cada conta é pessoal e intransferível.</li>
                  <li>Você é responsável por todas as atividades realizadas com sua conta.</li>
                  <li>Notifique-nos imediatamente sobre qualquer uso não autorizado.</li>
                </ul>
              </CardContent>
            </Card>

            {/* 6. Propriedade Intelectual */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  6. Propriedade Intelectual
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones, imagens, 
                  código-fonte e software, são propriedade do Doutor Motors ou de seus licenciadores 
                  e são protegidos por leis de direitos autorais.
                </p>
                <p>
                  É proibida a reprodução, distribuição, modificação ou uso comercial do conteúdo 
                  sem autorização prévia por escrito.
                </p>
              </CardContent>
            </Card>

            {/* 7. Modificações */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  7. Modificações nos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                  Alterações significativas serão notificadas através da plataforma ou por e-mail. 
                  O uso continuado da plataforma após alterações constitui aceitação dos novos termos.
                </p>
              </CardContent>
            </Card>

            {/* 8. Lei Aplicável */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  8. Lei Aplicável e Foro
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                  Qualquer disputa decorrente destes termos será resolvida no foro da comarca de 
                  São Paulo, Estado de São Paulo.
                </p>
              </CardContent>
            </Card>

            {/* 9. Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  9. Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Para dúvidas sobre estes Termos de Uso, entre em contato conosco:
                </p>
                <ul>
                  <li><strong>E-mail:</strong> contato@doutormotors.com</li>
                  <li><strong>Página de Contato:</strong> <Link to="/contato" className="text-primary hover:underline">www.doutormotors.com/contato</Link></li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          {/* Footer do documento */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Ao utilizar a plataforma Doutor Motors, você declara ter lido, compreendido e 
              concordado com estes Termos de Uso.
            </p>
            <p className="mt-2">
              <Link to="/privacidade" className="text-primary hover:underline">
                Ver também: Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
