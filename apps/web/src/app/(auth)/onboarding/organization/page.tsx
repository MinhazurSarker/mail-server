import { checkAuth } from "@/server/middleware/checkAuth";
import OrganizationOnboardingClient from "./OrganizationOnboardingClient";

export default async function OrganizationOnboardingPage() {
  return checkAuth(
    ["PLATFORM_ADMIN", "SOVEREIGN_ADMIN"],
    async (user) => {
      return <OrganizationOnboardingClient />;
    },
    "/login",
  );
}
