import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@cellsinbox/schema", "@cellsweb/rpc-client"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  async rewrites() {
    const backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production" ? "http://api_server:4000" : "http://localhost:4001");
    return [
      {
        source: "/rpc",
        destination: `${backendUrl}/rpc`,
      },
      {
        source: "/api/rpc",
        destination: `${backendUrl}/rpc`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/ws",
        destination: `${backendUrl}/ws`,
      },
    ];
  },
};

export default nextConfig;
