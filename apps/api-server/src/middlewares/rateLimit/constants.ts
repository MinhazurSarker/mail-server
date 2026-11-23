import { Type } from "@sinclair/typebox";

export const metadata = {
  name: "rateLimit",
  description: "Enforces per-function rate limits keyed on IP + namespace + functionName",
};

export const optionsSchema = Type.Object({
  windowSeconds: Type.Number({ minimum: 1, default: 60, description: "Time window duration in seconds" }),
  maxRequests: Type.Number({ minimum: 1, default: 100, description: "Maximum requests allowed within window" }),
});
