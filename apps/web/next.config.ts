import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@cellsinbox/schema", "@cellsweb/rpc-client"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || "http://localhost:4000";
    return [
      {
        source: "/rpc",
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
