"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/navigation";
import AppHeader from "@/layout/app-layout/header";
import AppSidebar from "@/layout/app-layout/sidebar";
import { cn } from "@/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAiRoute =
    pathname.startsWith("/ai-chat") || pathname.startsWith("/ai-settings");

  // Route-specific styles for the main content container
  const getRouteSpecificStyles = () => {
    if (isAiRoute) {
      return "flex-1 min-h-0 flex flex-col";
    }
    return "p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6";
  };

  return (
    <SidebarProvider className={cn(isAiRoute && "h-svh overflow-hidden")}>
      <AppSidebar />

      <SidebarInset className={cn(isAiRoute && "h-svh overflow-hidden")}>
        <AppHeader />

        <div className={getRouteSpecificStyles()}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
