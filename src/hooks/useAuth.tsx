import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuthChangeEvent, User, Session } from "@supabase/supabase-js";
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
  const userIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setRoles([]);
    setOrgId(null);
    setStatus("active");
  }, []);

  const fetchUserContext = useCallback(async (userId: string, showLoader: boolean) => {
    const requestId = ++requestIdRef.current;

    if (showLoader) {
      setLoading(true);
    }

    try {
      const [rolesResponse, profileResponse] = await Promise.all([
        supabase.from("user_roles").select("role, org_id").eq("user_id", userId),
        supabase.from("profiles").select("status").eq("user_id", userId).maybeSingle(),
      ]);

      if (requestId !== requestIdRef.current) return;

      const { data: rolesData, error: rolesError } = rolesResponse;
      if (rolesError) {
        console.error("Failed to load user roles:", rolesError.message);
      } else {
        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData.map((r) => r.role));
          const orgRole = rolesData.find((r) => r.org_id);
          setOrgId(orgRole?.org_id ?? null);
        } else {
          setRoles([]);
          setOrgId(null);
        }
      }

      const { data: profile, error: profileError } = profileResponse;
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Failed to load profile status:", profileError.message);
      } else {
        setStatus(profile?.status ?? "active");
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Auth synchronization failed:", error);
    } finally {
      if (showLoader && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleSessionChange = useCallback((event: AuthChangeEvent, nextSession: Session | null) => {
    setSession(nextSession);
    const nextUser = nextSession?.user ?? null;

    if (!nextUser) {
      requestIdRef.current += 1;
      userIdRef.current = null;
      initializedRef.current = true;
      clearAuthState();
      setLoading(false);
      return;
    }

    setUser(nextUser);

    const isFirstLoad = !initializedRef.current;
    const identityChanged = userIdRef.current !== nextUser.id;
    userIdRef.current = nextUser.id;
    initializedRef.current = true;

    const shouldShowLoader = isFirstLoad || identityChanged;
    const shouldRefreshContext = shouldShowLoader || event === "USER_UPDATED";

    if (shouldRefreshContext) {
      void fetchUserContext(nextUser.id, shouldShowLoader);
    }
  }, [clearAuthState, fetchUserContext]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!isMounted) return;
      handleSessionChange("INITIAL_SESSION", currentSession);
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;
      handleSessionChange(event, nextSession);
    });

    return () => {
      isMounted = false;
      requestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const signOut = async () => {
    requestIdRef.current += 1;
    clearAuthState();
    setLoading(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, orgId, status, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
