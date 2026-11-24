"use client";

import { useMemo } from "react";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import {
  buildSandboxedEmailDocument,
  containsRemoteContent,
} from "@/lib/sanitize-email";

export interface SafeEmailViewerProps {
  html?: string;
  text?: string;
  format?: "html" | "text";
  allowRemoteImages?: boolean;
  onLoadRemoteImages?: () => void;
  className?: string;
}

export default function SafeEmailViewer({
  html,
  text,
  format = "html",
  allowRemoteImages = false,
  onLoadRemoteImages,
  className = "",
}: SafeEmailViewerProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasVisibleHtml = Boolean(
    html && html.replace(/<[^>]+>/g, "").trim().length > 0
  );

  const hasRemoteContent = useMemo(
    () => containsRemoteContent(html || ""),
    [html]
  );

  const sandboxedDocument = useMemo(() => {
    if (!html) return "";
    return buildSandboxedEmailDocument(html, {
      allowRemoteImages,
      isDark,
    });
  }, [html, allowRemoteImages, isDark]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Remote Content Privacy Shield */}
      {hasRemoteContent && !allowRemoteImages && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              Remote images and external styles are blocked by default to protect your privacy and IP address.
            </span>
          </div>
          {onLoadRemoteImages && (
            <Button
              size="xs"
              variant="outline"
              onClick={onLoadRemoteImages}
              className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50 cursor-pointer"
            >
              Load Remote Images
            </Button>
          )}
        </div>
      )}

      {/* Message Body Rendering */}
      {format === "html" && hasVisibleHtml ? (
        <div className="w-full min-h-[440px] h-[calc(100vh-320px)] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 overflow-hidden shadow-xs">
          <iframe
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            srcDoc={sandboxedDocument}
            title="Email Message Content"
            className="w-full h-full border-0 block bg-transparent"
          />
        </div>
      ) : (
        <div className="w-full min-h-[260px] p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 font-sans text-sm leading-relaxed text-gray-900 dark:text-gray-100 overflow-auto">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-900 dark:text-gray-100 break-words">
            {text || (html ? html.replace(/<[^>]+>/g, " ").trim() : "(No message body content)")}
          </pre>
        </div>
      )}
    </div>
  );
}
