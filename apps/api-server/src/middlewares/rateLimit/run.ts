import type { Static } from "@sinclair/typebox";
import { AppError, ErrorCode, type MiddlewareFn } from "@cellsweb/rpc-core";
import { LRUCache } from "lru-cache";
import { RateLimiterAbstract, RateLimiterMemory } from "rate-limiter-flexible";
import { optionsSchema } from "./constants.js";

type Options = Static<typeof optionsSchema>;

const limiterCache = new LRUCache<string, RateLimiterAbstract>({
  max: 256,
});

function getOrCreateLimiter(
  windowSeconds: number,
  maxRequests: number,
): RateLimiterAbstract {
  const key = `${windowSeconds}:${maxRequests}`;
  let limiter = limiterCache.get(key);

  if (!limiter) {
    limiter = new RateLimiterMemory({
      duration: windowSeconds,
      points: maxRequests,
    });
    limiterCache.set(key, limiter);
  }

  return limiter;
}

export const run: MiddlewareFn<Options> = async ({ options }, context) => {
  const { windowSeconds, maxRequests } = options;
  const { ip, namespace, functionName } = context;

  const limiter = getOrCreateLimiter(windowSeconds, maxRequests);
  const rateLimitKey = `${ip || "127.0.0.1"}:${namespace}:${functionName}`;

  try {
    await limiter.consume(rateLimitKey, 1);
  } catch {
    throw new AppError(
      ErrorCode.RATE_LIMITED,
      `Rate limit exceeded for ${namespace}.${functionName}. Maximum ${maxRequests} requests per ${windowSeconds}s.`,
    );
  }

  return context;
};
