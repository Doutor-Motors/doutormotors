import { useState } from "react";
import { Link } from "react-router-dom";
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
        <DialogContent 
          className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl p-4 sm:p-6 max-h-[85vh] overflow-hidden flex flex-col" 
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex-shrink-0 space-y-2">
            <DialogTitle className="font-chakra text-base sm:text-lg md:text-xl uppercase flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <span>Termos de Uso</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Por favor, leia e aceite nossos termos antes de continuar.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-[200px] max-h-[40vh] pr-2 sm:pr-4 my-2 sm:my-4">
          <div className="space-y-4 sm:space-y-5">
            {/* Aviso Principal */}
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-sm sm:text-base mb-1">
                    Aviso Importante
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-400">
                    O Doutor Motors é uma <strong>plataforma informativa e educativa</strong>. 
                    Não somos uma oficina mecânica e não prestamos serviços de reparo.
                  </p>
                </div>
              </div>
            </div>

            {/* Termos de Uso */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                Termos de Uso
                <Link 
                  to="/termos" 
                  target="_blank" 
                  className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto"
                >
                  Ver completo <ExternalLink className="w-3 h-3" />
                </Link>
              </h3>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 pl-6 sm:pl-7">
                <p>• <strong>Natureza Informativa:</strong> Todo conteúdo é de caráter educativo.</p>
                <p>• <strong>Links Externos:</strong> Tutoriais são de fontes externas.</p>
                <p>• <strong>Classificação de Risco:</strong> Indicamos nível de risco de cada problema.</p>
                <p>• <strong>Recomendação:</strong> Problemas críticos devem ser avaliados por profissionais.</p>
              </div>
            </div>

            {/* Isenção de Responsabilidade */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                Isenção de Responsabilidade
                <Link 
                  to="/termos#isencao" 
                  target="_blank" 
                  className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto"
                >
                  Ver completo <ExternalLink className="w-3 h-3" />
                </Link>
              </h3>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 pl-6 sm:pl-7">
                <p>• <strong>Sem Garantia:</strong> Não garantimos precisão para seu veículo específico.</p>
                <p>• <strong>Decisão do Usuário:</strong> Ações são de sua responsabilidade.</p>
                <p>• <strong>Sem Responsabilidade:</strong> Não nos responsabilizamos por danos.</p>
                <p>• <strong>Consulte um Profissional:</strong> Sempre recomendamos isso.</p>
              </div>
            </div>

            {/* Privacidade - LGPD */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                Privacidade (LGPD)
                <Link 
                  to="/privacidade" 
                  target="_blank" 
                  className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto"
                >
                  Ver completo <ExternalLink className="w-3 h-3" />
                </Link>
              </h3>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 pl-6 sm:pl-7">
                <p>• <strong>Dados:</strong> Armazenamos dados do veículo e diagnósticos.</p>
                <p>• <strong>Uso:</strong> Dados usados apenas para fornecer o serviço.</p>
                <p>• <strong>Não Compartilhamos:</strong> Não vendemos seus dados.</p>
                <p>• <strong>Exclusão:</strong> Você pode solicitar exclusão dos dados.</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
          {/* Checkboxes de aceite */}
          <div className="space-y-2 sm:space-y-3">
            <label 
              htmlFor="terms" 
              className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-muted/50 p-1.5 sm:p-2 rounded-md transition-colors"
            >
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-foreground leading-tight">
                Li e aceito os <strong>Termos de Uso</strong> e entendo que esta é uma plataforma informativa.
              </span>
            </label>

            <label 
              htmlFor="privacy" 
              className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-muted/50 p-1.5 sm:p-2 rounded-md transition-colors"
            >
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-foreground leading-tight">
                Li e aceito a <strong>Política de Privacidade</strong> e o uso dos meus dados.
              </span>
            </label>

            <label 
              htmlFor="liability" 
              className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-muted/50 p-1.5 sm:p-2 rounded-md transition-colors"
            >
              <Checkbox
                id="liability"
                checked={acceptedLiability}
                onCheckedChange={(checked) => setAcceptedLiability(checked as boolean)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-foreground leading-tight">
                Entendo e aceito a <strong>Isenção de Responsabilidade</strong>.
              </span>
            </label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              onClick={handleAccept}
              disabled={!canProceed || isLoading}
              className="w-full font-chakra uppercase text-sm sm:text-base py-2 sm:py-2.5"
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