import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/ui/back-button";
import { 
  Smartphone, 
  Laptop, 
  Tablet,
  Globe,
  Wifi,
  Car,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Home,
  MapPin,
  Building2,
  Plane,
  Clock,
  Shield,
  Zap,
  Cloud,
  HelpCircle,
  ArrowRight,
  Download,
  Monitor,
  Chrome,
  Apple,
  Bluetooth,
  WifiIcon,
  Signal,
  Moon,
  Sun,
  Users,
  Wrench,
  MessageSquare,
  Star,
  ThumbsUp,
  PartyPopper
} from "lucide-react";
import { Link } from "react-router-dom";

const UseFromAnywherePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-32 sm:pt-36 md:pt-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-4 text-primary-foreground/80 hover:text-primary-foreground" />
          <div className="text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground">
              <Globe className="h-3 w-3 mr-1" />
              Acesso Global
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Use de Qualquer Lugar do Mundo! 🌍
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto">
              Sim! Você pode diagnosticar seu carro da sua casa, do trabalho, 
              ou de qualquer lugar - usando seu celular, tablet ou notebook!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Confirmação Inicial - SIM, FUNCIONA! */}
        <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shrink-0">
                <PartyPopper className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                  SIM! Funciona de Qualquer Lugar! ✅
                </h2>
                <p className="text-green-600 dark:text-green-400">
                  Você pode estar na sua casa, no trabalho, na garagem, em outra cidade, 
                  ou até em outro país - <strong>nosso sistema funciona onde você estiver</strong>, 
                  desde que tenha internet e esteja perto do seu carro com o adaptador conectado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* O Que Você Precisa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              O Que Você Precisa Para Usar o Sistema
            </CardTitle>
            <CardDescription>
              Apenas 3 coisas simples - você provavelmente já tem quase tudo!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Item 1 - Dispositivo */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <Badge className="mb-2">Item 1</Badge>
                <h3 className="font-bold text-lg mb-2">Um Dispositivo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Celular, tablet ou notebook - qualquer um serve!
                </p>
                <div className="flex justify-center gap-2">
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <Smartphone className="h-3 w-3" /> Celular
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <Tablet className="h-3 w-3" /> Tablet
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <Laptop className="h-3 w-3" /> Notebook
                  </div>
                </div>
              </div>

              {/* Item 2 - Internet */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Wifi className="h-8 w-8 text-green-600" />
                </div>
                <Badge className="mb-2">Item 2</Badge>
                <h3 className="font-bold text-lg mb-2">Conexão com Internet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  WiFi ou dados móveis (3G, 4G, 5G) - qualquer um!
                </p>
                <div className="flex justify-center gap-2">
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <WifiIcon className="h-3 w-3" /> WiFi
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <Signal className="h-3 w-3" /> 4G/5G
                  </div>
                </div>
              </div>

              {/* Item 3 - Adaptador OBD2 */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                  <Cpu className="h-8 w-8 text-orange-600" />
                </div>
                <Badge className="mb-2">Item 3</Badge>
                <h3 className="font-bold text-lg mb-2">Adaptador OBD2</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O pequeno aparelho que conecta no seu carro
                </p>
                <div className="flex justify-center gap-2">
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <Bluetooth className="h-3 w-3" /> Bluetooth
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <WifiIcon className="h-3 w-3" /> WiFi
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                <Lightbulb className="h-4 w-4" />
                Importante Entender:
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                O adaptador OBD2 precisa estar <strong>plugado no seu carro</strong> e você precisa estar 
                <strong> próximo do veículo</strong> (até ~10 metros) para a conexão Bluetooth/WiFi funcionar. 
                Mas nosso <strong>app/site funciona de qualquer lugar do mundo</strong> - 
                você só precisa estar perto do carro na hora do diagnóstico!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dispositivos Compatíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              Dispositivos Compatíveis
            </CardTitle>
            <CardDescription>
              Funciona em praticamente qualquer dispositivo moderno!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Android */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Android</h4>
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Samsung, Motorola, Xiaomi...
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Bluetooth funciona 100%
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    WiFi funciona 100%
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Chrome recomendado
                  </li>
                </ul>
              </div>

              {/* iPhone */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Apple className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold">iPhone</h4>
                    <Badge variant="outline" className="text-xs">WiFi/App</Badge>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Todos os modelos
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    Bluetooth só via app nativo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    WiFi funciona no Safari
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    App nativo disponível
                  </li>
                </ul>
              </div>

              {/* Tablet */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Tablet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Tablets</h4>
                    <Badge variant="secondary" className="text-xs">Funciona</Badge>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    iPad (WiFi/App)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Samsung Tab (BT/WiFi)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Tela maior = mais conforto
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Ótimo para ver gráficos
                  </li>
                </ul>
              </div>

              {/* Notebook/PC */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Laptop className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Notebook/PC</h4>
                    <Badge variant="secondary" className="text-xs">Funciona</Badge>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Windows, Mac, Linux
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Chrome (Bluetooth)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Qualquer navegador (WiFi)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Melhor para relatórios
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* De Onde Você Pode Usar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              De Onde Você Pode Usar?
            </CardTitle>
            <CardDescription>
              Literalmente de qualquer lugar do mundo com internet!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Home className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Na Sua Casa</h4>
                  <p className="text-sm text-muted-foreground">
                    Da garagem, usando WiFi de casa. O cenário mais comum!
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Building2 className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">No Trabalho</h4>
                  <p className="text-sm text-muted-foreground">
                    No estacionamento da empresa, usando WiFi ou 4G.
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Wrench className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Na Oficina</h4>
                  <p className="text-sm text-muted-foreground">
                    Mostre o diagnóstico para o mecânico em tempo real!
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <MapPin className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Na Estrada</h4>
                  <p className="text-sm text-muted-foreground">
                    Parou no acostamento? Diagnostique ali mesmo!
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Plane className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Viajando</h4>
                  <p className="text-sm text-muted-foreground">
                    Em outra cidade ou estado? Funciona igual!
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Globe className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Outro País</h4>
                  <p className="text-sm text-muted-foreground">
                    Nosso sistema é global - funciona em qualquer lugar!
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Quando funciona */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Funciona 24 Horas por Dia
                </h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <span>Dia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Moon className="h-5 w-5 text-blue-500" />
                    <span>Noite</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span>Madrugada</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Não tem horário de funcionamento - use quando quiser!
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  Sistema na Nuvem
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nosso sistema roda na "nuvem" (servidores na internet), 
                  então você não precisa instalar nada pesado. É só acessar 
                  pelo navegador ou app e pronto!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passo a Passo - Como Usar */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Passo a Passo: Como Diagnosticar da Sua Casa
            </CardTitle>
            <CardDescription>
              Siga estes passos simples - leva menos de 5 minutos!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passo 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="w-0.5 h-full bg-primary/20 mt-2"></div>
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-lg mb-2">Plugue o Adaptador OBD2</h4>
                <p className="text-muted-foreground mb-3">
                  Encontre a porta OBD2 no seu carro (geralmente embaixo do volante) e conecte o adaptador.
                </p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    O adaptador vai ligar sozinho - você vai ver uma luzinha piscando.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="w-0.5 h-full bg-primary/20 mt-2"></div>
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-lg mb-2">Ligue a Ignição do Carro</h4>
                <p className="text-muted-foreground mb-3">
                  Gire a chave até a posição de ignição (não precisa ligar o motor). 
                  Isso "acorda" o computador do carro.
                </p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Você vai ver as luzes do painel acenderem.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="w-0.5 h-full bg-primary/20 mt-2"></div>
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-lg mb-2">Abra Nosso App/Site no Celular</h4>
                <p className="text-muted-foreground mb-3">
                  No seu celular, abra nosso aplicativo ou acesse o site pelo navegador.
                  Faça login na sua conta.
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Chrome className="h-3 w-3" /> Chrome
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Apple className="h-3 w-3" /> Safari
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Download className="h-3 w-3" /> App
                  </Badge>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="w-0.5 h-full bg-primary/20 mt-2"></div>
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-lg mb-2">Conecte ao Adaptador</h4>
                <p className="text-muted-foreground mb-3">
                  Vá em "Diagnóstico" e clique em "Conectar". Escolha Bluetooth ou WiFi 
                  conforme o seu adaptador.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-center">
                    <Bluetooth className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                    <span className="text-xs">Bluetooth</span>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                    <WifiIcon className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                    <span className="text-xs">WiFi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 5 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="w-0.5 h-full bg-primary/20 mt-2"></div>
              </div>
              <div className="pb-8">
                <h4 className="font-semibold text-lg mb-2">Clique em "Iniciar Diagnóstico"</h4>
                <p className="text-muted-foreground mb-3">
                  O sistema vai ler todos os dados do seu carro automaticamente. 
                  Aguarde alguns segundos...
                </p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Geralmente leva de 10 a 30 segundos.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 6 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-green-600">Pronto! Veja os Resultados</h4>
                <p className="text-muted-foreground mb-3">
                  O sistema mostra todos os problemas encontrados em português simples, 
                  com explicações e soluções!
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Você acabou de diagnosticar seu carro sozinho(a)!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perguntas Frequentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Preciso estar dentro do carro?
              </h4>
              <p className="text-sm text-muted-foreground">
                Não necessariamente! Você pode ficar do lado de fora, desde que esteja 
                a no máximo ~10 metros do adaptador (alcance do Bluetooth). Muita gente 
                fica sentada no banco enquanto faz o diagnóstico, mas não é obrigatório.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Funciona sem internet?
              </h4>
              <p className="text-sm text-muted-foreground">
                A conexão com o adaptador (Bluetooth/WiFi) funciona sem internet. 
                Porém, para traduzir os códigos com IA e salvar o histórico, 
                você precisa de internet. Recomendamos ter pelo menos 3G/4G.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Gasta muitos dados móveis?
              </h4>
              <p className="text-sm text-muted-foreground">
                Muito pouco! Um diagnóstico completo usa menos de 1 MB de dados. 
                Você pode fazer centenas de diagnósticos com um plano básico de celular.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Posso usar o celular de outra pessoa?
              </h4>
              <p className="text-sm text-muted-foreground">
                Sim! Basta fazer login na sua conta. Seus veículos e histórico 
                estão salvos na nuvem, então você pode acessar de qualquer dispositivo.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                É seguro deixar o adaptador sempre plugado?
              </h4>
              <p className="text-sm text-muted-foreground">
                Geralmente sim, mas alguns adaptadores consomem bateria do carro 
                quando estão conectados. Se você não for usar o carro por vários dias, 
                recomendamos desconectar o adaptador.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vantagens */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Por Que Isso é Incrível?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Sem Sair de Casa</h4>
                  <p className="text-sm text-muted-foreground">
                    Diagnostique seu carro na garagem, de pijama se quiser!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Economia de Tempo</h4>
                  <p className="text-sm text-muted-foreground">
                    Não precisa ir até uma oficina só para saber o problema.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Economia de Dinheiro</h4>
                  <p className="text-sm text-muted-foreground">
                    Evite pagar R$50-150 por cada diagnóstico em oficina.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Disponível 24/7</h4>
                  <p className="text-sm text-muted-foreground">
                    Funciona de madrugada, fim de semana, feriado...
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Histórico Salvo</h4>
                  <p className="text-sm text-muted-foreground">
                    Todos os diagnósticos ficam salvos para você consultar depois.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Compartilhe com Mecânico</h4>
                  <p className="text-sm text-muted-foreground">
                    Mande o relatório por WhatsApp ou email para sua oficina de confiança.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <Card className="border-2 border-primary">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Pronto Para Começar?</h3>
            <p className="text-muted-foreground mb-4">
              Agora que você sabe que pode usar de qualquer lugar, experimente!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/dashboard/diagnostics">
                  <Car className="h-5 w-5 mr-2" />
                  Fazer Diagnóstico Agora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/como-diagnosticar">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Como Conectar o Adaptador
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default UseFromAnywherePage;
