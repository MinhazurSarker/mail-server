"use client";

import { useEffect } from "react";
import { applyDynamicTheme } from "@/lib/theme";
import { rpcCall } from "@/lib/api";

export function DynamicThemeSync() {
  useEffect(() => {
    // 1. Initial client-side sync from API to guarantee freshest branding
    rpcCall<any>("auth", "branding", { host: window.location.hostname })
      .then((res) => {
        if (res && (res.primaryColor || res.faviconUrl)) {
          applyDynamicTheme({
            primaryColor: res.primaryColor,
            faviconUrl: res.faviconUrl,
          });
        }
      })
      .catch(() => {});

    // 2. React to dynamic updates without page reload
    const handleUpdate = (e: any) => {
      if (e.detail) {
        applyDynamicTheme({
          primaryColor: e.detail.primaryColor,
          faviconUrl: e.detail.faviconUrl,
        });
      }
    };

    window.addEventListener("cellsinbox:branding-updated", handleUpdate);
    return () => window.removeEventListener("cellsinbox:branding-updated", handleUpdate);
  }, []);

  return null;
}
