import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Check, 
  ChevronRight,
  Share,
  PlusSquare,
  MoreVertical,
  Wifi,
  WifiOff,
  Zap,
  Bell,
  HardDrive,
  Chrome,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Acesso Rápido',
      description: 'Abra direto da tela inicial, sem precisar do navegador'
    },
    {
      icon: WifiOff,
      title: 'Funciona Offline',
      description: 'Acesse seu histórico mesmo sem internet'
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Receba alertas de diagnósticos e manutenções'
    },
    {
      icon: HardDrive,
      title: 'Ocupa Pouco Espaço',
      description: 'Menos de 5MB no seu dispositivo'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              App Instalável
            </Badge>
            <h1 className="font-chakra text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-4">
              Instale o Doutor Motors
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tenha o diagnóstico do seu carro sempre à mão. Instale nosso app gratuitamente 
              direto no seu celular ou computador.
            </p>
          </motion.div>

          {/* Status Cards */}
          <motion.div
            className="grid sm:grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`border-2 ${isInstalled ? 'border-green-500/50 bg-green-500/10' : 'border-muted'}`}>
              <CardContent className="p-4 flex items-center gap-3">
                {isInstalled ? (
                  <>
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-400">App Instalado!</p>
                      <p className="text-sm text-muted-foreground">Você já pode usar offline</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-muted rounded-full">
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Ainda não instalado</p>
                      <p className="text-sm text-muted-foreground">Siga as instruções abaixo</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={`border-2 ${isOnline ? 'border-green-500/50 bg-green-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
              <CardContent className="p-4 flex items-center gap-3">
                {isOnline ? (
                  <>
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <Wifi className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-400">Online</p>
                      <p className="text-sm text-muted-foreground">Conexão ativa</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-amber-500/20 rounded-full">
                      <WifiOff className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-400">Offline</p>
                      <p className="text-sm text-muted-foreground">Modo offline ativo</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Install Button (if available) */}
          {deferredPrompt && !isInstalled && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-primary/20 to-red-600/20 border-primary/30">
                <CardContent className="p-6 text-center">
                  <h2 className="font-chakra text-xl font-bold uppercase mb-2">
                    Instalação Rápida Disponível!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Clique no botão abaixo para instalar instantaneamente
                  </p>
                  <Button 
                    size="lg" 
                    className="font-chakra uppercase"
                    onClick={handleInstallClick}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Instalar Agora
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Benefits */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-chakra text-xl font-bold uppercase mb-4 text-center">
              Por que instalar?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Installation Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase">
                  Como Instalar
                </CardTitle>
                <CardDescription>
                  Escolha seu dispositivo e siga o passo a passo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={deviceType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="android" className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Android
                    </TabsTrigger>
                    <TabsTrigger value="ios" className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      iPhone
                    </TabsTrigger>
                    <TabsTrigger value="desktop" className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Computador
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="android" className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Abra no Chrome</p>
                        <p className="text-sm text-muted-foreground">
                          Acesse este site usando o navegador Google Chrome
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          Toque no menu <MoreVertical className="w-4 h-4" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          No canto superior direito, toque nos três pontinhos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          Toque em "Instalar app" <Download className="w-4 h-4" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ou "Adicionar à tela inicial" em versões mais antigas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-green-400">Pronto!</p>
                        <p className="text-sm text-muted-foreground">
                          O ícone do Doutor Motors aparecerá na sua tela inicial
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ios" className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                      <p className="text-sm text-foreground">
                        <strong className="text-amber-300">⚠️ Importante:</strong> No iPhone, 
                        você precisa usar o Safari. O Chrome no iOS não suporta instalação de apps.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Abra no Safari</p>
                        <p className="text-sm text-muted-foreground">
                          Acesse este site usando o navegador Safari (nativo do iPhone)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          Toque no botão Compartilhar <Share className="w-4 h-4" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Na barra inferior, toque no ícone de compartilhar (quadrado com seta)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          Toque em "Adicionar à Tela de Início" <PlusSquare className="w-4 h-4" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Role para baixo no menu até encontrar essa opção
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Confirme tocando em "Adicionar"</p>
                        <p className="text-sm text-muted-foreground">
                          No canto superior direito da tela
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-green-400">Pronto!</p>
                        <p className="text-sm text-muted-foreground">
                          O ícone do Doutor Motors aparecerá na sua tela inicial
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="desktop" className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          Abra no Chrome ou Edge <Chrome className="w-4 h-4" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Acesse este site usando Google Chrome ou Microsoft Edge
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Procure o ícone de instalação</p>
                        <p className="text-sm text-muted-foreground">
                          Na barra de endereço, do lado direito, aparece um ícone de instalação (computador com seta)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Clique em "Instalar"</p>
                        <p className="text-sm text-muted-foreground">
                          Confirme a instalação no popup que aparecer
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-green-400">Pronto!</p>
                        <p className="text-sm text-muted-foreground">
                          O app será instalado e um atalho criado no seu desktop
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-muted-foreground mb-4">
              Já instalou? Comece a diagnosticar seu veículo agora!
            </p>
            <Button asChild size="lg" className="font-chakra uppercase">
              <Link to="/dashboard/diagnostics">
                <Zap className="w-5 h-5 mr-2" />
                Ir para Diagnóstico
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstallAppPage;