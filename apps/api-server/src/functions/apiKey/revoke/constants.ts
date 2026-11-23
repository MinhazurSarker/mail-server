import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  apiKeyId: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
