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
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <PortalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Clean minimal header */}
          <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b border-border/60 bg-card/95 backdrop-blur-lg px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="ml-1 text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border/60" />
              <span className="text-[13px] font-medium text-muted-foreground">بوابة الكيانات</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
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
