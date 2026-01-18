import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AdminData {
  isAdmin: boolean;
  loading: boolean;
  userRole: string | null;
}

export const useAdmin = (): AdminData => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAdminRole = async () => {
      // Wait auth hydration
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setUserRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Prefer RPC to avoid RLS/multi-row issues on user_roles
        const { data, error } = await supabase.rpc("has_role", {
          _role: "admin",
          _user_id: user.id,
        });

        if (error) throw error;

        const admin = Boolean(data);

        if (!cancelled) {
          setIsAdmin(admin);
          setUserRole(admin ? "admin" : "user");
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setUserRole("user");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAdminRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: loading || authLoading, userRole };
};
