"use client";

import { useState } from "react";
import MailHeader from "./mail-header";
import MailItemComponent from "./mail-item";
import MailPagination from "./mail-pagination";
import type { MailListProps } from "./types";

export default function MailList({
  emails = [],
  onSelectMail,
  checkedIds: controlledCheckedIds,
  starredIds: controlledStarredIds,
  onToggleCheck: controlledOnToggleCheck,
  onToggleStar: controlledOnToggleStar,
  onDeleteSelected,
  onMarkAsRead,
  searchQuery: controlledSearchQuery,
  onSearchChange: controlledOnSearchChange,
  totalItems,
}: MailListProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalCheckedIds, setInternalCheckedIds] = useState<Record<string, boolean>>({});
  const [internalStarredIds, setInternalStarredIds] = useState<Record<string, boolean>>({});

  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const onSearchChange = controlledOnSearchChange || setInternalSearchQuery;

  const checkedIds = controlledCheckedIds || internalCheckedIds;
  const starredIds = controlledStarredIds || internalStarredIds;

  const handleToggleCheck = controlledOnToggleCheck || ((id: string, checked: boolean) => {
    setInternalCheckedIds((prev) => ({ ...prev, [id]: checked }));
  });

  const handleToggleStar = controlledOnToggleStar || ((id: string) => {
    setInternalStarredIds((prev) => ({ ...prev, [id]: !prev[id] }));
  });

  const filteredEmails = emails.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.sender || "").toLowerCase().includes(q) ||
      (e.subject || "").toLowerCase().includes(q) ||
      (e.content || "").toLowerCase().includes(q)
    );
  });

  const allChecked =
    filteredEmails.length > 0 &&
    filteredEmails.every((e) => checkedIds[e.id]);

  const handleSelectAll = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    if (checked) {
      filteredEmails.forEach((e) => {
        updated[e.id] = true;
      });
    }
    setInternalCheckedIds(updated);
  };

  const handleSelectFilter = (filter: "all" | "read" | "unread") => {
    const updated: Record<string, boolean> = {};
    if (filter === "all") {
      filteredEmails.forEach((e) => {
        updated[e.id] = true;
      });
    } else if (filter === "read") {
      filteredEmails.forEach((e) => {
        if (e.isRead) {
          updated[e.id] = true;
        }
      });
    } else if (filter === "unread") {
      filteredEmails.forEach((e) => {
        if (!e.isRead) {
          updated[e.id] = true;
        }
      });
    }
    setInternalCheckedIds(updated);
  };

  return (
    <div className="flex h-full min-w-0 w-full flex-col">
      <MailHeader
        allChecked={allChecked}
        onSelectAll={handleSelectAll}
        onSelectFilter={handleSelectFilter}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onDeleteSelected={onDeleteSelected}
        onMarkAsRead={onMarkAsRead}
      />

      <div className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500">
              <svg className="size-6 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No messages found
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Your sovereign mailbox is completely up to date.
            </p>
          </div>
        ) : (
          filteredEmails.map((mail) => (
            <MailItemComponent
              key={mail.id}
              mail={mail}
              isChecked={Boolean(checkedIds[mail.id])}
              isStarred={Boolean(starredIds[mail.id])}
              onToggleCheck={(checked) => handleToggleCheck(mail.id, checked)}
              onToggleStar={() => handleToggleStar(mail.id)}
              onClick={() => onSelectMail?.(mail.id)}
            />
          ))
        )}
      </div>

      <MailPagination totalItems={totalItems || filteredEmails.length} />
    </div>
  );
}
