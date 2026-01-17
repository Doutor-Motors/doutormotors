import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CURRENT_VERSION = "1.0";

interface UseLegalConsentReturn {
  hasAcceptedTerms: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useLegalConsent(userId: string | undefined): UseLegalConsentReturn {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(true); // Default to true to avoid flash
  const [isLoading, setIsLoading] = useState(true);

  const checkConsent = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Verificar se o usuário tem todos os aceites necessários
      const { data, error } = await supabase
        .from('legal_consents')
        .select('consent_type, consent_version')
        .eq('user_id', userId)
        .eq('consent_version', CURRENT_VERSION);

      if (error) {
        console.error('Error checking consent:', error);
        setHasAcceptedTerms(false);
        setIsLoading(false);
        return;
      }

      // Verificar se tem todos os tipos necessários
      const requiredTypes = ['terms_of_use', 'privacy_policy', 'liability_waiver'];
      const acceptedTypes = data?.map(c => c.consent_type) || [];
      
      const hasAllConsents = requiredTypes.every(type => acceptedTypes.includes(type));
      setHasAcceptedTerms(hasAllConsents);
    } catch (error) {
      console.error('Error checking consent:', error);
      setHasAcceptedTerms(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConsent();
  }, [userId]);

  return {
    hasAcceptedTerms,
    isLoading,
    refetch: checkConsent,
  };
}
