import { LayoutDashboard, User, FileText, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "لوحة التحكم", url: "/talents/dashboard", icon: LayoutDashboard },
  { title: "الملف المهني", url: "/talents/profile", icon: User },
  { title: "طلباتي", url: "/talents/applications", icon: FileText },
  { title: "الإعدادات", url: "/talents/settings", icon: Settings },
];

const TalentsSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" side="right" className="border-l-0 border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-foreground">بوابة الكوادر</p>
              <p className="text-[10px] text-muted-foreground">ملفك المهني</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/talents/dashboard"} className="hover:bg-sidebar-accent/50 transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="ml-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Separator className="mb-2" />
        <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          {!collapsed && "تسجيل الخروج"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default TalentsSidebar;
