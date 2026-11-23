import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  domainId: Type.String(),
});

export const outputSchema = Type.Object({
  isVerified: Type.Boolean(),
  spfStatus: Type.String(),
  dkimStatus: Type.String(),
  mxStatus: Type.String(),
});
