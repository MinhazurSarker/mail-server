"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { DetailsContentProps } from "./types";

export default function DetailsContent({ email }: DetailsContentProps) {
  const [loadRemoteImages, setLoadRemoteImages] = useState(false);
  const [format, setFormat] = useState<"html" | "text">("html");

  const initial = (email.sender || "U").charAt(0).toUpperCase();
  const hasHtml = Boolean(email.html);

  // Check if HTML contains potential remote images
  const hasRemoteImages = Boolean(email.html && /<img[^>]+src=["'](http|\/\/)/i.test(email.html));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Sender Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <div className="flex items-center gap-3.5">
          <Avatar size="lg">
            <AvatarFallback className="bg-brand-500 font-bold text-white text-base">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {email.subject || "(no subject)"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {email.sender}
              </span>{" "}
              &lt;{email.email}&gt;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasHtml && (
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-700">
              <button
                type="button"
                onClick={() => setFormat("html")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  format === "html"
                    ? "bg-brand-500 text-white font-medium shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setFormat("text")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  format === "text"
                    ? "bg-brand-500 text-white font-medium shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Text
              </button>
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {email.date} {email.time && `(${email.time})`}
          </span>
        </div>
      </div>

      {/* Remote Images Privacy Shield */}
      {hasRemoteImages && !loadRemoteImages && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span>Remote images have been blocked to protect your privacy and IP address.</span>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setLoadRemoteImages(true)}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            Load Images
          </Button>
        </div>
      )}

      {/* Body Content */}
      <div className="min-h-[200px] text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {format === "html" && email.html ? (
          <div
            className="prose dark:prose-invert max-w-none [&_a]:text-brand-500 [&_a]:underline"
            dangerouslySetInnerHTML={{
              __html: loadRemoteImages
                ? email.html
                : email.html.replace(/<img[^>]+src=["'](http|\/\/)[^"']*["'][^>]*>/gi, "[Remote image hidden]"),
            }}
          />
        ) : (
          <div className="whitespace-pre-wrap font-sans">
            {email.text || email.content}
          </div>
        )}
      </div>
    </div>
  );
}
