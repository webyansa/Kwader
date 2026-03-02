import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import AuthAccessSkeleton from "@/components/auth/AuthAccessSkeleton";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, roles, status, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthAccessSkeleton message="جارٍ تجهيز البوابة والتحقق من الصلاحيات..." />;
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (status === "suspended") return <Navigate to="/forbidden" replace state={{ reason: "suspended" }} />;

  if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/forbidden" replace state={{ reason: "insufficient-role" }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
