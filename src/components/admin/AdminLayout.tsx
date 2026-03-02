import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAccessSkeleton from "@/components/auth/AuthAccessSkeleton";

const AdminLayout = () => {
  const { user, roles } = useAuth();

  if (!user) {
    return <AuthAccessSkeleton message="جارٍ تجهيز لوحة التحكم المركزية..." />;
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || "AD";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 lg:px-6 gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="border-0 bg-transparent h-7 w-48 focus-visible:ring-0 text-sm placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="absolute -top-0.5 -left-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">3</span>
              </Button>
              <div className="flex items-center gap-2 mr-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-medium text-foreground leading-tight">{user.user_metadata?.full_name || "المدير"}</p>
                  <p className="text-[10px] text-muted-foreground">{roles[0] === "super_admin" ? "مدير عام" : "مدير"}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
