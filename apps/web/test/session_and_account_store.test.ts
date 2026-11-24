import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// Setup browser DOM environment for testing localStorage and document.cookie
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "https://webmail.cellsweb.com",
});

(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).localStorage = dom.window.localStorage;

import { setSessionTokens, clearActiveSession, clearSession } from "../src/lib/session.js";
import {
  saveAccount,
  getStoredAccounts,
  getActiveAccount,
  switchAccount,
  removeAccount,
} from "../src/lib/account-store.js";

test("Priority 4: Frontend Session and Multi-Account Isolation", async (t) => {
  t.beforeEach(() => {
    localStorage.clear();
    document.cookie = "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  await t.test("1. setSessionTokens preserves refreshToken when undefined/omitted", () => {
    // Initial login with access and refresh tokens
    setSessionTokens("access_token_1", "refresh_token_1");
    assert.equal(localStorage.getItem("accessToken"), "access_token_1");
    assert.equal(localStorage.getItem("refreshToken"), "refresh_token_1");

    // Later call omitting refreshToken parameter (e.g. token refreshed or profile saved)
    setSessionTokens("access_token_new");
    assert.equal(localStorage.getItem("accessToken"), "access_token_new");
    assert.equal(
      localStorage.getItem("refreshToken"),
      "refresh_token_1",
      "Omitting refreshToken must not delete the existing refresh token!",
    );
  });

  await t.test("2. saveAccount preserves refreshToken across profile updates", () => {
    // Initial login saves account with refresh token
    saveAccount({
      userId: "user_1",
      email: "user1@cellsweb.com",
      role: "MAILBOX_USER",
      token: "token_1",
      refreshToken: "refresh_1",
    });

    const stored1 = getStoredAccounts();
    assert.equal(stored1[0].refreshToken, "refresh_1");
    assert.equal(localStorage.getItem("refreshToken"), "refresh_1");

    // Profile update saves account without refreshToken field
    saveAccount({
      userId: "user_1",
      email: "user1@cellsweb.com",
      displayName: "Updated User 1",
      role: "MAILBOX_USER",
      token: "token_1",
    });

    const stored2 = getStoredAccounts();
    assert.equal(
      stored2[0].refreshToken,
      "refresh_1",
      "Account update must preserve stored refreshToken!",
    );
    assert.equal(
      localStorage.getItem("refreshToken"),
      "refresh_1",
      "localStorage must still have refreshToken!",
    );
  });

  await t.test("3. Multi-account switching restores account-specific tokens", () => {
    saveAccount({
      userId: "account_a",
      email: "a@cellsweb.com",
      role: "MAILBOX_USER",
      token: "token_a",
      refreshToken: "refresh_a",
    });

    saveAccount({
      userId: "account_b",
      email: "b@cellsweb.com",
      role: "MAILBOX_USER",
      token: "token_b",
      refreshToken: "refresh_b",
    });

    assert.equal(localStorage.getItem("accessToken"), "token_b");
    assert.equal(localStorage.getItem("refreshToken"), "refresh_b");

    // Switch back to account A
    const activeA = switchAccount("account_a");
    assert.equal(activeA?.userId, "account_a");
    assert.equal(localStorage.getItem("accessToken"), "token_a");
    assert.equal(localStorage.getItem("refreshToken"), "refresh_a");
    assert.equal(document.cookie.includes("token_a"), true);
  });

  await t.test("4. clearActiveSession does not wipe other stored accounts", () => {
    saveAccount({
      userId: "account_a",
      email: "a@cellsweb.com",
      role: "MAILBOX_USER",
      token: "token_a",
      refreshToken: "refresh_a",
    });

    saveAccount({
      userId: "account_b",
      email: "b@cellsweb.com",
      role: "MAILBOX_USER",
      token: "token_b",
      refreshToken: "refresh_b",
    });

    // Clear active session (account B)
    clearActiveSession();

    assert.equal(localStorage.getItem("accessToken"), null);
    assert.equal(localStorage.getItem("refreshToken"), null);

    // Stored accounts list must NOT be wiped!
    const remaining = getStoredAccounts();
    assert.equal(remaining.length, 2, "Stored accounts list must be preserved!");
  });
});
