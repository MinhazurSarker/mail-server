"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/context/theme-context";
import { getLanguage, languages } from "@/i18n/languages";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  CheckIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  SystemIcon,
} from "@/icons";
import { cn } from "@/utils";
import { useLocale } from "next-intl";
import { useState } from "react";

const timeOptions = [
  "UTC",
  "Pacific (PST)",
  "Eastern (EST)",
  "Central Europe (CET)",
];

export default function Preference() {
  const { themeMode, setThemeMode } = useTheme();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTime, setSelectedTime] = useState("UTC");

  const currentLang = getLanguage(locale);

  const handleSelectLanguage = (id: Locale) => {
    router.replace(pathname, { locale: id });
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Preference
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Theme Row */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Theme
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select your default theme
            </p>
          </div>

          <ToggleGroup
            value={[themeMode]}
            onValueChange={(values) => {
              if (values.length > 0 && values[0]) {
                setThemeMode(values[0] as "light" | "dark" | "auto");
              }
            }}
            className="flex items-center gap-3"
          >
            <ToggleGroupItem
              value="light"
              className={cn(
                "flex h-auto w-23 flex-col items-center justify-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition",
                themeMode === "light"
                  ? "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5",
              )}
            >
              <SunIcon className="size-5" />
              <span>Light</span>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="dark"
              className={cn(
                "flex h-auto w-23 flex-col items-center justify-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition",
                themeMode === "dark"
                  ? "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5",
              )}
            >
              <MoonIcon className="size-5" />
              <span>Dark</span>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="auto"
              className={cn(
                "flex h-auto w-23 flex-col items-center justify-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition",
                themeMode === "auto"
                  ? "border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5",
              )}
            >
              <SystemIcon className="size-5" />
              <span>Auto</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Language Row */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Language
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <span>{currentLang.shortName || currentLang.name}</span>
              <ChevronDownIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-2">
              {languages.map((language) => {
                const isSelected = locale === language.id;
                const FlagIcon = language.FlagIcon;

                return (
                  <DropdownMenuItem
                    key={language.id}
                    onClick={() => handleSelectLanguage(language.id)}
                    className={cn(
                      "flex items-center justify-between gap-2",
                      isSelected &&
                        "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full transition-opacity",
                          isSelected
                            ? "bg-brand-500 opacity-100 dark:bg-brand-400"
                            : "opacity-0",
                        )}
                      />
                      <FlagIcon className="size-5 shrink-0 overflow-hidden rounded-full" />
                      <span className="truncate">{language.name}</span>
                    </span>

                    {language.badge && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                        {language.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Time Row */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Time
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <span>{selectedTime}</span>
              <ChevronDownIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-2">
              {timeOptions.map((timeOption) => {
                const isSelected = selectedTime === timeOption;
                return (
                  <DropdownMenuItem
                    key={timeOption}
                    onClick={() => setSelectedTime(timeOption)}
                    className={cn(
                      "flex items-center justify-between gap-2",
                      isSelected &&
                        "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
                    )}
                  >
                    <span>{timeOption}</span>
                    {isSelected && (
                      <CheckIcon className="size-4 text-brand-500 dark:text-brand-400" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}
