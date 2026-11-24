import { checkAuth } from "@/server/middleware/checkAuth";
import ApiKeysClient from "./ApiKeysClient";

export default async function ApiKeysPage() {
  return checkAuth(
    [],
    async (user) => {
      return <ApiKeysClient currentUser={user} />;
    },
    "/login",
  );
}
