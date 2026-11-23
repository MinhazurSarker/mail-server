import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { generateThemeCss } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CellsInbox — Enterprise Mail",
  description: "Sovereign multi-tenant email platform & webmail",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const host = headerList.get("host") || "";

  let branding = {
    isCustom: false,
    name: "CellsInbox",
    primaryColor: "#0ea5e9",
    faviconUrl: undefined as string | undefined,
  };

  try {
    const apiInternal = process.env.INTERNAL_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiInternal}/api/rpc/auth/branding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host }),
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.isCustom || data.primaryColor)) {
        branding = { ...branding, ...data };
      }
    }
  } catch {
    // Fallback gracefully during build or if API server is booting
  }

  const dynamicCss = generateThemeCss({
    primaryColor: branding.primaryColor,
    roundness: "rounded",
  });

  return (
    <html lang="en" className={cn("dark", "font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        {branding.faviconUrl && (
          <link rel="icon" href={branding.faviconUrl} />
        )}
        {/* Dynamic Tenant Theming Engine (CellsCommerce Trick) */}
        <style
          id="cellsinbox-dynamic-theme"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: dynamicCss,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
