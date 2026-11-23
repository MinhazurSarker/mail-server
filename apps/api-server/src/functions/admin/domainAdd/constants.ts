import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  name: Type.String({ minLength: 3 }),
});

export const outputSchema = Type.Object({
  domain: Type.Object({
    id: Type.String(),
    name: Type.String(),
    verificationToken: Type.String(),
    dkimSelector: Type.String(),
    dkimPublicKey: Type.String(),
  }),
});
