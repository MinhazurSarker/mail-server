import { connectToDatabase, disconnectDatabase } from "@cellsinbox/db";
import { OrganizationService, DomainService, UserService, AuthService } from "../src/index.js";
import { authenticator } from "otplib";

async function runTest() {
  console.log("=== [TEST] Starting Phase 2 Authentication Flow Verification ===");
  await connectToDatabase();
  console.log("✓ Connected to MongoDB");

  const orgSlug = `test-org-${Date.now()}`;
  const domainName = `${orgSlug}.local`;
  const userEmail = `alice@${domainName}`;

  // 1. Create Organization
  const org = await OrganizationService.createOrganization({
    name: "Test Organization",
    slug: orgSlug,
  });
  console.log(`✓ Organization created: ${org.name} (id: ${org._id})`);

  // 2. Add Domain
  const domain = await DomainService.addDomain(org._id.toString(), domainName);
  console.log(`✓ Domain added: ${domain.name} (DKIM selector: ${domain.dkimSelector})`);

  // 3. Admin creates User with temporary password
  const { user, temporaryPassword } = await UserService.createUser({
    organizationId: org._id.toString(),
    domainId: domain._id.toString(),
    email: userEmail,
    displayName: "Alice Tester",
    role: "MAILBOX_USER",
  });
  console.log(`✓ User created: ${user.email} (Status: ${user.status}, Temp Pass: ${temporaryPassword})`);

  if (user.status !== "PENDING_SECURITY_SETUP") {
    throw new Error(`Expected status PENDING_SECURITY_SETUP, got: ${user.status}`);
  }

  // 4. User attempts first login with temporary password
  const validatedUser = await AuthService.validatePassword(userEmail, temporaryPassword);
  console.log(`✓ First login credential validation succeeded for: ${validatedUser.email}`);

  // 5. Generate TOTP Setup Secret & URI
  const totpSetup = AuthService.generateTotpSetup(validatedUser);
  console.log(`✓ TOTP Setup generated (Secret: ${totpSetup.secret})`);

  // 6. Complete Mandatory Onboarding
  const validToken = authenticator.generate(totpSetup.secret);
  const permanentPassword = "PermanentPassword2026!";

  const onboardingResult = await AuthService.completeFirstLoginSecuritySetup({
    userId: validatedUser._id.toString(),
    newPassword: permanentPassword,
    totpSecret: totpSetup.secret,
    totpToken: validToken,
  });

  console.log(`✓ Onboarding completed! User status: ${onboardingResult.user.status}`);
  if (onboardingResult.user.status !== "ACTIVE") {
    throw new Error(`Expected status ACTIVE, got: ${onboardingResult.user.status}`);
  }

  // 7. Verify JWT Tokens
  const verifiedToken = await AuthService.verifyAccessToken(onboardingResult.tokens.accessToken);
  console.log(`✓ Access Token verified: email=${verifiedToken.email}, role=${verifiedToken.role}`);

  // 8. Subsequent Login with New Password & TOTP
  const subsequentUser = await AuthService.validatePassword(userEmail, permanentPassword);
  console.log(`✓ Subsequent password login succeeded with new permanent password`);

  const secondValidToken = authenticator.generate(totpSetup.secret);
  const is2FAValid = await AuthService.verifyTotpCode(subsequentUser._id.toString(), secondValidToken);
  console.log(`✓ 2-Step Verification TOTP challenge validated: ${is2FAValid}`);

  if (!is2FAValid) {
    throw new Error("2FA code validation failed");
  }

  const finalTokens = await AuthService.generateTokens(subsequentUser);
  console.log(`✓ Final active session tokens issued: accessToken length = ${finalTokens.accessToken.length}`);

  await disconnectDatabase();
  console.log("=== [SUCCESS] Phase 2 Authentication & Mandatory Onboarding Fully Verified! ===");
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
