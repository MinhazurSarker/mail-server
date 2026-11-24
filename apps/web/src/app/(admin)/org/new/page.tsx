import { checkAuth } from "@/server/middleware/checkAuth";
import NewOrganizationPageClient from "./NewOrgClient";

export default async function NewOrgPage() {
  return checkAuth(
    ["PLATFORM_ADMIN", "SOVEREIGN_ADMIN"],
    async (user) => {
      return <NewOrganizationPageClient currentUser={user} />;
    },
    "/login",
  );
}
