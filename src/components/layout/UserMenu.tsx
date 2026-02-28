import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, User, FileText, LogOut } from "lucide-react";
import { isPlatformStaff, isOrganization, isJobSeeker } from "@/lib/roles";

const UserMenu = () => {
  const { user, roles, signOut } = useAuth();

  if (!user) return null;

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2)
    : user.email?.slice(0, 2)?.toUpperCase() ?? "U";

  const dashboardPath = isPlatformStaff(roles)
    ? "/admin"
    : isOrganization(roles)
    ? "/portal/dashboard"
    : isJobSeeker(roles)
    ? "/talents/dashboard"
    : "/";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary/20 transition-colors hover:border-primary">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <Link to={dashboardPath} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            لوحة التحكم
          </Link>
        </DropdownMenuItem>
        {isJobSeeker(roles) && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/talents/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                الملف المهني
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/talents/applications" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                طلباتي
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
