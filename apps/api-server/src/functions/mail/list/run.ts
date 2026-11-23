import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { MailService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) {
    throw new Error("Unauthorized: Session required.");
  }

  const result = await MailService.listUserMailbox({
    userId: authUser.userId,
    folder: input.folder,
    page: input.page,
    limit: input.limit,
    isStarred: input.isStarred,
    isRead: input.isRead,
    search: input.search,
  });

  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      date: item.date instanceof Date ? item.date.toISOString() : item.date,
    })),
  };
};
