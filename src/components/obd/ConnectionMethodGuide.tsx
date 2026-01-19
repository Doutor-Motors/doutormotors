import { useState } from 'react';
import { 
  Bluetooth, 
  Wifi, 
  Smartphone, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
  Cable
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
      description: 'Conexão sem fio via Bluetooth Low Energy ou Classic',
      compatibility: 'Adaptadores ELM327 Bluetooth, V-Link, Veepeak',
      pros: [
        'Fácil de configurar',
        'Sem cabos extras',
        'Funciona em qualquer dispositivo com Bluetooth',
        'Conexão estável até 10 metros',
      ],
      cons: [
        'Requer pareamento inicial',
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
      ],
    },
    {
      id: 'wifi',
      name: 'WiFi',
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      recommended: false,
      description: 'Conexão via rede WiFi local do adaptador',
      compatibility: 'Adaptadores ELM327 WiFi, BAFX, OBDLink',
      browserLimitation: {
        title: 'Limitação do Navegador',
        text: 'Conexões WiFi diretas com adaptadores OBD2 não são possíveis em navegadores devido a limitações de segurança (TCP raw não é suportado). Use o app nativo para conexão WiFi real.',
      },
      pros: [
        'Maior velocidade de dados',
        'Compatível com iOS sem limitações',
        'Ideal para diagnósticos longos',
        'Requer app nativo para funcionar (não funciona em navegador)',
      ],
      cons: [
        'Requer configurar IP manualmente em alguns casos',
        'Desconecta da internet durante uso',
        'Alcance limitado ao veículo',
        'Não funciona em navegadores - apenas app nativo',
      ],
      steps: [
        'Plugue o adaptador OBD2 WiFi na porta de diagnóstico',
        'Ligue a ignição do veículo',
        'Nas configurações WiFi do celular, conecte à rede do adaptador (ex: CLKDevices, OBDLink, V-LINK)',
        'A senha padrão geralmente é "12345678" ou está no manual',
        'Clique no ícone de engrenagem ao lado do botão WiFi para configurar IP (padrão: 192.168.0.10:35000)',
        'Clique em "WiFi" para conectar',
      ],
      troubleshooting: [
        { problem: 'Não encontra rede WiFi do adaptador', solution: 'Verifique se o adaptador está encaixado e a ignição ligada. Alguns adaptadores demoram 30 segundos para criar a rede' },
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
      description: 'Conexão nativa otimizada para apps móveis (Android/iOS)',
      compatibility: 'Todos os adaptadores ELM327 compatíveis',
      pros: [
        'Melhor performance e estabilidade',
        'Acesso direto ao hardware do dispositivo',
        'Menor consumo de bateria',
        'Conexão mais rápida e confiável',
      ],
      cons: [
        'Requer instalar o app nativo',
        'Disponível apenas em dispositivos móveis',
      ],
      steps: [
        'Baixe e instale o app Doutor Motors na Play Store ou App Store',
        'Plugue o adaptador OBD2 no veículo',
        'Ligue a ignição',
        'Abra o app e vá para Diagnóstico',
        'O app detectará automaticamente os adaptadores disponíveis',
        'Selecione seu adaptador na lista e toque para conectar',
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
                      <div className="flex items-center gap-2">
                        <span className="font-chakra font-bold text-lg uppercase">
                          {method.name}
                        </span>
                        {method.recommended && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Recomendado
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
                    {/* Browser Limitation Warning for WiFi */}
                    {'browserLimitation' in method && method.browserLimitation && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                              {(method.browserLimitation as { title: string; text: string }).title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(method.browserLimitation as { title: string; text: string }).text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Compatibility */}
                    <div>
                      <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Compatibilidade
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
