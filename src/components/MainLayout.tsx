import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border bg-card px-4 gap-4">
            <SidebarTrigger className="hover:bg-secondary rounded-md p-2 transition-colors">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </SidebarTrigger>
            <div className="flex-1" />
          </header>
          <div className="flex-1 p-6 bg-background">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
