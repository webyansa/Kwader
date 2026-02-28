import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import PortalSidebar from "./PortalSidebar";

const PortalLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir="rtl">
        <PortalSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-lg px-4">
            <SidebarTrigger className="ml-2" />
            <span className="text-sm font-medium text-muted-foreground">بوابة الكيانات</span>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PortalLayout;
