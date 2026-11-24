import { createRpcClient } from "@cellsweb/rpc-client";
import { clearActiveSession } from "./session";

export const API_BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.INTERNAL_API_URL ||
       process.env.NEXT_PUBLIC_API_URL ||
       (process.env.NODE_ENV === "production" ? "http://api_server:4000" : "http://localhost:4001"));
export const WS_BASE_URL = API_BASE_URL.replace(/^http/i, "ws");

export const rpc = createRpcClient({
  baseUrl: API_BASE_URL,
  defaultHeaders: (): Record<string, string> => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("accessToken");
      if (!token) {
        const match = document.cookie.match(/(?:^|;\s*)authorization=(?:Bearer\s+)?([^;]+)/);
        if (match) token = match[1];
      }
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return {};
  },
});

export async function rpcCall<T = any>(
  namespace: string,
  functionName: string,
  data: any = {},
  headers?: Record<string, string>,
): Promise<T> {
  const requestToken =
    headers?.Authorization?.replace(/^Bearer\s+/i, "") ||
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  try {
    return await rpc.request({
      namespace,
      functionName,
      data,
      headers,
    });
  } catch (err: any) {
    if (typeof window !== "undefined") {
      const msg = (err?.message || "").toLowerCase();
      const isAuthError =
        msg.includes("unauthorized") ||
        msg.includes("jwt expired") ||
        msg.includes("invalid token") ||
        msg.includes("invalid or expired session token") ||
        msg.includes("session has been revoked") ||
        msg.includes("authentication required") ||
        err?.status === 401;

      if (isAuthError) {
        const currentActiveToken = localStorage.getItem("accessToken");
        // Only clear active session and redirect if the failed request belonged to the currently active identity
        if (!requestToken || requestToken === currentActiveToken) {
          clearActiveSession();
          if (
            !window.location.pathname.startsWith("/login") &&
            !window.location.pathname.startsWith("/onboarding")
          ) {
            window.location.href = `/login?reauth=1&redirect=${encodeURIComponent(window.location.pathname)}`;
          }
        } else {
          // Stale request from a background/switched account; remove only the revoked account from saved list
          try {
            const raw = localStorage.getItem("cellsinbox_accounts");
            if (raw) {
              const accounts = JSON.parse(raw);
              const filtered = accounts.filter((a: any) => a.token !== requestToken);
              localStorage.setItem("cellsinbox_accounts", JSON.stringify(filtered));
            }
          } catch {
            // ignore
          }
        }
      }
    }
    throw err;
  }
}
