import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccepted: () => void;
  userId: string;
}

const CURRENT_VERSION = "1.0";

const TermsAcceptanceModal = ({ isOpen, onAccepted, userId }: TermsAcceptanceModalProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedLiability, setAcceptedLiability] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const canProceed = acceptedTerms && acceptedPrivacy && acceptedLiability;

  const handleAccept = async () => {
    if (!canProceed) return;

    setIsLoading(true);

    try {
      // Registrar todos os aceites
      const consents = [
        { consent_type: 'terms_of_use', consent_version: CURRENT_VERSION },
        { consent_type: 'privacy_policy', consent_version: CURRENT_VERSION },
        { consent_type: 'liability_waiver', consent_version: CURRENT_VERSION },
      ];

      for (const consent of consents) {
        const { error } = await supabase
          .from('legal_consents')
          .insert({
            user_id: userId,
            consent_type: consent.consent_type,
            consent_version: consent.consent_version,
            user_agent: navigator.userAgent,
          });

        if (error) {
          console.error(`Error saving ${consent.consent_type}:`, error);
          throw error;
        }
      }

      toast({
        title: "Termos aceitos",
        description: "Obrigado por aceitar nossos termos. Você pode continuar usando a plataforma.",
      });

      onAccepted();
    } catch (error) {
      console.error("Error saving consents:", error);
      toast({
        title: "Erro ao salvar aceite",
        description: "Tente novamente. Se o problema persistir, entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-chakra text-xl uppercase flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Termos de Uso - Doutor Motors
          </DialogTitle>
          <DialogDescription>
            Por favor, leia e aceite nossos termos antes de continuar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Aviso Principal */}
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                    Aviso Importante
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    O Doutor Motors é uma <strong>plataforma informativa e educativa</strong>. 
                    Não somos uma oficina mecânica e não prestamos serviços de reparo automotivo.
                  </p>
                </div>
              </div>
            </div>

            {/* Termos de Uso */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Termos de Uso
              </h3>
              <div className="text-sm text-muted-foreground space-y-2 pl-7">
                <p>1. <strong>Natureza Informativa:</strong> Todo conteúdo disponibilizado é de caráter educativo e informativo. Não fornecemos instruções diretas de reparo.</p>
                <p>2. <strong>Links Externos:</strong> Quando indicamos tutoriais ou guias, estes são de fontes externas (como CarCareKiosk) e abrem em nova aba. O conteúdo desses sites é de responsabilidade deles.</p>
                <p>3. <strong>Classificação de Risco:</strong> Sempre indicamos o nível de risco e complexidade de cada problema diagnosticado.</p>
                <p>4. <strong>Recomendação Profissional:</strong> Problemas críticos ou que envolvam sistemas de segurança (freios, direção, suspensão, airbags) devem SEMPRE ser avaliados e reparados por profissionais qualificados.</p>
              </div>
            </div>

            {/* Isenção de Responsabilidade */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Isenção de Responsabilidade
              </h3>
              <div className="text-sm text-muted-foreground space-y-2 pl-7">
                <p>1. <strong>Sem Garantia:</strong> Não garantimos a precisão, completude ou aplicabilidade das informações fornecidas para seu veículo específico.</p>
                <p>2. <strong>Decisão do Usuário:</strong> Qualquer ação tomada com base nas informações é de inteira responsabilidade do usuário.</p>
                <p>3. <strong>Sem Responsabilidade por Danos:</strong> Não nos responsabilizamos por quaisquer danos, lesões ou prejuízos decorrentes de reparos realizados por você ou por terceiros.</p>
                <p>4. <strong>Consulte um Profissional:</strong> Sempre recomendamos consultar um mecânico qualificado antes de realizar qualquer reparo.</p>
              </div>
            </div>

            {/* Privacidade - LGPD */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Privacidade e Dados (LGPD)
              </h3>
              <div className="text-sm text-muted-foreground space-y-2 pl-7">
                <p>1. <strong>Dados Coletados:</strong> Armazenamos dados do veículo (marca, modelo, ano) e histórico de diagnósticos associados à sua conta.</p>
                <p>2. <strong>Uso dos Dados:</strong> Usamos seus dados apenas para fornecer o serviço de diagnóstico e melhorar sua experiência.</p>
                <p>3. <strong>Não Compartilhamos:</strong> Não vendemos ou compartilhamos seus dados com terceiros para fins de marketing.</p>
                <p>4. <strong>Direito à Exclusão:</strong> Você pode solicitar a exclusão completa dos seus dados a qualquer momento através do seu perfil.</p>
                <p>5. <strong>Consentimento:</strong> Ao usar a plataforma, você consente com a coleta e uso dos dados conforme descrito.</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          {/* Checkboxes de aceite */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                Li e aceito os <strong>Termos de Uso</strong> e entendo que esta é uma plataforma informativa.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              />
              <label htmlFor="privacy" className="text-sm text-foreground cursor-pointer">
                Li e aceito a <strong>Política de Privacidade</strong> e o uso dos meus dados conforme descrito.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="liability"
                checked={acceptedLiability}
                onCheckedChange={(checked) => setAcceptedLiability(checked as boolean)}
              />
              <label htmlFor="liability" className="text-sm text-foreground cursor-pointer">
                Entendo e aceito a <strong>Isenção de Responsabilidade</strong>, reconhecendo que qualquer reparo é de minha inteira responsabilidade.
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAccept}
              disabled={!canProceed || isLoading}
              className="w-full font-chakra uppercase"
            >
              {isLoading ? "Salvando..." : "Aceitar e Continuar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAcceptanceModal;
