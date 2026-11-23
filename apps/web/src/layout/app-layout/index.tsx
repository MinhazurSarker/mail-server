"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/layout/app-layout/header";
import AppSidebar from "@/layout/app-layout/sidebar";
import { cn } from "@/utils";

export default function AppLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SidebarProvider defaultOpen={true} className="min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col min-w-0 w-full flex-1">
        <AppHeader />
        <div className={cn("flex-1 min-w-0 w-full p-4 md:p-6", className)}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
