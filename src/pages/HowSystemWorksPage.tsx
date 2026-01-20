import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/ui/back-button";
import { 
  Car, 
  Cpu, 
  Smartphone, 
  Wifi, 
  Bluetooth, 
  Brain, 
  FileText, 
  Wrench,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Shield,
  Clock,
  Target,
  Sparkles,
  Database,
  Globe,
  Languages,
  Search,
  List,
  ThumbsUp
} from "lucide-react";
import { Link } from "react-router-dom";

const HowSystemWorksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-28">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-4 text-primary-foreground/80 hover:text-primary-foreground" />
          <div className="text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground">
              <Brain className="h-3 w-3 mr-1" />
              Tecnologia Inteligente
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Como o Sistema Traduz os Dados do Seu Carro?
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto">
              Entenda passo a passo como transformamos códigos técnicos em 
              explicações simples que qualquer pessoa pode entender
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Introdução Visual - A Jornada do Dado */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              A Jornada do Dado: Do Carro até Você
            </CardTitle>
            <CardDescription className="text-base">
              Veja como a informação viaja do motor do seu carro até a tela do seu celular
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Fluxo Visual Principal */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center py-6">
              {/* Etapa 1 - Carro */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                  <Car className="h-10 w-10 text-blue-600" />
                </div>
                <h4 className="font-semibold text-sm">1. Seu Carro</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  O computador do carro detecta um problema
                </p>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto hidden md:block" />
              <ArrowDown className="h-6 w-6 text-muted-foreground mx-auto md:hidden" />

              {/* Etapa 2 - Adaptador */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
                  <Cpu className="h-10 w-10 text-orange-600" />
                </div>
                <h4 className="font-semibold text-sm">2. Adaptador OBD2</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Lê os códigos do carro e envia sem fio
                </p>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto hidden md:block" />
              <ArrowDown className="h-6 w-6 text-muted-foreground mx-auto md:hidden" />

              {/* Etapa 3 - App */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                  <Smartphone className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="font-semibold text-sm">3. Nosso App</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Recebe os dados e processa
                </p>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto hidden md:block" />
              <ArrowDown className="h-6 w-6 text-muted-foreground mx-auto md:hidden" />

              {/* Etapa 4 - IA */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
                <h4 className="font-semibold text-sm">4. Inteligência Artificial</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Traduz para linguagem simples
                </p>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto hidden md:block" />
              <ArrowDown className="h-6 w-6 text-muted-foreground mx-auto md:hidden" />

              {/* Etapa 5 - Você */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                  <ThumbsUp className="h-10 w-10 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-sm">5. Você Entende!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Explicação clara + solução
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETAPA 1: O Computador do Carro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  O Computador do Seu Carro
                </CardTitle>
                <CardDescription>
                  Entenda o que acontece dentro do motor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Você Sabia?
              </h4>
              <p className="text-muted-foreground">
                Seu carro moderno tem um <strong>computador de bordo</strong> chamado <strong>ECU</strong> 
                (Unidade de Controle do Motor). Ele monitora <strong>tudo</strong> que acontece no veículo: 
                motor, combustível, emissões, transmissão, freios ABS, airbags e muito mais!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  O Que o Computador Monitora:
                </h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>Sensores de oxigênio</strong> - verifica a queima do combustível</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>Temperatura do motor</strong> - evita superaquecimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>Rotação do motor (RPM)</strong> - controla a aceleração</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>Velocidade do veículo</strong> - para o velocímetro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>Posição do acelerador</strong> - quanto você está pisando</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Quando Detecta um Problema:
                </h5>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>O sensor identifica algo anormal</li>
                  <li>O computador gera um <strong>código de erro</strong> (DTC)</li>
                  <li>Acende a <strong>luz de alerta</strong> no painel</li>
                  <li>O código fica <strong>gravado na memória</strong> do carro</li>
                  <li>Fica lá até alguém <strong>ler e apagar</strong></li>
                </ol>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h5 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <MessageSquare className="h-4 w-4" />
                Exemplo Prático:
              </h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Imagine que o sensor de oxigênio detecta que a mistura de ar e combustível está errada. 
                O computador do carro anota: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">P0171</code>. 
                Esse código fica gravado, esperando ser lido. É como se o carro escrevesse um "bilhete" 
                contando o problema!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ETAPA 2: O Adaptador OBD2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <span className="font-bold text-orange-600">2</span>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  O Adaptador OBD2 - O "Tradutor" do Carro
                </CardTitle>
                <CardDescription>
                  Como ele lê os dados e envia para o celular
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                O Que é o Adaptador OBD2?
              </h4>
              <p className="text-muted-foreground">
                É um pequeno aparelho que você <strong>plugar na porta OBD2</strong> do seu carro (embaixo do volante). 
                Ele funciona como um <strong>tradutor</strong>: lê os dados do computador do carro e envia 
                para seu celular via <strong>Bluetooth ou WiFi</strong>.
              </p>
            </div>

            <h4 className="font-semibold text-lg">Como o Adaptador Funciona - Passo a Passo:</h4>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-600">A</span>
                </div>
                <div>
                  <h5 className="font-semibold">Conexão Física</h5>
                  <p className="text-sm text-muted-foreground">
                    Você plugou o adaptador na porta OBD2. Nesse momento, ele recebe energia 
                    diretamente da bateria do carro e "acorda".
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-600">B</span>
                </div>
                <div>
                  <h5 className="font-semibold">Handshake com o Carro</h5>
                  <p className="text-sm text-muted-foreground">
                    O adaptador "se apresenta" ao computador do carro. É como um aperto de mãos digital. 
                    Ele diz: "Olá, sou um leitor autorizado, pode me passar os dados?"
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-600">C</span>
                </div>
                <div>
                  <h5 className="font-semibold">Leitura dos Códigos</h5>
                  <p className="text-sm text-muted-foreground">
                    O adaptador envia comandos padronizados (protocolo ELM327) pedindo: 
                    "Me dê a lista de códigos de erro" ou "Qual a temperatura do motor agora?"
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-600">D</span>
                </div>
                <div>
                  <h5 className="font-semibold">Transmissão Sem Fio</h5>
                  <p className="text-sm text-muted-foreground">
                    Os dados são enviados pelo ar (Bluetooth ou WiFi) para o seu celular. 
                    É instantâneo, como enviar uma mensagem!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Bluetooth className="h-4 w-4" />
                  Adaptador Bluetooth
                </h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Alcance: ~10 metros</li>
                  <li>• Pareia com o celular</li>
                  <li>• Melhor para Android</li>
                  <li>• Conexão mais estável</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-purple-800 dark:text-purple-200">
                  <Wifi className="h-4 w-4" />
                  Adaptador WiFi
                </h5>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Cria rede própria</li>
                  <li>• Funciona com iOS</li>
                  <li>• Conexão direta</li>
                  <li>• Velocidade maior</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETAPA 3: O App Recebe os Dados */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="font-bold text-green-600">3</span>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Nosso App Recebe e Processa os Dados
                </CardTitle>
                <CardDescription>
                  O que acontece quando os dados chegam no celular
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-800 dark:text-green-200">
                <Zap className="h-5 w-5" />
                O Que o App Faz em Milissegundos:
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Assim que os dados chegam, nosso app executa uma série de operações super rápidas 
                para transformar códigos confusos em informações úteis para você.
              </p>
            </div>

            <h4 className="font-semibold text-lg">Processamento dos Dados:</h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold">1. Recebimento</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  O app recebe os dados brutos do adaptador. São códigos como: 
                  <code className="bg-muted px-1 rounded text-xs">41 05 7B</code>
                </p>
                <div className="bg-muted rounded p-2 text-xs font-mono">
                  Dado bruto: "41 05 7B 41 0C 1A F8..."
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold">2. Decodificação</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  O app sabe que "41 05" significa "temperatura do líquido de arrefecimento" 
                  e "7B" (em hexadecimal) = 123 - 40 = <strong>83°C</strong>
                </p>
                <div className="bg-muted rounded p-2 text-xs">
                  "41 05 7B" → Temperatura: 83°C ✓
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold">3. Identificação de Erros</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Se o carro tem códigos de erro (DTC), o app identifica cada um. 
                  Exemplo: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded text-red-600">P0171</code>
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 rounded p-2 text-xs">
                  Erro encontrado: P0171 - Sistema muito pobre
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold">4. Classificação de Prioridade</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  O app analisa a gravidade de cada problema e classifica:
                </p>
                <div className="space-y-1">
                  <Badge variant="destructive" className="text-xs">🔴 Crítico - Pare o carro!</Badge>
                  <Badge className="text-xs bg-yellow-500">🟡 Atenção - Agende reparo</Badge>
                  <Badge variant="secondary" className="text-xs">🟢 Preventivo - Monitore</Badge>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Tudo Isso em Menos de 1 Segundo!
              </h5>
              <p className="text-sm text-muted-foreground">
                Todo esse processamento acontece instantaneamente. Você clica em "Diagnosticar" 
                e em poucos segundos já vê os resultados na tela.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ETAPA 4: A Inteligência Artificial */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="font-bold text-purple-600">4</span>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  A Mágica da Inteligência Artificial
                </CardTitle>
                <CardDescription>
                  Como transformamos códigos técnicos em explicações que você entende
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                O Diferencial do Nosso Sistema
              </h4>
              <p className="text-muted-foreground">
                Outros apps mostram apenas o código de erro. <strong>Nós usamos Inteligência Artificial</strong> 
                para explicar o problema como se um mecânico experiente estivesse conversando com você!
              </p>
            </div>

            <h4 className="font-semibold text-lg">Como a IA Traduz os Códigos:</h4>

            {/* Exemplo Visual de Transformação */}
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-2">Exemplo Real</Badge>
                <h5 className="font-semibold">Código: P0171</h5>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Antes - Código Técnico */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h6 className="font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    ❌ O Que Outros Apps Mostram:
                  </h6>
                  <div className="bg-red-100 dark:bg-red-900/40 rounded p-3 font-mono text-sm">
                    <p className="text-red-800 dark:text-red-200">P0171</p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      "System Too Lean (Bank 1)"
                    </p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">
                    "E agora? O que isso significa? O que eu faço?"
                  </p>
                </div>

                {/* Depois - Nossa IA */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h6 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    ✅ O Que Nosso Sistema Mostra:
                  </h6>
                  <div className="bg-green-100 dark:bg-green-900/40 rounded p-3 text-sm space-y-2">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      🔧 Mistura Ar/Combustível Pobre
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">
                      O motor está recebendo ar demais ou combustível de menos. 
                      Isso pode causar falhas, consumo alto e perda de potência.
                    </p>
                    <div className="border-t border-green-300 dark:border-green-700 pt-2 mt-2">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-200">Possíveis causas:</p>
                      <ul className="text-xs text-green-700 dark:text-green-300 mt-1">
                        <li>• Vazamento de ar na admissão</li>
                        <li>• Sensor de oxigênio com defeito</li>
                        <li>• Bomba de combustível fraca</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-lg mt-6">O Que a IA Analisa:</h4>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h5 className="font-semibold text-sm">Contexto do Veículo</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Considera a marca, modelo e ano do seu carro para explicações específicas
                </p>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h5 className="font-semibold text-sm">Base de Conhecimento</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Milhares de casos reais e manuais técnicos para dar respostas precisas
                </p>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                  <Languages className="h-6 w-6 text-purple-600" />
                </div>
                <h5 className="font-semibold text-sm">Linguagem Simples</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Traduz termos técnicos para português claro que qualquer pessoa entende
                </p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h5 className="font-semibold mb-2 flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Brain className="h-4 w-4" />
                A IA Também Fornece:
              </h5>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-purple-700 dark:text-purple-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Nível de urgência do problema</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Lista de possíveis causas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Se você pode resolver sozinho</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Estimativa de dificuldade do reparo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Riscos de continuar dirigindo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Guia passo a passo de solução</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETAPA 5: O Resultado Final */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <span className="font-bold text-emerald-600">5</span>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-emerald-600" />
                  O Resultado: Você Entende Tudo!
                </CardTitle>
                <CardDescription>
                  O que você recebe no final do diagnóstico
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Relatório Completo e Fácil de Entender
              </h4>
              <p className="text-muted-foreground">
                No final, você recebe um relatório visual com tudo que precisa saber, 
                organizado de forma clara e com ações sugeridas.
              </p>
            </div>

            <h4 className="font-semibold text-lg">O Que Você Vê na Tela:</h4>

            <div className="border-2 rounded-lg overflow-hidden">
              {/* Simulação de Tela de Resultado */}
              <div className="bg-muted p-3 border-b flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground ml-2">Resultado do Diagnóstico</span>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Resumo */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">1</p>
                    <p className="text-xs text-red-700 dark:text-red-300">Crítico</p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">2</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Atenção</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">1</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Preventivo</p>
                  </div>
                </div>

                {/* Item de Exemplo */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="destructive" className="mb-2">Crítico</Badge>
                      <h5 className="font-semibold text-sm">P0171 - Mistura Ar/Combustível Pobre</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        O motor está recebendo ar demais. Pode causar falhas e consumo alto.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Ver Solução
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Wrench className="h-3 w-3 mr-1" />
                      Agendar Reparo
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Para Cada Problema Você Vê:
                </h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Nome do problema em português simples</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Explicação do que está acontecendo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Nível de urgência (cores: 🔴🟡🟢)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Lista de possíveis causas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Se você pode resolver em casa</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Ações Disponíveis:
                </h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Guia passo a passo de solução</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Vídeos tutoriais relacionados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Salvar histórico do diagnóstico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Gerar relatório em PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Compartilhar com mecânico</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Resumo: Como Tudo Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <p className="font-semibold">O carro detecta um problema</p>
                    <p className="text-sm text-muted-foreground">O computador de bordo gera um código de erro</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <p className="font-semibold">O adaptador OBD2 lê os códigos</p>
                    <p className="text-sm text-muted-foreground">Transmite via Bluetooth/WiFi para o celular</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <p className="font-semibold">Nosso app processa os dados</p>
                    <p className="text-sm text-muted-foreground">Decodifica e classifica por prioridade</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-bold">4</div>
                  <div>
                    <p className="font-semibold">A IA traduz para português simples</p>
                    <p className="text-sm text-muted-foreground">Explica o problema e sugere soluções</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-bold">5</div>
                  <div>
                    <p className="font-semibold">Você entende tudo!</p>
                    <p className="text-sm text-muted-foreground">E sabe exatamente o que fazer</p>
                  </div>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <Card className="border-2 border-primary">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Pronto para Diagnosticar Seu Carro?</h3>
            <p className="text-muted-foreground mb-4">
              Agora que você entende como funciona, experimente na prática!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/dashboard/diagnostico">
                  <Car className="h-5 w-5 mr-2" />
                  Fazer Diagnóstico
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

export default HowSystemWorksPage;
