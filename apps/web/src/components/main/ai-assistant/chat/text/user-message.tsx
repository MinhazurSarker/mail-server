"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, CopyIcon, PencilIcon } from "@/icons";
import { useState } from "react";

interface UserMessageProps {
  initialText: string;
  onSave?: (newText: string) => void;
  isEditable?: boolean;
}

const BTN_CLASS =
  "group flex size-8 items-center justify-center rounded-lg p-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-gray-900 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/90";

export default function UserMessage({
  initialText,
  onSave,
  isEditable = true,
}: UserMessageProps) {
  const [userText, setUserText] = useState(initialText);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [copiedUser, setCopiedUser] = useState(false);

  const handleEdit = () => {
    setDraft(userText);
    setEditing(true);
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      setUserText(trimmed);
      if (onSave) {
        onSave(trimmed);
      }
    }
    setEditing(false);
  };

  const handleCancel = () => setEditing(false);

  const handleCopyUser = async () => {
    try {
      await navigator.clipboard.writeText(userText);
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex justify-end">
      <div className={editing ? "w-full" : "w-full max-w-120"}>
        {/* View mode */}
        {!editing && (
          <div className="ms-auto w-full max-w-120">
            <div className="rounded-te-xs rounded-xl bg-gray-100 px-4 py-3 shadow-theme-xs dark:bg-gray-800">
              <p className="text-start text-base leading-6 font-normal text-pretty wrap-break-word text-gray-800 dark:text-white/90">
                {userText}
              </p>
            </div>
            {isEditable && (
              <div className="mt-2 flex justify-end">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button onClick={handleEdit} className={BTN_CLASS}>
                        <PencilIcon className="size-4" />
                      </button>
                    }
                  />
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button onClick={handleCopyUser} className={BTN_CLASS}>
                        {copiedUser ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <CopyIcon className="size-4" />
                        )}
                      </button>
                    }
                  />
                  <TooltipContent>
                    {copiedUser ? "Copied!" : "Copy"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* Edit mode */}
        {editing && isEditable && (
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-900">
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && handleCancel()}
              className="w-full resize-none scrollbar-none border-0 bg-transparent p-0 text-base leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white/90 [&::-webkit-scrollbar]:hidden"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black dark:bg-white dark:text-gray-900"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
