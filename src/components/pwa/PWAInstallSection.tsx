import { useState } from "react";
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  CheckCircle, 
  Apple,
  Monitor,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.341c-.5 0-.908.406-.908.908s.408.908.908.908c.5 0 .908-.406.908-.908s-.408-.908-.908-.908zm-11.046 0c-.5 0-.908.406-.908.908s.408.908.908.908c.5 0 .908-.406.908-.908s-.408-.908-.908-.908zm11.4-6.742l1.962-3.398c.109-.19.045-.434-.144-.544-.19-.109-.434-.045-.544.144l-1.986 3.44c-1.502-.687-3.19-1.071-4.997-1.071s-3.495.384-4.997 1.071l-1.986-3.44c-.109-.19-.354-.253-.544-.144-.19.109-.253.354-.144.544l1.962 3.398C2.865 10.616.5 14.024.5 17.991h23c0-3.967-2.365-7.375-5.623-9.392z"/>
  </svg>
);

interface PWAInstallSectionProps {
  className?: string;
}

const PWAInstallSection = ({ className }: PWAInstallSectionProps) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await promptInstall();
      if (installed) {
        setJustInstalled(true);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <Card className={`border-green-500/30 bg-green-500/5 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-foreground text-lg">
                PWA Instalado! 🎉
              </h3>
              <p className="text-muted-foreground">
                O Doutor Motors está instalado no seu dispositivo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="font-chakra flex items-center gap-2">
              Instalar como App (PWA)
              <Badge variant="secondary" className="text-xs">Grátis</Badge>
            </CardTitle>
            <CardDescription>
              Instale direto do navegador, sem precisar da loja de apps
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Tela inicial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Notificações push</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Atualizações automáticas</span>
          </div>
        </div>

        {/* Direct Install Button */}
        {isInstallable && (
          <Button 
            onClick={handleInstall}
            disabled={isInstalling || justInstalled}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {justInstalled ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Instalado com Sucesso!
              </>
            ) : isInstalling ? (
              <>
                <Download className="w-5 h-5 mr-2 animate-pulse" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </>
            )}
          </Button>
        )}

        {/* Manual Instructions */}
        {!isInstallable && (
          <Tabs defaultValue={isIOS ? "ios" : "android"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="android" className="gap-1">
                <AndroidIcon className="w-4 h-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios" className="gap-1">
                <Apple className="w-4 h-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-1">
                <Monitor className="w-4 h-4" />
                Desktop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="android" className="mt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Abra o menu do Chrome</p>
                    <p className="text-sm text-muted-foreground">Toque nos 3 pontinhos no canto superior direito</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Selecione "Instalar app"</p>
                    <p className="text-sm text-muted-foreground">Ou "Adicionar à tela inicial"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirme a instalação</p>
                    <p className="text-sm text-muted-foreground">O app aparecerá na sua tela inicial</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ios" className="mt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    1
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Toque no botão Compartilhar</p>
                    <Share className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    2
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Role e selecione "Adicionar à Tela de Início"</p>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Toque em "Adicionar"</p>
                    <p className="text-sm text-muted-foreground">O app aparecerá na sua tela inicial</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ Use o Safari para instalar no iOS. Outros navegadores não suportam PWA.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="desktop" className="mt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Olhe na barra de endereços</p>
                    <p className="text-sm text-muted-foreground">Procure pelo ícone de instalação (⊕ ou 📥)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Clique no ícone de instalação</p>
                    <p className="text-sm text-muted-foreground">Ou vá em Menu → Instalar Doutor Motors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirme a instalação</p>
                    <p className="text-sm text-muted-foreground">O app abrirá em uma janela própria</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* PWA vs Native note */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            O PWA funciona bem para a maioria das funções, mas para conexão OBD2 completa 
            (Bluetooth/WiFi), recomendamos o app nativo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallSection;
