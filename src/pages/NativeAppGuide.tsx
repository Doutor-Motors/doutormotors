import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Download,
  Bluetooth,
  Wifi,
  CheckCircle2,
  ChevronRight,
  Apple,
  PlayCircle,
  Settings,
  Zap,
  Shield,
  Battery,
  Signal,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/ui/back-button';

const NativeAppGuide = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const features = [
    {
      icon: Zap,
      title: 'Performance Superior',
      description: 'Conexão nativa mais rápida e estável com adaptadores OBD2',
    },
    {
      icon: Bluetooth,
      title: 'Bluetooth Nativo',
      description: 'Acesso direto ao hardware Bluetooth do dispositivo',
    },
    {
      icon: Wifi,
      title: 'TCP Nativo',
      description: 'Comunicação direta via socket TCP com adaptadores WiFi',
    },
    {
      icon: Battery,
      title: 'Menor Consumo',
      description: 'Otimizado para economia de bateria durante diagnósticos',
    },
    {
      icon: Signal,
      title: 'Conexão Estável',
      description: 'Menos desconexões e maior confiabilidade na leitura',
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Dados processados localmente no dispositivo',
    },
  ];

  const requirements = {
    android: [
      'Android 7.0 (Nougat) ou superior',
      'Bluetooth 4.0+ ou WiFi',
      '50MB de espaço livre',
      'Permissões de Bluetooth e Localização',
    ],
    ios: [
      'iOS 13 ou superior',
      'iPhone 6s ou mais recente',
      'Bluetooth 4.0+',
      '50MB de espaço livre',
    ],
  };

  const setupSteps = [
    {
      step: 1,
      title: 'Baixe o App',
      description: 'Instale o Doutor Motors da Play Store ou App Store',
    },
    {
      step: 2,
      title: 'Conecte o Adaptador',
      description: 'Plugue o ELM327 na porta OBD2 do veículo (embaixo do volante)',
    },
    {
      step: 3,
      title: 'Ligue a Ignição',
      description: 'Gire a chave para a posição de ignição (não precisa ligar o motor)',
    },
    {
      step: 4,
      title: 'Pareie o Adaptador',
      description: 'No Bluetooth do celular, pareie com o adaptador (código: 1234)',
    },
    {
      step: 5,
      title: 'Abra o App',
      description: 'Inicie o Doutor Motors e vá para Diagnóstico',
    },
    {
      step: 6,
      title: 'Conecte e Diagnostique',
      description: 'Selecione "Nativo" e clique em conectar para iniciar',
    },
  ];

  const adaptersRecommended = [
    { name: 'OBDLink MX+', type: 'Bluetooth', rating: 5, price: 'R$ 350-450' },
    { name: 'Veepeak OBDCheck', type: 'Bluetooth', rating: 4, price: 'R$ 80-120' },
    { name: 'V-Link Bluetooth', type: 'Bluetooth', rating: 4, price: 'R$ 60-100' },
    { name: 'ELM327 WiFi', type: 'WiFi', rating: 3, price: 'R$ 40-80' },
    { name: 'Carista OBD2', type: 'Bluetooth', rating: 5, price: 'R$ 200-300' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-purple-600">App Nativo</Badge>
            <h1 className="font-chakra text-4xl md:text-5xl font-bold uppercase text-foreground mb-6">
              Doutor Motors
              <span className="text-primary block">App Móvel Nativo</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Experimente o diagnóstico OBD2 com performance máxima usando nosso app nativo 
              para Android e iOS com conexão direta ao hardware do dispositivo.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                <PlayCircle className="w-5 h-5" />
                Google Play
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button size="lg" className="bg-gray-800 hover:bg-gray-900 gap-2">
                <Apple className="w-5 h-5" />
                App Store
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-chakra text-2xl font-bold uppercase text-center mb-8">
            Vantagens do App Nativo
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-chakra font-bold uppercase mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-chakra text-2xl font-bold uppercase text-center mb-8">
            Requisitos do Sistema
          </h2>
          <Tabs defaultValue="android" className="max-w-2xl mx-auto">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="android" className="gap-2">
                <PlayCircle className="w-4 h-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios" className="gap-2">
                <Apple className="w-4 h-4" />
                iOS
              </TabsTrigger>
            </TabsList>
            <TabsContent value="android">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {requirements.android.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ios">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {requirements.ios.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Setup Steps */}
        <section className="container mx-auto px-4 py-12 bg-muted/30">
          <h2 className="font-chakra text-2xl font-bold uppercase text-center mb-8">
            Como Configurar
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {setupSteps.map((step, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-chakra font-bold uppercase">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Adapters */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-chakra text-2xl font-bold uppercase text-center mb-8">
            Adaptadores Recomendados
          </h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {adaptersRecommended.map((adapter, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {adapter.type === 'Bluetooth' ? (
                          <Bluetooth className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Wifi className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{adapter.name}</p>
                          <p className="text-xs text-muted-foreground">{adapter.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < adapter.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{adapter.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Developer Section */}
        <section className="container mx-auto px-4 py-12 bg-muted/30">
          <h2 className="font-chakra text-2xl font-bold uppercase text-center mb-8">
            Para Desenvolvedores
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="clone" className="border rounded-lg px-4">
                <AccordionTrigger className="font-chakra uppercase">
                  1. Clonar e Configurar
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="bg-dm-space rounded-lg p-4 font-mono text-sm text-white relative">
                      <code>
                        git clone https://github.com/seu-usuario/doutor-motors.git{'\n'}
                        cd doutor-motors{'\n'}
                        npm install
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 text-white hover:bg-white/10"
                        onClick={() => copyToClipboard('git clone https://github.com/seu-usuario/doutor-motors.git && cd doutor-motors && npm install', 'clone')}
                      >
                        {copiedCommand === 'clone' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plugins" className="border rounded-lg px-4">
                <AccordionTrigger className="font-chakra uppercase">
                  2. Instalar Plugins Nativos
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-dm-space rounded-lg p-4 font-mono text-sm text-white relative">
                    <code>
                      npm install @nicklason/capacitor-bluetooth-serial{'\n'}
                      npm install capacitor-tcp-socket
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-white/10"
                      onClick={() => copyToClipboard('npm install @nicklason/capacitor-bluetooth-serial capacitor-tcp-socket', 'plugins')}
                    >
                      {copiedCommand === 'plugins' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="build" className="border rounded-lg px-4">
                <AccordionTrigger className="font-chakra uppercase">
                  3. Build e Executar
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-dm-space rounded-lg p-4 font-mono text-sm text-white relative">
                    <code>
                      npm run build{'\n'}
                      npx cap add android{'\n'}
                      npx cap sync{'\n'}
                      npx cap run android
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-white/10"
                      onClick={() => copyToClipboard('npm run build && npx cap add android && npx cap sync && npx cap run android', 'build')}
                    >
                      {copiedCommand === 'build' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Consulte o guia completo de build no repositório:
              </p>
              <Button variant="outline" asChild>
                <a href="/CAPACITOR_BUILD_GUIDE.md" target="_blank" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Ver Guia Completo (Markdown)
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12 text-center">
          <Card className="bg-gradient-to-br from-primary to-dm-blue-3 border-0 text-white">
            <CardContent className="py-12">
              <Smartphone className="w-16 h-16 mx-auto mb-6" />
              <h2 className="font-chakra text-2xl font-bold uppercase mb-4">
                Pronto para Começar?
              </h2>
              <p className="mb-6 opacity-90 max-w-md mx-auto">
                Baixe o app agora e tenha acesso ao diagnóstico veicular mais avançado na palma da sua mão.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/dashboard/diagnostics">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Usar no Navegador
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NativeAppGuide;
