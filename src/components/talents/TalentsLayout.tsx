import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import TalentsSidebar from "./TalentsSidebar";

const TalentsLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir="rtl">
        <TalentsSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-lg px-4">
            <SidebarTrigger className="ml-2" />
            <span className="text-sm font-medium text-muted-foreground">بوابة الكوادر</span>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TalentsLayout;
