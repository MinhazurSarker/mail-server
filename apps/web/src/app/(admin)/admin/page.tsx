import { checkAuth } from "@/server/middleware/checkAuth";
import PlatformAdminPageClient from "./PlatformAdminClient";

export default async function AdminPage() {
  return checkAuth(
    ["PLATFORM_ADMIN", "SOVEREIGN_ADMIN"],
    async (user) => {
      return <PlatformAdminPageClient currentUser={user} />;
    },
    "/login",
  );
}
