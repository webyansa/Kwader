import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  orgId: string | null;
  status: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  roles: [],
  orgId: null,
  status: "active",
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("active");
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const syncAuthState = useCallback(async (nextSession: Session | null) => {
    const requestId = ++requestIdRef.current;

    setSession(nextSession);
    const nextUser = nextSession?.user ?? null;
    setUser(nextUser);

    if (!nextUser) {
      setRoles([]);
      setOrgId(null);
      setStatus("active");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [rolesResponse, profileResponse] = await Promise.all([
        supabase.from("user_roles").select("role, org_id").eq("user_id", nextUser.id),
        supabase.from("profiles").select("status").eq("user_id", nextUser.id).maybeSingle(),
      ]);

      if (requestId !== requestIdRef.current) return;

      const { data: rolesData, error: rolesError } = rolesResponse;
      if (rolesError) {
        console.error("Failed to load user roles:", rolesError.message);
      }

      if (rolesData && rolesData.length > 0) {
        setRoles(rolesData.map((r) => r.role));
        const orgRole = rolesData.find((r) => r.org_id);
        setOrgId(orgRole?.org_id ?? null);
      } else {
        setRoles([]);
        setOrgId(null);
      }

      const { data: profile, error: profileError } = profileResponse;
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Failed to load profile status:", profileError.message);
      }
      setStatus(profile?.status ?? "active");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Auth synchronization failed:", error);
      setRoles([]);
      setOrgId(null);
      setStatus("active");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!isMounted) return;
      void syncAuthState(currentSession);
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      void syncAuthState(nextSession);
    });

    return () => {
      isMounted = false;
      requestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, [syncAuthState]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    requestIdRef.current += 1;
    setUser(null);
    setSession(null);
    setRoles([]);
    setOrgId(null);
    setStatus("active");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, orgId, status, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
