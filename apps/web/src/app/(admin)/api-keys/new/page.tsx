import { checkAuth } from "@/server/middleware/checkAuth";
import NewApiKeyClient from "./NewApiKeyClient";

export default async function NewApiKeyPage() {
  return checkAuth(
    [],
    async (user) => {
      return <NewApiKeyClient currentUser={user} />;
    },
    "/login",
  );
}
