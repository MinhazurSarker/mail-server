export type Locale = "en" | "ar" | "es" | "de";

export const routing = {
  locales: ["en", "ar", "es", "de"] as const,
  defaultLocale: "en" as const,
};
