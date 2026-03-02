import { Outlet, Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import PortalSidebar from "./PortalSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Bell, ExternalLink, Globe, ChevronLeft, Plus, Building2, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { isOrgOwner } from "@/lib/roles";

const breadcrumbMap: Record<string, string> = {
  "/portal/dashboard": "لوحة التحكم",
  "/portal/profile": "ملف الجمعية",
  "/portal/jobs": "الوظائف",
  "/portal/jobs/new": "نشر وظيفة جديدة",
  "/portal/applications": "الطلبات الواردة",
  "/portal/hr": "الموارد البشرية",
  "/portal/hr/employees": "الموظفون",
  "/portal/hr/employees/new": "إضافة موظف",
  "/portal/team": "الفريق",
  "/portal/billing": "الاشتراك",
  "/portal/settings": "الإعدادات",
  "/portal/profile/preview": "معاينة الملف",
  "/portal/profile/submission": "إرسال للمراجعة",
  "/portal/profile/status": "حالة المراجعة",
};

const PortalLayout = () => {
  const { user, roles, signOut } = useAuth();
  const location = useLocation();

  const currentPage = breadcrumbMap[location.pathname] || "بوابة الكيانات";
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2)
    : user?.email?.slice(0, 2)?.toUpperCase() ?? "U";

  const roleLabel = isOrgOwner(roles) ? "مالك الجمعية" : "عضو فريق";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <PortalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Premium Header */}
          <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 md:px-6">
            {/* Right side (RTL) */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border hidden sm:block" />
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 rounded-lg text-xs h-8" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> عرض المنصة
                </a>
              </Button>
            </div>

            {/* Center — Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>بوابة الكيانات</span>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{currentPage}</span>
            </div>

            {/* Left side (RTL) */}
            <div className="flex items-center gap-1.5">
              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                    <Zap className="h-3.5 w-3.5" /> إجراءات سريعة
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/portal/jobs/new" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> نشر وظيفة جديدة
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/portal/profile" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> تحديث ملف الجمعية
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/portal/applications" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> عرض الطلبات
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </Button>

              <ThemeToggle />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 cursor-pointer border border-border transition-colors hover:border-primary/40">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">{roleLabel}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/portal/profile" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> ملف الجمعية
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/portal/settings" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> إعدادات الحساب
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PortalLayout;
