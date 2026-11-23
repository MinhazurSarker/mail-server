import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      isVerified: Type.Boolean(),
      verificationToken: Type.String(),
      dkimSelector: Type.String(),
      dkimPublicKey: Type.String(),
      spfStatus: Type.String(),
      dkimStatus: Type.String(),
      dmarcStatus: Type.String(),
      mxStatus: Type.String(),
      createdAt: Type.String(),
    }),
  ),
});
