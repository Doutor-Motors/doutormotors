import { AlertTriangle, ShieldX, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LEGAL_PHRASES } from "./LegalDisclaimers";

interface SafetyBlockerProps {
  systemType: "freio" | "direcao" | "suspensao" | "airbag" | "geral";
  dtcCode: string;
}

const getSystemInfo = (systemType: string) => {
  switch (systemType) {
    case "freio":
      return {
        name: "Sistema de Freios",
        icon: "🛑",
        warning: LEGAL_PHRASES.NO_DIY_BRAKE,
        risks: [
          "Falha nos freios pode causar acidentes graves",
          "Perda de controle do veículo",
          "Risco de vida para você e terceiros",
        ],
      };
    case "direcao":
      return {
        name: "Sistema de Direção",
        icon: "🚗",
        warning: LEGAL_PHRASES.NO_DIY_STEERING,
        risks: [
          "Perda de controle da direção",
          "Impossibilidade de manobrar o veículo",
          "Risco de colisão frontal",
        ],
      };
    case "suspensao":
      return {
        name: "Sistema de Suspensão",
        icon: "⚙️",
        warning: LEGAL_PHRASES.NO_DIY_SUSPENSION,
        risks: [
          "Instabilidade do veículo em curvas",
          "Desgaste irregular dos pneus",
          "Comportamento imprevisível em frenagens",
        ],
      };
    case "airbag":
      return {
        name: "Sistema de Airbag",
        icon: "🎯",
        warning: "Reparos em sistemas de airbag devem ser realizados por profissionais qualificados.",
        risks: [
          "Acionamento acidental pode causar lesões graves",
          "Não acionamento em colisão pode ser fatal",
          "Componentes explosivos requerem manuseio especializado",
        ],
      };
    default:
      return {
        name: "Sistema Crítico de Segurança",
        icon: "⚠️",
        warning: LEGAL_PHRASES.SAFETY_CRITICAL,
        risks: [
          "Este sistema afeta diretamente a segurança do veículo",
          "Reparo incorreto pode colocar vidas em risco",
          "Requer conhecimento e ferramentas especializadas",
        ],
      };
  }
};

const SafetyBlocker = ({ systemType, dtcCode }: SafetyBlockerProps) => {
  const systemInfo = getSystemInfo(systemType);

  return (
    <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
      <CardHeader>
        <CardTitle className="font-chakra uppercase flex items-center gap-3 text-red-700 dark:text-red-400">
          <ShieldX className="w-6 h-6" />
          <span>{systemInfo.icon} {systemInfo.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aviso Principal */}
        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
                Código {dtcCode} - Reparo NÃO Recomendado por Conta Própria
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {systemInfo.warning}
              </p>
            </div>
          </div>
        </div>

        {/* Riscos */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Riscos de Reparo Inadequado:
          </h4>
          <ul className="space-y-2">
            {systemInfo.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-red-500">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recomendação */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">
            ✅ O que fazer:
          </h4>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
            <li>1. Não dirija o veículo se houver risco à segurança</li>
            <li>2. Procure uma oficina especializada imediatamente</li>
            <li>3. Solicite um guincho se necessário</li>
            <li>4. Peça um orçamento detalhado antes de autorizar o reparo</li>
          </ul>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="default" 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-chakra uppercase"
            onClick={() => window.open(`https://www.google.com/maps/search/oficina+mecanica+perto+de+mim`, '_blank')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Encontrar Oficinas Próximas
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 font-chakra uppercase border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => window.open(`tel:190`, '_self')}
          >
            <Phone className="w-4 h-4 mr-2" />
            Emergência (190)
          </Button>
        </div>

        {/* Aviso Legal */}
        <p className="text-xs text-center text-muted-foreground italic">
          {LEGAL_PHRASES.PLATFORM_POSITION}
        </p>
      </CardContent>
    </Card>
  );
};

export default SafetyBlocker;
