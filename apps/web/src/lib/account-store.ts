"use client";

import { setSessionTokens, clearActiveSession, clearSession } from "./session";

export interface StoredAccount {
  userId: string;
  email: string;
  displayName?: string;
  role: string;
  organizationId?: string;
  orgSlug?: string;
  orgName?: string;
  token: string;
  refreshToken?: string;
  isActive?: boolean;
  avatarColor?: string;
  lastActive?: number;
}

const STORAGE_KEY = "cellsinbox_accounts";
const ACTIVE_KEY = "activeAccountId";
const TOKEN_KEY = "accessToken";

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-rose-600",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-cyan-600",
  "bg-amber-600",
];

export function getAvatarColorForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveAccount(): StoredAccount | null {
  if (typeof window === "undefined") return null;
  const accounts = getStoredAccounts();
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (activeId) {
    const found = accounts.find((a) => a.userId === activeId);
    if (found) return found;
  }
  return accounts.length > 0 ? accounts[0] : null;
}

export function saveAccount(account: StoredAccount): void {
  if (typeof window === "undefined") return;
  const accounts = getStoredAccounts();
  const existingIndex = accounts.findIndex(
    (a) => a.userId === account.userId || a.email.toLowerCase() === account.email.toLowerCase(),
  );

  const accountToSave: StoredAccount = {
    ...account,
    avatarColor: account.avatarColor || getAvatarColorForEmail(account.email),
    lastActive: Date.now(),
  };

  if (existingIndex >= 0) {
    const existing = accounts[existingIndex];
    accounts[existingIndex] = {
      ...existing,
      ...accountToSave,
      refreshToken: accountToSave.refreshToken || existing.refreshToken,
    };
    accountToSave.refreshToken = accounts[existingIndex].refreshToken;
  } else {
    accounts.push(accountToSave);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  localStorage.setItem(ACTIVE_KEY, accountToSave.userId);
  setSessionTokens(accountToSave.token, accountToSave.refreshToken);
}

export function switchAccount(userId: string): StoredAccount | null {
  if (typeof window === "undefined") return null;
  const accounts = getStoredAccounts();
  const target = accounts.find((a) => a.userId === userId);
  if (!target) return null;

  target.lastActive = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  localStorage.setItem(ACTIVE_KEY, target.userId);
  setSessionTokens(target.token, target.refreshToken);
  return target;
}

export function removeAccount(userId: string): StoredAccount | null {
  if (typeof window === "undefined") return null;
  let accounts = getStoredAccounts();
  accounts = accounts.filter((a) => a.userId !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));

  if (localStorage.getItem(ACTIVE_KEY) === userId) {
    if (accounts.length > 0) {
      const next = accounts[0];
      localStorage.setItem(ACTIVE_KEY, next.userId);
      setSessionTokens(next.token, next.refreshToken);
      return next;
    } else {
      clearSession();
      return null;
    }
  }
  return getActiveAccount();
}

export function clearAllAccounts(): void {
  clearSession();
}
