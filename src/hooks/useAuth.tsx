import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  const fetchUserData = async (userId: string) => {
    // Fetch roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role, org_id")
      .eq("user_id", userId);
    if (rolesData && rolesData.length > 0) {
      setRoles(rolesData.map((r) => r.role));
      const orgRole = rolesData.find((r) => r.org_id);
      setOrgId(orgRole?.org_id ?? null);
    } else {
      setRoles([]);
      setOrgId(null);
    }

    // Fetch profile status
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", userId)
      .single();
    setStatus(profile?.status ?? "active");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setRoles([]);
          setOrgId(null);
          setStatus("active");
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setOrgId(null);
    setStatus("active");
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, orgId, status, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
