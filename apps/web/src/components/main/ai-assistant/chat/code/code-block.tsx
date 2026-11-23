"use client";

import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Import additional languages
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-markdown";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import { CheckIcon, CodeIcon, CopyIcon, PencilIcon } from "@/icons";
import { CodeBlockProps } from "./types";

export default function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  className = "",
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const preClasses = `rounded-b-[20px] overflow-x-auto p-4 text-white text-sm ${
    showLineNumbers ? "line-numbers" : ""
  } ${className}`.trim();

  return (
    <div className="w-full flex-1">
      <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-800 border-gray-200">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <CodeIcon className="size-4.5" />
          <p className="text-gray-500 text-sm dark:text-gray-400">
            {language.toUpperCase()}
          </p>
        </div>
        <div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={handleCopy}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-400"
                  >
                    {copied ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                }
              />
              <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-400">
                    <PencilIcon className="size-4" />
                  </button>
                }
              />
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <div
        className="py-4 px-5 max-h-[350px] w-full overflow-y-auto custom-scrollbar"
        dir="ltr"
      >
        <pre className={preClasses}>
          <code ref={codeRef} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
