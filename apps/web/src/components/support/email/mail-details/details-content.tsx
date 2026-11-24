"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import type { DetailsContentProps } from "./types";
import SafeEmailViewer from "@/components/support/email/safe-email-viewer";

export default function DetailsContent({ email }: DetailsContentProps) {
  const [loadRemoteImages, setLoadRemoteImages] = useState(false);
  const [format, setFormat] = useState<"html" | "text">("html");

  const initial = (email.sender || "U").charAt(0).toUpperCase();
  const hasHtml = Boolean(email.html);

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

      {/* Safe Sandboxed Message Body */}
      <SafeEmailViewer
        html={email.html}
        text={email.text || email.content}
        format={format}
        allowRemoteImages={loadRemoteImages}
        onLoadRemoteImages={() => setLoadRemoteImages(true)}
      />
    </div>
  );
}
