import { 
  ClipboardList, 
  FileCheck, 
  Truck, 
  CircleDollarSign, 
  Receipt,
  Ship
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "订单列表",
    subtitle: "跟单",
    url: "/orders",
    icon: ClipboardList,
  },
  {
    title: "清关列表",
    subtitle: "跟单",
    url: "/customs",
    icon: FileCheck,
  },
  {
    title: "派送列表",
    subtitle: "跟单",
    url: "/delivery",
    icon: Truck,
  },
  {
    title: "收入确认列表",
    subtitle: "跟单",
    url: "/income",
    icon: CircleDollarSign,
  },
  {
    title: "付款申请列表",
    subtitle: "跟单",
    url: "/payment",
    icon: Receipt,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Ship className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-sidebar-foreground">AdvShip</span>
            <span className="text-xs text-sidebar-muted">清关派送系统</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-sidebar-muted uppercase tracking-wider mb-2">
            业务管理
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        }
                      `}
                    >
                      <NavLink to={item.url}>
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-muted'}`} />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className={`text-xs ${isActive ? 'text-sidebar-primary/70' : 'text-sidebar-muted'}`}>
                            {item.subtitle}
                          </span>
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
