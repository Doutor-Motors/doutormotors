import { useState } from 'react';
import { 
  Bluetooth, 
  Wifi, 
  Smartphone, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  HelpCircle,
  Zap,
  Settings,
  Cable,
  Monitor,
  Download,
  Globe,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ConnectionMethodGuideProps {
  isNativePlatform?: boolean;
}

export const ConnectionMethodGuide = ({ isNativePlatform = false }: ConnectionMethodGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const methods = [
    {
      id: 'bluetooth',
      name: 'Bluetooth',
      icon: Bluetooth,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      recommended: true,
      platformSupport: {
        browser: { supported: true, note: 'Chrome/Edge no Android e computadores' },
        native: { supported: true, note: 'Android e iOS' },
      },
      description: 'Conexão sem fio via Bluetooth Low Energy ou Classic',
      compatibility: 'Adaptadores ELM327 Bluetooth, V-Link, Veepeak',
      pros: [
        'Fácil de configurar',
        'Sem cabos extras',
        'Funciona em navegadores Chrome/Edge',
        'Conexão estável até 10 metros',
      ],
      cons: [
        'Requer pareamento inicial',
        'Não funciona no Safari/iOS (usar app nativo)',
        'Pode ter latência em alguns dispositivos',
      ],
      steps: [
        'Plugue o adaptador OBD2 na porta de diagnóstico do veículo (geralmente embaixo do volante)',
        'Ligue a ignição do veículo (não precisa ligar o motor)',
        'Ative o Bluetooth do seu celular/computador',
        'Pareie o adaptador nas configurações de Bluetooth (código padrão: 1234 ou 0000)',
        'Volte ao app e clique em "Bluetooth" para conectar',
        'Aguarde a conexão ser estabelecida',
      ],
      troubleshooting: [
        { problem: 'Adaptador não aparece', solution: 'Verifique se está bem encaixado na porta OBD2 e se a ignição está ligada' },
        { problem: 'Erro de pareamento', solution: 'Tente os códigos 1234, 0000 ou 6789. Remova o pareamento antigo e tente novamente' },
        { problem: 'Conexão instável', solution: 'Aproxime o dispositivo do adaptador ou verifique interferências' },
        { problem: 'Não funciona no iPhone/Safari', solution: 'Safari não suporta Bluetooth Web. Baixe o app nativo na App Store' },
      ],
    },
    {
      id: 'wifi',
      name: 'WiFi',
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      recommended: false,
      platformSupport: {
        browser: { supported: false, note: 'Apenas modo demonstração (TCP raw bloqueado)' },
        native: { supported: true, note: 'Android e iOS' },
      },
      description: 'Conexão via rede WiFi local do adaptador',
      compatibility: 'Adaptadores ELM327 WiFi, BAFX, OBDLink',
      browserLimitation: {
        title: '⚠️ Não Funciona em Navegadores',
        text: 'Por motivos de segurança, navegadores não permitem conexões TCP diretas com adaptadores WiFi. Para usar WiFi real, você PRECISA do app nativo instalado no seu celular.',
        action: 'Baixar App Nativo',
      },
      pros: [
        'Maior velocidade de dados',
        'Melhor opção para iPhone/iOS',
        'Ideal para diagnósticos longos',
        'Conexão muito estável',
      ],
      cons: [
        '❌ NÃO funciona em navegadores',
        'Requer app nativo instalado',
        'Desconecta da internet durante uso',
        'Requer configurar IP manualmente',
      ],
      steps: [
        '📱 PRIMEIRO: Baixe o app Doutor Motors na Play Store ou App Store',
        'Plugue o adaptador OBD2 WiFi na porta de diagnóstico',
        'Ligue a ignição do veículo',
        'Nas configurações WiFi do celular, conecte à rede do adaptador (ex: CLKDevices, OBDLink, V-LINK)',
        'A senha padrão geralmente é "12345678" ou está no manual',
        'Abra o app nativo e vá para Diagnóstico > WiFi Nativo',
        'Configure o IP se necessário (padrão: 192.168.0.10:35000)',
      ],
      troubleshooting: [
        { problem: 'Tentando usar WiFi no navegador', solution: 'WiFi NÃO funciona em navegadores! Baixe o app nativo na loja de apps' },
        { problem: 'Não encontra rede WiFi do adaptador', solution: 'Verifique se o adaptador está encaixado e a ignição ligada. Alguns adaptadores demoram 30 segundos' },
        { problem: 'Conecta mas não comunica', solution: 'Verifique se o IP está correto. IPs comuns: 192.168.0.10, 192.168.1.1, 10.0.0.1' },
        { problem: 'Internet não funciona', solution: 'Normal! O adaptador cria uma rede local sem internet. Reconecte ao WiFi normal após usar' },
      ],
    },
    {
      id: 'capacitor',
      name: 'App Nativo',
      icon: Smartphone,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      recommended: isNativePlatform,
      platformSupport: {
        browser: { supported: false, note: 'Requer instalação do app' },
        native: { supported: true, note: 'Android e iOS - Melhor experiência!' },
      },
      description: 'Conexão nativa otimizada - A MELHOR OPÇÃO para smartphones',
      compatibility: 'Todos os adaptadores ELM327 (Bluetooth e WiFi)',
      nativeHighlight: {
        title: '🏆 Recomendado para Smartphones',
        text: 'O app nativo oferece a melhor experiência: conexão real com Bluetooth e WiFi, melhor performance, e funciona em iPhone e Android.',
      },
      pros: [
        'Conexão REAL (não simulada)',
        'Funciona com Bluetooth E WiFi',
        'Melhor performance e estabilidade',
        'Funciona em iPhone/iOS',
        'Menor consumo de bateria',
      ],
      cons: [
        'Requer instalar o app',
        'Disponível apenas em dispositivos móveis',
      ],
      steps: [
        '📥 Baixe o app Doutor Motors na Play Store (Android) ou App Store (iOS)',
        'Plugue o adaptador OBD2 no veículo',
        'Ligue a ignição',
        'Abra o app e vá para Diagnóstico',
        'Escolha "Bluetooth Nativo" ou "WiFi Nativo"',
        'O app detectará automaticamente os adaptadores disponíveis',
        'Selecione seu adaptador e toque para conectar',
        'Conceda as permissões necessárias quando solicitado',
      ],
      troubleshooting: [
        { problem: 'App não encontra dispositivos', solution: 'Verifique se Bluetooth/WiFi está ativado e se as permissões foram concedidas' },
        { problem: 'Permissões negadas', solution: 'Vá em Configurações > Apps > Doutor Motors > Permissões e ative Bluetooth e Localização' },
        { problem: 'App fecha inesperadamente', solution: 'Atualize o app para a versão mais recente ou reinstale' },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Manual de Conexão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-chakra text-2xl uppercase flex items-center gap-2">
            <Cable className="w-6 h-6 text-primary" />
            Manual de Conexão OBD2
          </DialogTitle>
          <DialogDescription>
            Aprenda a conectar seu adaptador OBD2 usando os 3 métodos disponíveis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Platform Detection Banner */}
          <Card className={isNativePlatform ? 'bg-purple-500/10 border-purple-500/30' : 'bg-amber-500/10 border-amber-500/30'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {isNativePlatform ? (
                  <>
                    <Smartphone className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        App Nativo Detectado
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Você está usando o app nativo! Todas as conexões (Bluetooth e WiFi) funcionarão normalmente com dados reais.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Monitor className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Navegador Web Detectado
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Você está acessando pelo navegador. Bluetooth funciona em Chrome/Edge, mas <strong className="text-amber-400">WiFi mostrará apenas dados simulados</strong>.
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-amber-600 hover:bg-amber-700"
                        onClick={() => window.open('/native-app-guide', '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar App para Conexão Real
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Guide */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Início Rápido</h4>
                  <p className="text-sm text-muted-foreground">
                    1. Plugue o adaptador no veículo → 2. Ligue a ignição → 3. Escolha seu método de conexão abaixo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Comparison Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Comparativo Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Método</th>
                      <th className="text-center py-2 font-medium">Navegador</th>
                      <th className="text-center py-2 font-medium">App Nativo</th>
                      <th className="text-center py-2 font-medium">iPhone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 flex items-center gap-2">
                        <Bluetooth className="w-4 h-4 text-blue-500" />
                        Bluetooth
                      </td>
                      <td className="text-center py-2">
                        <span className="text-yellow-500">⚠️ Chrome/Edge</span>
                      </td>
                      <td className="text-center py-2">
                        <span className="text-green-500">✅ Sim</span>
                      </td>
                      <td className="text-center py-2">
                        <span className="text-red-500">❌ App apenas</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        WiFi
                      </td>
                      <td className="text-center py-2">
                        <span className="text-red-500">❌ Simulado</span>
                      </td>
                      <td className="text-center py-2">
                        <span className="text-green-500">✅ Sim</span>
                      </td>
                      <td className="text-center py-2">
                        <span className="text-green-500">✅ App</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-500" />
                        Nativo
                      </td>
                      <td className="text-center py-2">
                        <span className="text-muted-foreground">—</span>
                      </td>
                      <td className="text-center py-2">
                        <span className="text-green-500">✅ Melhor</span>
                      </td>
                      <td className="text-center py-2">
                        <span className="text-green-500">✅ Melhor</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Connection Methods */}
          <Accordion type="single" collapsible className="space-y-4">
            {methods.map((method) => (
              <AccordionItem 
                key={method.id} 
                value={method.id}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-full ${method.bgColor}`}>
                      <method.icon className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-chakra font-bold text-lg uppercase">
                          {method.name}
                        </span>
                        {method.recommended && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Recomendado
                          </Badge>
                        )}
                        {method.id === 'wifi' && !isNativePlatform && (
                          <Badge variant="outline" className="border-amber-500 text-amber-500 text-xs">
                            App Necessário
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {/* Native Highlight */}
                    {'nativeHighlight' in method && method.nativeHighlight && (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-purple-400">
                              {(method.nativeHighlight as { title: string; text: string }).title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(method.nativeHighlight as { title: string; text: string }).text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Browser Limitation Warning for WiFi */}
                    {'browserLimitation' in method && method.browserLimitation && !isNativePlatform && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-red-400">
                              {(method.browserLimitation as { title: string; text: string; action: string }).title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(method.browserLimitation as { title: string; text: string; action: string }).text}
                            </p>
                            <Button 
                              size="sm" 
                              className="mt-3 bg-red-600 hover:bg-red-700"
                              onClick={() => window.open('/native-app-guide', '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {(method.browserLimitation as { title: string; text: string; action: string }).action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Platform Support */}
                    {'platformSupport' in method && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h5 className="font-semibold text-foreground mb-2 text-sm">Onde Funciona:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-muted-foreground" />
                            <span>Navegador:</span>
                            {(method.platformSupport as any).browser.supported ? (
                              <span className="text-green-500">✅</span>
                            ) : (
                              <span className="text-red-500">❌</span>
                            )}
                            <span className="text-muted-foreground">{(method.platformSupport as any).browser.note}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            <span>App:</span>
                            {(method.platformSupport as any).native.supported ? (
                              <span className="text-green-500">✅</span>
                            ) : (
                              <span className="text-red-500">❌</span>
                            )}
                            <span className="text-muted-foreground">{(method.platformSupport as any).native.note}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Compatibility */}
                    <div>
                      <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Adaptadores Compatíveis
                      </h5>
                      <p className="text-sm text-muted-foreground">{method.compatibility}</p>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✓ Vantagens</h5>
                        <ul className="space-y-1">
                          {method.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-600 mb-2">⚠ Limitações</h5>
                        <ul className="space-y-1">
                          {method.cons.map((con, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <Circle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <h5 className="font-semibold text-foreground mb-2">📋 Passo a Passo</h5>
                      <ol className="space-y-2">
                        {method.steps.map((step, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-3">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-muted-foreground pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Troubleshooting */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Solução de Problemas
                      </h5>
                      <div className="space-y-3">
                        {method.troubleshooting.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-foreground">❌ {item.problem}</p>
                            <p className="text-muted-foreground ml-5">✅ {item.solution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* General Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔌</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Localização da porta OBD2:</strong> Geralmente fica embaixo do painel, 
                  à esquerda do volante. Em alguns veículos pode estar no console central ou embaixo do porta-luvas.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🔋</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Bateria:</strong> Sempre mantenha o adaptador conectado apenas durante o uso. 
                  Deixar conectado permanentemente pode drenar a bateria do veículo.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📱</span>
                <p className="text-sm text-muted-foreground">
                  <strong>iPhone/iOS:</strong> Para usar Bluetooth ou WiFi no iPhone, você PRECISA baixar o app nativo. 
                  O Safari não suporta essas conexões diretamente.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Segurança:</strong> Não faça diagnósticos enquanto dirige. 
                  Estacione o veículo em local seguro antes de iniciar.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🛒</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Adaptadores recomendados:</strong> ELM327 v2.1+, OBDLink, Veepeak, V-Link. 
                  Evite adaptadores muito baratos pois podem ter firmware defeituoso.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Download CTA */}
          {!isNativePlatform && (
            <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                  <div className="p-4 bg-purple-500/20 rounded-full">
                    <Smartphone className="w-10 h-10 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-chakra text-xl font-bold uppercase text-purple-300">
                      Quer Conexão Real?
                    </h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      Baixe o app nativo para diagnóstico completo com Bluetooth e WiFi funcionando de verdade!
                    </p>
                  </div>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => window.open('/native-app-guide', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar App Grátis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
