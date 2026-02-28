import { LayoutDashboard, Briefcase, FileText, Users, CreditCard, Settings, LogOut, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "لوحة التحكم", url: "/portal/dashboard", icon: LayoutDashboard },
  { title: "ملف الجمعية", url: "/portal/profile", icon: Building2 },
  { title: "الوظائف", url: "/portal/jobs", icon: Briefcase },
  { title: "الطلبات الواردة", url: "/portal/applications", icon: FileText },
  { title: "الفريق", url: "/portal/team", icon: Users },
  { title: "الاشتراك", url: "/portal/billing", icon: CreditCard },
  { title: "الإعدادات", url: "/portal/settings", icon: Settings },
];

const PortalSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" side="right" className="border-l-0 border-r-0">
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent shadow-sm">
            <Building2 className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-sidebar-primary truncate">كوادر</p>
              <p className="text-[11px] text-sidebar-foreground/60">بوابة الكيانات</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/portal/dashboard"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="h-px bg-sidebar-border mb-3" />
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "تسجيل الخروج"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default PortalSidebar;
