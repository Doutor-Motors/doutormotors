import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Plug, 
  Bluetooth, 
  Wifi, 
  Smartphone, 
  ArrowRight, 
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
  Cable,
  Monitor,
  Calendar,
  Globe,
  ShieldCheck,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Download,
  Play,
  CircleDot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const HowDiagnosticWorksPage = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Guia Completo para Iniciantes
            </Badge>
            <h1 className="font-chakra text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-4">
              Como o Diagnóstico Funciona?
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Entenda passo a passo como diagnosticar seu carro, mesmo que ele seja antigo 
              e não tenha Bluetooth ou WiFi. É mais simples do que você imagina!
            </p>
          </motion.div>

          {/* Important Clarification */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="p-4 bg-green-500/20 rounded-full">
                    <Lightbulb className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-chakra text-xl font-bold text-green-400 uppercase mb-2">
                      🎯 O Segredo: Seu Carro NÃO Precisa de Bluetooth ou WiFi!
                    </h2>
                    <p className="text-foreground">
                      Muita gente acha que o carro precisa ter Bluetooth ou WiFi. <strong className="text-green-300">Isso NÃO é verdade!</strong>
                    </p>
                    <p className="text-foreground/80 mt-2">
                      Quem tem o Bluetooth/WiFi é o <strong className="text-foreground">adaptador OBD2</strong> que você compra separadamente. 
                      Ele é como um "tradutor" que conecta seu carro ao celular. Seu carro só precisa ter a 
                      <strong className="text-foreground"> porta OBD2</strong> (obrigatória desde 1996 nos EUA e 2001 no Brasil/Europa).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visual Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Como Funciona: Visão Geral
                </CardTitle>
                <CardDescription>
                  O diagnóstico acontece em 3 etapas simples
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-center">
                  {/* Step 1: Car */}
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                      <Car className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-foreground">Seu Carro</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tem a porta OBD2 escondida embaixo do painel
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex justify-center">
                    <div className="flex flex-col items-center">
                      <Cable className="w-6 h-6 text-muted-foreground mb-1" />
                      <ArrowRight className="w-8 h-8 text-primary" />
                      <span className="text-xs text-muted-foreground mt-1">Plugue</span>
                    </div>
                  </div>
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowDown className="w-8 h-8 text-primary" />
                  </div>

                  {/* Step 2: Adapter */}
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-3 relative">
                      <Plug className="w-10 h-10 text-amber-400" />
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Bluetooth className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground">Adaptador OBD2</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      O "tradutor" com Bluetooth/WiFi
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex justify-center">
                    <div className="flex flex-col items-center">
                      <Wifi className="w-6 h-6 text-muted-foreground mb-1" />
                      <ArrowRight className="w-8 h-8 text-primary" />
                      <span className="text-xs text-muted-foreground mt-1">Sem fio</span>
                    </div>
                  </div>
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowDown className="w-8 h-8 text-primary" />
                  </div>

                  {/* Step 3: Phone */}
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                      <Smartphone className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-foreground">Seu Celular</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mostra os problemas em português
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Resumindo:</strong> O adaptador OBD2 é plugado no carro, 
                    lê os dados do computador do veículo, e envia para seu celular via Bluetooth ou WiFi. 
                    Você só precisa de: <strong className="text-primary">1 adaptador</strong> + <strong className="text-primary">1 celular</strong> + <strong className="text-primary">nosso app</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step-by-Step Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="font-chakra text-2xl font-bold uppercase mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-primary" />
              Passo a Passo Completo
            </h2>

            <div className="space-y-4">
              {/* Step 1 */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-chakra text-lg font-bold uppercase text-blue-400 mb-2">
                        Encontre a Porta OBD2 do Seu Carro
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Todo carro fabricado a partir de 1996 (EUA) ou 2001 (Brasil/Europa) possui uma porta OBD2. 
                        É uma tomada de 16 pinos, geralmente localizada:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm">
                          <CircleDot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Embaixo do volante</strong> (local mais comum, olhe para cima)</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CircleDot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Embaixo do painel central</strong> (alguns carros asiáticos)</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CircleDot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Ao lado do freio de mão</strong> (alguns modelos)</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CircleDot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Embaixo do porta-luvas</strong> (carros europeus antigos)</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <p className="text-sm text-foreground">
                          💡 <strong className="text-blue-300">Dica:</strong> Se não encontrar, procure no Google: "porta OBD2 [marca] [modelo] [ano]"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-chakra text-lg font-bold uppercase text-amber-400 mb-2">
                        Compre um Adaptador OBD2
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        O adaptador é um aparelhinho pequeno que você compra uma vez e usa para sempre. 
                        Existem dois tipos principais:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Bluetooth className="w-5 h-5 text-blue-300" />
                            <h4 className="font-bold text-blue-300">Bluetooth</h4>
                          </div>
                          <p className="text-sm text-foreground/80">
                            Mais barato (R$30-80). Funciona bem com Android. 
                            No iPhone, só funciona com nosso app nativo.
                          </p>
                        </div>
                        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-5 h-5 text-green-300" />
                            <h4 className="font-bold text-green-300">WiFi</h4>
                          </div>
                          <p className="text-sm text-foreground/80">
                            Um pouco mais caro (R$50-150). Funciona perfeitamente 
                            com iPhone e Android usando nosso app nativo.
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
                        <p className="text-sm text-foreground">
                          <strong className="text-amber-300">Marcas recomendadas:</strong> ELM327 v2.1 ou superior, OBDLink, Veepeak, V-Link, BAFX.
                          <br />
                          <span className="text-foreground/70">⚠️ Evite adaptadores muito baratos (menos de R$25) pois podem ter firmware defeituoso.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-chakra text-lg font-bold uppercase text-green-400 mb-2">
                        Plugue o Adaptador no Carro
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Com o carro desligado, encaixe o adaptador na porta OBD2 que você encontrou. 
                        O encaixe é firme - não precisa forçar muito, mas deve ficar bem preso.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>O adaptador vai acender uma luz (geralmente vermelha ou verde)</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Ligue a ignição do carro (posição ACC ou ON) - não precisa ligar o motor</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>A luz do adaptador pode piscar, indicando que está pronto</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                        <p className="text-sm text-foreground">
                          ✅ <strong className="text-green-300">Pronto!</strong> O adaptador agora está lendo os dados do computador do seu carro.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-chakra text-lg font-bold uppercase text-purple-400 mb-2">
                        Conecte o Celular ao Adaptador
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Agora você vai fazer seu celular "conversar" com o adaptador:
                      </p>
                      
                      <Accordion type="single" collapsible className="mb-4">
                        <AccordionItem value="bluetooth" className="border rounded-lg mb-2 overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-blue-500/10">
                            <div className="flex items-center gap-2">
                              <Bluetooth className="w-5 h-5 text-blue-400" />
                              <span className="font-bold">Se seu adaptador é Bluetooth</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <ol className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                                <span>Vá nas <strong>Configurações</strong> do celular → <strong>Bluetooth</strong></span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                                <span>Procure um dispositivo chamado "OBD2", "ELM327", "V-LINK" ou similar</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                                <span>Toque para parear. Se pedir senha, use: <strong>1234</strong> ou <strong>0000</strong></span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                                <span>Pronto! Agora abra nosso app e vá para <strong>Diagnóstico</strong></span>
                              </li>
                            </ol>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="wifi" className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-green-500/10">
                            <div className="flex items-center gap-2">
                              <Wifi className="w-5 h-5 text-green-400" />
                              <span className="font-bold">Se seu adaptador é WiFi</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <ol className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                                <span>Vá nas <strong>Configurações</strong> do celular → <strong>WiFi</strong></span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                                <span>Procure uma rede chamada "CLKDevices", "OBDLink", "V-LINK" ou similar</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                                <span>Conecte à rede. Senha comum: <strong>12345678</strong> (ou veja no manual)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                                <span>⚠️ Sua internet vai parar - é normal! A rede do adaptador é local.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">5</span>
                                <span>Abra nosso <strong>app nativo</strong> e vá para Diagnóstico → WiFi Nativo</span>
                              </li>
                            </ol>
                            <div className="mt-3 p-2 bg-amber-500/20 rounded border border-amber-500/30 text-xs text-foreground">
                              <span className="text-amber-300">⚠️</span> WiFi só funciona no app nativo! No navegador, só modo demonstração.
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      5
                    </div>
                    <div className="flex-1">
                      <h3 className="font-chakra text-lg font-bold uppercase text-primary mb-2">
                        Leia os Problemas do Carro
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Com o celular conectado ao adaptador, nosso app vai:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Enviar comandos para o computador do carro</p>
                            <p className="text-xs text-muted-foreground">Pedindo os códigos de erro armazenados</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Traduzir os códigos técnicos</p>
                            <p className="text-xs text-muted-foreground">Ex: "P0171" vira "Mistura de ar/combustível muito pobre"</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Mostrar a gravidade de cada problema</p>
                            <p className="text-xs text-muted-foreground">🔴 Crítico | 🟡 Atenção | 🟢 Preventivo</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Sugerir soluções possíveis</p>
                            <p className="text-xs text-muted-foreground">Com vídeos, tutoriais e estimativa de custo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Compatibility Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Meu Carro é Compatível?
                </CardTitle>
                <CardDescription>
                  A grande maioria dos carros fabricados nos últimos 25 anos é compatível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <h4 className="font-bold text-green-400 mb-2">🇺🇸 EUA</h4>
                    <p className="text-2xl font-bold text-foreground">1996+</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Obrigatório em todos os carros à gasolina
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                    <h4 className="font-bold text-blue-400 mb-2">🇧🇷 Brasil</h4>
                    <p className="text-2xl font-bold text-foreground">2010+</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Obrigatório (alguns modelos desde 2007)
                    </p>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                    <h4 className="font-bold text-purple-400 mb-2">🇪🇺 Europa</h4>
                    <p className="text-2xl font-bold text-foreground">2001+</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gasolina 2001+ / Diesel 2004+
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    E se meu carro for mais antigo?
                  </h4>
                  <p className="text-sm text-foreground/80">
                    Carros fabricados antes dessas datas podem ter portas de diagnóstico diferentes 
                    (OBD-I) que não são compatíveis com adaptadores ELM327 padrão. Nesses casos, 
                    você precisaria de um scanner específico para a marca do seu veículo, 
                    ou levar a uma oficina especializada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Dúvidas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="q1" className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-left">
                      Posso deixar o adaptador sempre plugado no carro?
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      <strong className="text-foreground">Não recomendamos.</strong> O adaptador consome energia da bateria mesmo com o carro desligado. 
                      Se deixar por vários dias, pode drenar a bateria. Plugue apenas quando for usar.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q2" className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-left">
                      O diagnóstico pode danificar meu carro?
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      <strong className="text-foreground">Não!</strong> O diagnóstico apenas <em>lê</em> informações do computador do carro. 
                      Não altera nenhuma configuração. É como olhar o painel de instrumentos - só visualiza, não mexe em nada.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q3" className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-left">
                      Preciso de internet para fazer o diagnóstico?
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      <strong className="text-foreground">Para ler os códigos, não.</strong> A comunicação entre o celular e o adaptador é direta (Bluetooth ou WiFi local). 
                      Mas para ver as explicações detalhadas, soluções e vídeos, você precisa de internet.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q4" className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-left">
                      Funciona em carros a diesel?
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      <strong className="text-foreground">Sim!</strong> Carros a diesel fabricados a partir de 2004 (Europa) ou 2007 (Brasil) 
                      geralmente têm porta OBD2 compatível. Pickups e caminhões podem ter protocolos diferentes.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q5" className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-left">
                      Posso usar no notebook/computador?
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      <strong className="text-foreground">Sim!</strong> Se seu notebook tiver Bluetooth, você pode usar pelo navegador Chrome ou Edge. 
                      Para WiFi, precisa do app nativo (só celular). No computador, Bluetooth funciona melhor.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q6" className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-left">
                      E se meu carro não mostrar nenhum erro?
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      <strong className="text-foreground">Ótimo!</strong> Significa que o computador do carro não detectou nenhum problema. 
                      Mas lembre-se: alguns problemas mecânicos (freios, suspensão, pneus) não são detectados eletronicamente.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gradient-to-r from-primary/20 to-blue-600/20 border-primary/30">
              <CardContent className="p-8 text-center">
                <h2 className="font-chakra text-2xl font-bold uppercase mb-4">
                  Pronto para Diagnosticar seu Carro?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Agora que você entende como funciona, é hora de testar! 
                  Se ainda não tem um adaptador, comece pelo modo demonstração para conhecer o sistema.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="font-chakra uppercase">
                    <Link to="/dashboard/diagnostic">
                      <Zap className="w-5 h-5 mr-2" />
                      Ir para Diagnóstico
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-chakra uppercase">
                    <Link to="/native-app-guide">
                      <Download className="w-5 h-5 mr-2" />
                      Baixar App Nativo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowDiagnosticWorksPage;
