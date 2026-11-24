import { checkAuth } from "@/server/middleware/checkAuth";
import TenantAdminPage from "./OrgAdminClient";

interface OrgAdminPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgAdminPage({ params }: OrgAdminPageProps) {
  return checkAuth(
    ["PLATFORM_ADMIN", "SOVEREIGN_ADMIN", "ORG_ADMIN"],
    async (user) => {
      const { slug } = await params;
      return <TenantAdminPage slug={slug} currentUser={user} />;
    },
    "/login",
  );
}
