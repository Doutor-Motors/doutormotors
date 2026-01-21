import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UseValidUUIDOptions {
  id: string | undefined;
  redirectTo?: string;
  errorTitle?: string;
  errorDescription?: string;
  onInvalid?: () => void;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string | undefined): id is string {
  return !!id && UUID_REGEX.test(id);
}

export function useValidUUID({
  id,
  redirectTo = "/dashboard/history",
  errorTitle = "Link inválido",
  errorDescription = "O link acessado é inválido ou expirou.",
  onInvalid,
}: UseValidUUIDOptions) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handledRef = useRef(false);

  const isValid = isValidUUID(id);

  useEffect(() => {
    if (!isValid && !handledRef.current) {
      handledRef.current = true;

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });

      onInvalid?.();
      navigate(redirectTo, { replace: true });
    }
  }, [isValid, navigate, redirectTo, errorTitle, errorDescription, toast, onInvalid]);

  return { isValid, validId: isValid ? id : null };
}
