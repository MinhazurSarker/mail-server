import { defineMiddlewares } from "@cellsweb/rpc-core";

export const middlewares = defineMiddlewares([
  { name: "auth" },
]);
