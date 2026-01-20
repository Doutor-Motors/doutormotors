import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Car, 
  Bluetooth, 
  Wifi, 
  Cable, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Cpu,
  Radio,
  Calendar,
  MapPin,
  HelpCircle,
  Lightbulb,
  ThumbsUp,
  Eye,
  Plug,
  Signal,
  Monitor
} from "lucide-react";

const HowDiagnosticConnectsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
                <Car className="w-4 h-4 mr-2" />
                Funciona em Qualquer Carro
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6">
                "Meu carro é antigo e não tem Bluetooth. Como vai funcionar?"
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Essa é uma das perguntas mais comuns! Vamos explicar de forma simples e clara 
                como nosso sistema consegue diagnosticar <strong>qualquer carro</strong>, 
                mesmo os mais antigos.
              </p>
              
              <Alert className="max-w-2xl mx-auto bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200 text-left">
                  <strong>A boa notícia:</strong> Não importa se seu carro é de 2000 ou 2024 - 
                  o sistema funciona da mesma forma! O Bluetooth ou WiFi está no <strong>adaptador</strong>, 
                  não no carro.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* Entendendo o Básico */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-3">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Entendendo o Básico
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                  Por que isso confunde muita gente?
                </h2>
              </div>

              <Card className="mb-8 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                      <HelpCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">A Confusão Comum</h3>
                      <p className="text-muted-foreground mb-4">
                        Muitas pessoas pensam assim:
                      </p>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <p className="italic text-muted-foreground">
                          "Meu carro é de 2005, não tem Bluetooth, não tem central multimídia, 
                          nem ar-condicionado digital... Como vou conectar algo via Bluetooth?"
                        </p>
                      </div>
                      <p className="text-muted-foreground mt-4">
                        <strong>Isso é totalmente compreensível!</strong> Quando falamos em "conectar via Bluetooth", 
                        parece que o carro precisa ter essa tecnologia. Mas não é assim que funciona...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">A Verdade Simples</h3>
                      <p className="text-muted-foreground mb-4">
                        O <strong>Bluetooth e o WiFi estão no adaptador OBD2</strong>, não no carro!
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="font-medium text-green-700 dark:text-green-300 mb-2">✓ O que o CARRO precisa ter:</p>
                          <p className="text-sm text-muted-foreground">
                            Apenas a porta OBD2 (obrigatória desde 1996/2001)
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="font-medium text-green-700 dark:text-green-300 mb-2">✓ O que o ADAPTADOR tem:</p>
                          <p className="text-sm text-muted-foreground">
                            Bluetooth ou WiFi embutido para conectar ao celular
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Como Funciona - Passo a Passo Visual */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-3">
                  <Eye className="w-4 h-4 mr-2" />
                  Visualize o Processo
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                  Como o Diagnóstico Funciona - Passo a Passo
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Vamos mostrar exatamente o que acontece, do início ao fim
                </p>
              </div>

              {/* Passo 1 */}
              <Card className="mb-8 overflow-hidden">
                <div className="bg-blue-500 text-white px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      1
                    </div>
                    <h3 className="text-xl font-bold">Seu Carro Já Tem um "Cérebro"</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-muted-foreground mb-4">
                        <strong>Todo carro moderno</strong> (fabricado a partir de 1996 nos EUA ou 2001 no Brasil) 
                        tem um computador de bordo chamado <strong>ECU</strong> (Unidade de Controle do Motor).
                      </p>
                      <p className="text-muted-foreground mb-4">
                        Esse computador monitora tudo no seu carro:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Motor e injeção de combustível</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Sensores de oxigênio e temperatura</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Sistema de freios ABS</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Transmissão e câmbio</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Airbags e sistemas de segurança</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl p-6 flex flex-col items-center justify-center">
                      <div className="relative">
                        <Car className="w-24 h-24 text-blue-600" />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-2">
                          <Cpu className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Seu carro tem um computador (ECU) que<br />
                        <strong>guarda todos os códigos de erro</strong>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Passo 2 */}
              <Card className="mb-8 overflow-hidden">
                <div className="bg-purple-500 text-white px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      2
                    </div>
                    <h3 className="text-xl font-bold">A Porta OBD2 - A "Tomada" do Carro</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-xl p-6 flex flex-col items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                        <Plug className="w-20 h-20 text-purple-600" />
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        A porta OBD2 fica geralmente<br />
                        <strong>embaixo do painel, perto do volante</strong>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-4">
                        <strong>OBD2</strong> significa "On-Board Diagnostics, versão 2" - é um padrão 
                        internacional que obriga todos os carros a terem uma porta de diagnóstico.
                      </p>
                      <Alert className="mb-4">
                        <MapPin className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Onde encontrar:</strong> Geralmente embaixo do painel do lado do motorista, 
                          perto da coluna de direção ou abaixo do volante.
                        </AlertDescription>
                      </Alert>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Desde quando existe?
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>🇺🇸 <strong>EUA:</strong> Obrigatório desde 1996</li>
                          <li>🇪🇺 <strong>Europa:</strong> Desde 2001 (gasolina) e 2003 (diesel)</li>
                          <li>🇧🇷 <strong>Brasil:</strong> Maioria dos carros desde 2001</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Passo 3 */}
              <Card className="mb-8 overflow-hidden">
                <div className="bg-orange-500 text-white px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      3
                    </div>
                    <h3 className="text-xl font-bold">O Adaptador OBD2 - O "Tradutor"</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-center font-medium text-orange-800 dark:text-orange-200">
                      🔑 <strong>AQUI ESTÁ O SEGREDO:</strong> O adaptador é quem tem o Bluetooth/WiFi, NÃO o carro!
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-2 border-dashed">
                      <CardContent className="p-4 text-center">
                        <Cable className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <h4 className="font-semibold mb-2">De um lado</h4>
                        <p className="text-sm text-muted-foreground">
                          Conecta na porta OBD2 do carro (por cabo/plug)
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-primary">
                      <CardContent className="p-4 text-center">
                        <div className="relative">
                          <Radio className="w-12 h-12 mx-auto mb-3 text-primary" />
                          <Zap className="w-4 h-4 absolute top-0 right-1/3 text-yellow-500" />
                        </div>
                        <h4 className="font-semibold mb-2">O Adaptador</h4>
                        <p className="text-sm text-muted-foreground">
                          Traduz os dados e transmite via Bluetooth ou WiFi
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-dashed">
                      <CardContent className="p-4 text-center">
                        <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <h4 className="font-semibold mb-2">Do outro lado</h4>
                        <p className="text-sm text-muted-foreground">
                          Envia os dados para seu celular/tablet/computador
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bluetooth className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">Adaptador Bluetooth</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cria uma conexão Bluetooth que seu celular Android ou computador pode encontrar. 
                        Funciona como um fone de ouvido sem fio.
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold">Adaptador WiFi</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cria uma rede WiFi própria que seu celular (Android ou iPhone) 
                        pode conectar. Funciona como um roteador portátil.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Passo 4 */}
              <Card className="mb-8 overflow-hidden">
                <div className="bg-green-500 text-white px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      4
                    </div>
                    <h3 className="text-xl font-bold">A Conexão Acontece Assim</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Car className="w-10 h-10 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Seu Carro</p>
                      <p className="text-xs text-muted-foreground">Porta OBD2</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Cable className="w-6 h-6 text-gray-400" />
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                        <Plug className="w-10 h-10 text-orange-600" />
                        <Signal className="w-4 h-4 absolute -top-1 -right-1 text-green-500" />
                      </div>
                      <p className="text-sm font-medium">Adaptador</p>
                      <p className="text-xs text-muted-foreground">Bluetooth/WiFi</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Signal className="w-6 h-6 text-green-500" />
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Smartphone className="w-10 h-10 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium">Seu Celular</p>
                      <p className="text-xs text-muted-foreground">Nosso App</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Wifi className="w-6 h-6 text-blue-500" />
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Monitor className="w-10 h-10 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">Diagnóstico</p>
                      <p className="text-xs text-muted-foreground">Resultado</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Resumindo o fluxo:</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                        <span>O computador do carro guarda os códigos de erro</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                        <span>O adaptador lê esses códigos pela porta OBD2 (conexão física por cabo)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                        <span>O adaptador transmite os dados via Bluetooth/WiFi para seu celular</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                        <span>Nosso app recebe, analisa e mostra o diagnóstico em português simples</span>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Compatibilidade */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-3">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Compatibilidade
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                  Meu carro é compatível?
                </h2>
              </div>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">✅ Seu carro é compatível se:</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Carro a gasolina ou flex</p>
                          <p className="text-sm text-muted-foreground">Fabricado a partir de 1996 (EUA) ou 2001 (Brasil)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Carro a diesel</p>
                          <p className="text-sm text-muted-foreground">Fabricado a partir de 2003</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Carros importados</p>
                          <p className="text-sm text-muted-foreground">Europeus, americanos, japoneses - todos seguem o padrão OBD2</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Carros elétricos e híbridos</p>
                          <p className="text-sm text-muted-foreground">Tesla, Prius, etc. também têm porta OBD2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Pode não ser compatível se:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Carros muito antigos</p>
                        <p className="text-sm text-muted-foreground">Fabricados antes de 1996 (podem usar OBD1 ou não ter porta)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Motos e veículos especiais</p>
                        <p className="text-sm text-muted-foreground">Motocicletas, tratores, jet-skis usam outros padrões</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Rápido */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-3">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Dúvidas Frequentes
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                  Perguntas Comuns
                </h2>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5">
                    <h4 className="font-semibold mb-2">
                      "Preciso instalar algo no carro?"
                    </h4>
                    <p className="text-muted-foreground">
                      <strong>Não!</strong> O adaptador só precisa ser plugado na porta OBD2. 
                      Não é necessário nenhuma instalação permanente, cortar fios ou modificar nada no veículo. 
                      É só conectar e pronto.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <h4 className="font-semibold mb-2">
                      "E se meu carro não tiver Bluetooth?"
                    </h4>
                    <p className="text-muted-foreground">
                      <strong>Não precisa ter!</strong> É o adaptador que tem Bluetooth, não o carro. 
                      Seu carro de 2005 sem nenhuma tecnologia moderna funciona perfeitamente, 
                      pois a comunicação é entre o adaptador (que você compra) e seu celular.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <h4 className="font-semibold mb-2">
                      "Posso deixar o adaptador sempre conectado?"
                    </h4>
                    <p className="text-muted-foreground">
                      <strong>Depende do adaptador.</strong> Alguns consomem bateria mesmo com o carro desligado. 
                      Recomendamos remover após o uso ou usar adaptadores com modo de economia de energia.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <h4 className="font-semibold mb-2">
                      "Qual adaptador devo comprar?"
                    </h4>
                    <p className="text-muted-foreground">
                      Recomendamos adaptadores <strong>ELM327</strong> - é o padrão mais comum e compatível. 
                      Você encontra em lojas de autopeças, Mercado Livre, Amazon, etc. 
                      Preços variam de R$ 30 a R$ 150 dependendo da qualidade e recursos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
                <ThumbsUp className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                  Agora você sabe como funciona!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Seu carro é compatível, o adaptador faz a "mágica" da conexão sem fio, 
                  e nosso app traduz tudo para uma linguagem simples.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="font-chakra uppercase">
                    <Link to="/dashboard/diagnostic">
                      <Zap className="w-5 h-5 mr-2" />
                      Começar Diagnóstico
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-chakra uppercase">
                    <Link to="/como-funciona-sistema">
                      <Eye className="w-5 h-5 mr-2" />
                      Ver Como o Sistema Funciona
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowDiagnosticConnectsPage;
