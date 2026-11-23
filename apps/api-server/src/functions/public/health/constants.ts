import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "CellsInbox health check endpoint",
  deprecated: false,
  tags: ["system"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  status: Type.String(),
  version: Type.String(),
  timestamp: Type.String(),
});
