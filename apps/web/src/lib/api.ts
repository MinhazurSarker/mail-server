import { createRpcClient } from "@cellsweb/rpc-client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const WS_BASE_URL = API_BASE_URL.replace(/^http/i, "ws");

export const rpc = createRpcClient({
  baseUrl: API_BASE_URL,
  defaultHeaders: (): Record<string, string> => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
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
  return await rpc.request({
    namespace,
    functionName,
    data,
    headers,
  });
}
