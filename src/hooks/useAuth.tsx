import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function profileExistsForUser(userId: string): Promise<{
  exists: boolean;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  // Falhas de rede/RLS não devem “matar” a sessão automaticamente.
  if (error) return { exists: true, error: error as unknown as Error };

  return { exists: Boolean(data), error: null };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      if (!nextSession?.user) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      const { exists, error } = await profileExistsForUser(nextSession.user.id);

      // Se NÃO existe profile (e não foi erro), tratamos como conta removida.
      if (!exists && !error) {
        await supabase.auth.signOut();
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(nextSession);
      setUser(nextSession.user);
      setLoading(false);
    };

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error as Error };

    const signedUserId = data.user?.id;

    // Defesa crítica: se o usuário NÃO tem profile, impedimos login.
    if (signedUserId) {
      const { exists, error: profileError } = await profileExistsForUser(signedUserId);
      if (!exists && !profileError) {
        await supabase.auth.signOut();
        return { error: new Error("Conta removida ou desativada.") };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
