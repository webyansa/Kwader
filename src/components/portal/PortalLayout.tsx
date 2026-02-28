import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import PortalSidebar from "./PortalSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const PortalLayout = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30" dir="rtl">
        <PortalSidebar />
        <div className="flex-1 flex flex-col">
          {/* Premium header with subtle gradient */}
          <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="ml-1" />
              <div className="h-5 w-px bg-border" />
              <span className="text-sm font-medium text-muted-foreground">بوابة الكيانات</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PortalLayout;
