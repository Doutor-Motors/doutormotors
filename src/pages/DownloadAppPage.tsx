import { Link } from "react-router-dom";
import { 
  Smartphone, 
  Download, 
  Wifi, 
  Bluetooth, 
  CheckCircle, 
  XCircle,
  Apple,
  Monitor,
  Zap,
  Shield,
  Globe,
  ArrowLeft,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

// Android icon component
const AndroidIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.341c-.5 0-.908.406-.908.908s.408.908.908.908c.5 0 .908-.406.908-.908s-.408-.908-.908-.908zm-11.046 0c-.5 0-.908.406-.908.908s.408.908.908.908c.5 0 .908-.406.908-.908s-.408-.908-.908-.908zm11.4-6.742l1.962-3.398c.109-.19.045-.434-.144-.544-.19-.109-.434-.045-.544.144l-1.986 3.44c-1.502-.687-3.19-1.071-4.997-1.071s-3.495.384-4.997 1.071l-1.986-3.44c-.109-.19-.354-.253-.544-.144-.19.109-.253.354-.144.544l1.962 3.398C2.865 10.616.5 14.024.5 17.991h23c0-3.967-2.365-7.375-5.623-9.392z"/>
  </svg>
);

const DownloadAppPage = () => {
  const { platformInfo, platformDescription, connectionCapabilities, canConnect } = usePlatformDetection();

  const benefits = [
    {
      icon: Bluetooth,
      title: "Bluetooth Completo",
      description: "Conexão nativa com adaptadores ELM327 Bluetooth em qualquer smartphone",
    },
    {
      icon: Wifi,
      title: "WiFi/TCP Nativo",
      description: "Suporte real a adaptadores WiFi que navegadores não conseguem acessar",
    },
    {
      icon: Zap,
      title: "Mais Rápido",
      description: "Performance otimizada com comunicação direta, sem limitações do navegador",
    },
    {
      icon: Shield,
      title: "Mais Estável",
      description: "Conexões que não são interrompidas por atualizações do navegador",
    },
  ];

  const platformComparison = [
    {
      platform: "App Android Nativo",
      icon: AndroidIcon,
      bluetooth: true,
      wifi: true,
      recommended: true,
    },
    {
      platform: "App iOS Nativo",
      icon: Apple,
      bluetooth: true,
      wifi: true,
      recommended: true,
    },
    {
      platform: "Chrome Android",
      icon: Globe,
      bluetooth: true,
      wifi: false,
      recommended: false,
    },
    {
      platform: "Chrome Desktop",
      icon: Monitor,
      bluetooth: true,
      wifi: false,
      recommended: false,
    },
    {
      platform: "Safari iOS",
      icon: Apple,
      bluetooth: false,
      wifi: false,
      recommended: false,
    },
    {
      platform: "Firefox",
      icon: Globe,
      bluetooth: false,
      wifi: false,
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Smartphone className="w-3 h-3 mr-1" />
            App Nativo
          </Badge>
          <h1 className="font-chakra text-3xl md:text-5xl font-bold text-foreground mb-4">
            Baixe o App <span className="text-primary">Doutor Motors</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acesse todas as funcionalidades de diagnóstico OBD2 sem limitações. 
            Conexão Bluetooth e WiFi completas em Android e iPhone.
          </p>
        </div>

        {/* Current Platform Status */}
        <Card className="mb-12 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${canConnect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <Smartphone className={`w-6 h-6 ${canConnect ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Seu dispositivo atual</h3>
                  <p className="text-muted-foreground">{platformDescription}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {connectionCapabilities.bluetooth.supported ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">Bluetooth</span>
                </div>
                <div className="flex items-center gap-2">
                  {connectionCapabilities.wifi.supported ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">WiFi</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Android Card */}
          <Card className="relative overflow-hidden border-2 hover:border-green-500 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <AndroidIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="font-chakra">Android</CardTitle>
                  <CardDescription>Google Play Store</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Bluetooth ELM327 completo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>WiFi/TCP nativo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Android 7.0+ (API 24)</span>
                </div>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">QR Code - Em breve</p>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled>
                <Download className="w-4 h-4 mr-2" />
                Em breve na Play Store
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Versão APK disponível para beta testers
              </p>
            </CardContent>
          </Card>

          {/* iOS Card */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Apple className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="font-chakra">iOS</CardTitle>
                  <CardDescription>App Store</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Bluetooth ELM327 completo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>WiFi/TCP nativo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>iOS 13.0+</span>
                </div>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">QR Code - Em breve</p>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled>
                <Download className="w-4 h-4 mr-2" />
                Em breve na App Store
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Versão TestFlight disponível para beta testers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="font-chakra text-2xl font-bold text-center text-foreground mb-8">
            Por que usar o App Nativo?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-chakra font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-12">
          <h2 className="font-chakra text-2xl font-bold text-center text-foreground mb-8">
            Comparação de Plataformas
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-chakra">Plataforma</th>
                      <th className="text-center p-4 font-chakra">Bluetooth</th>
                      <th className="text-center p-4 font-chakra">WiFi/TCP</th>
                      <th className="text-center p-4 font-chakra">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformComparison.map((platform, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <platform.icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{platform.platform}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {platform.bluetooth ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {platform.wifi ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {platform.recommended ? (
                            <Badge className="bg-green-600">Recomendado</Badge>
                          ) : (
                            <Badge variant="secondary">Limitado</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Beta Tester CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="font-chakra text-xl font-bold text-foreground mb-2">
              Quer testar antes de todo mundo?
            </h3>
            <p className="text-muted-foreground mb-6">
              Entre para nossa lista de beta testers e receba acesso antecipado ao app nativo.
            </p>
            <Link to="/contato">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Quero ser Beta Tester
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadAppPage;
