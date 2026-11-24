import { defineMiddlewares } from "@cellsweb/rpc-core";

export const middlewares = defineMiddlewares([
  { name: "rateLimit", options: { windowSeconds: 60, maxRequests: 20 } },
]);
