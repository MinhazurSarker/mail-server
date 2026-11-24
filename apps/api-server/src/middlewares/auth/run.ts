/**
 * middlewares/auth/run.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth middleware — validates JWT bearer token or API key and injects auth claims.
 * Enforces session token versioning (revocation), account active status,
 * organization active status, and required role-based access control.
 */

import type { Static } from "@sinclair/typebox";
import { AppError, ErrorCode, type MiddlewareFn } from "@cellsweb/rpc-core";
import { AuthService, ApiKeyService } from "@cellsinbox/service";
import { UserModel, OrganizationModel } from "@cellsinbox/db";
import { AuthContextSchema, type UserRole } from "./constants.js";

export type AuthContext = Static<typeof AuthContextSchema>;

export interface AuthMiddlewareOptions {
  roles?: UserRole[];
  optional?: boolean;
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
  const isOptional = options?.optional === true;

  let authContext: AuthContext | null = null;

  // 1. Try JWT Bearer Token first
  if (token) {
    try {
      const payload = await AuthService.verifyAccessToken(token);

      // Verify current user existence and active status in database
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        throw new AppError(ErrorCode.UNAUTHORIZED, "User account no longer exists");
      }

      if (user.status !== "ACTIVE") {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          `Account is ${user.status.toLowerCase()}. Access denied.`,
        );
      }

      // Enforce token versioning (immediate session invalidation on logout / password / 2FA changes)
      const userVersion = user.tokenVersion || 1;
      const payloadVersion = payload.tokenVersion || 1;
      if (userVersion !== payloadVersion) {
        throw new AppError(
          ErrorCode.UNAUTHORIZED,
          "Session has been revoked. Please sign in again.",
        );
      }

      // Enforce organization active status (R9)
      try {
        await AuthService.assertActiveTenant(user);
      } catch (tenantErr: any) {
        throw new AppError(ErrorCode.FORBIDDEN, tenantErr.message || "Organization access denied");
      }

      authContext = {
        userId: user._id.toString(),
        organizationId: user.organizationId.toString(),
        domainId: user.domainId?.toString(),
        email: user.email,
        role: user.role as UserRole,
        status: user.status,
        isApiKey: false,
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid or expired session token");
    }
  }
  // 2. Try SendGrid-Style API Key if provided
  else if (apiKeyHeader) {
    try {
      const apiKey = await ApiKeyService.validateApiKey(apiKeyHeader);

      const user = await UserModel.findById(apiKey.userId);
      if (!user || user.status !== "ACTIVE") {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          "API key owner account is inactive or suspended",
        );
      }

      // Enforce organization active status for API Key owner (R9)
      try {
        await AuthService.assertActiveTenant(user);
      } catch (tenantErr: any) {
        throw new AppError(ErrorCode.FORBIDDEN, tenantErr.message || "Organization access denied");
      }

      authContext = {
        userId: apiKey.userId.toString(),
        organizationId: apiKey.organizationId.toString(),
        email: `apikey:${apiKey.name}`,
        role: "MAILBOX_USER",
        status: "ACTIVE",
        isApiKey: true,
        apiKeyId: apiKey._id.toString(),
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid or revoked API key");
    }
  }

  // 3. Enforce Authentication
  if (!isOptional) {
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
