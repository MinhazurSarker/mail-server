import { createRpcClient } from "@cellsweb/rpc-client";
import { clearSession } from "./session";

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
      if (
        msg.includes("unauthorized") ||
        msg.includes("jwt expired") ||
        msg.includes("invalid token") ||
        msg.includes("invalid or expired session token") ||
        msg.includes("session has been revoked") ||
        msg.includes("authentication required") ||
        err?.status === 401
      ) {
        clearSession();
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/onboarding")
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
    throw err;
  }
}
