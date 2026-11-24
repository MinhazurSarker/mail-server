"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rpcCall } from "@/lib/api";

export interface AuthenticatedUser {
  id: string;
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  displayName?: string;
  orgSlug?: string;
  orgName?: string;
}

export const checkAuth = async (
  roles: string[] = [],
  callback: (user: AuthenticatedUser) => Promise<any>,
  redirectPath?: string,
) => {
  try {
    const cookieStore = await cookies();
    const authorization = cookieStore.get("authorization")?.value;
    if (!authorization) {
      return redirect(redirectPath || "/login");
    }

    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return redirect(redirectPath || "/login?reauth=1");
    }

    // Validate token against auth.me
    const me = await rpcCall<any>(
      "auth",
      "me",
      {},
      { Authorization: `Bearer ${token}` },
    );

    if (!me || !me.email) {
      return redirect(redirectPath || "/login?reauth=1");
    }

    const authenticatedUser: AuthenticatedUser = {
      id: me.userId || me.id || "",
      userId: me.userId || me.id || "",
      email: me.email,
      role: me.role,
      organizationId: me.organizationId,
      displayName: me.displayName || me.email.split("@")[0],
      orgSlug: me.orgSlug,
      orgName: me.orgName,
    };

    if (roles.length > 0 && !roles.includes(authenticatedUser.role)) {
      return redirect(authenticatedUser.role === "MAILBOX_USER" ? "/inbox" : (redirectPath || "/login?reauth=1"));
    }

    return await callback(authenticatedUser);
  } catch (error: any) {
    if (
      error instanceof Error &&
      (error.message === "NEXT_REDIRECT" ||
        (error as any).digest?.startsWith("NEXT_REDIRECT"))
    ) {
      throw error;
    }
    return redirect(redirectPath || "/login?reauth=1");
  }
};
