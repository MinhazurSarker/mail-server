import { FormatRegistry } from "@sinclair/typebox";

if (!FormatRegistry.Has("email")) {
  FormatRegistry.Set("email", (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  );
}
if (!FormatRegistry.Has("date-time")) {
  FormatRegistry.Set("date-time", (value) => !isNaN(Date.parse(value)));
}

export * from "./entities/organization.js";
export * from "./entities/domain.js";
export * from "./entities/user.js";
export * from "./entities/credential.js";
export * from "./entities/apiKey.js";
export * from "./entities/message.js";
