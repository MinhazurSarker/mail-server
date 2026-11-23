/**
 * middlewares/auth/run.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth middleware — validates JWT bearer token or API key and injects auth claims.
 */

import type { Static } from "@sinclair/typebox";
import { AppError, ErrorCode, type MiddlewareFn } from "@cellsweb/rpc-core";
import { AuthService, ApiKeyService } from "@cellsinbox/service";
import { AuthContextSchema, type UserRole } from "./constants.js";

export type AuthContext = Static<typeof AuthContextSchema>;

export interface AuthMiddlewareOptions {
  roles?: UserRole[];
}

export const run: MiddlewareFn<AuthMiddlewareOptions> = async (
  params,
  context,
) => {
  const options = params?.options;
  const headers = params?.headers || context.headers || {};
  const authHeader =
    headers["authorization"]?.toString() ??
    headers["token"]?.toString();
  const apiKeyHeader = headers["x-api-key"]?.toString();

  const bodyToken = (params as any)?.body?.token || (params as any)?.data?.token;
  const token =
    authHeader?.replace(/^Bearer\s+/i, "") ??
    (typeof bodyToken === "string" ? bodyToken : undefined);
  const roles = options?.roles;
  const isRolesEmpty = !roles || roles.length === 0;

  let authContext: AuthContext | null = null;

  // 1. Try JWT Bearer Token first
  if (token) {
    try {
      const payload = await AuthService.verifyAccessToken(token);
      authContext = {
        userId: payload.userId,
        organizationId: payload.organizationId,
        domainId: payload.domainId,
        email: payload.email,
        role: payload.role as UserRole,
        status: payload.status,
        isApiKey: false,
      };
    } catch {
      throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid or expired session token");
    }
  }
  // 2. Try SendGrid-Style API Key if provided
  else if (apiKeyHeader) {
    try {
      const apiKey = await ApiKeyService.validateApiKey(apiKeyHeader);
      authContext = {
        userId: apiKey.userId.toString(),
        organizationId: apiKey.organizationId.toString(),
        email: `apikey:${apiKey.name}`,
        role: "MAILBOX_USER",
        status: "ACTIVE",
        isApiKey: true,
        apiKeyId: apiKey._id.toString(),
      };
    } catch {
      throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid or revoked API key");
    }
  }

  // 3. Enforce Authentication
  if (!isRolesEmpty || roles) {
    if (!authContext) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        "Authentication required. Please provide a Bearer token or x-api-key.",
      );
    }

    if (roles && roles.length > 0 && !roles.includes(authContext.role)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        `Insufficient permissions: Requires role [${roles.join(", ")}]`,
      );
    }
  }

  // 4. Return new context with injected auth claims
  if (authContext) {
    return {
      ...context,
      auth: authContext,
    };
  }

  return context;
};
