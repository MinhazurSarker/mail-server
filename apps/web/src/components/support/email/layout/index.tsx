"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import InboxMobileHeader from "./mobile-header";
import InboxSidebar from "./sidebar";

export interface InboxLayoutProps {
  children: React.ReactNode;
  activeFolder?: string;
  onSelectFolder?: (folder: string) => void;
  activeLabel?: string | null;
  onSelectLabel?: (label: string | null) => void;
  counts?: Record<string, number>;
  onCompose?: () => void;
  isComposeOpen?: boolean;
  setIsComposeOpen?: (open: boolean) => void;
  composeInitialTo?: string;
  composeInitialSubject?: string;
  composeInitialBody?: string;
  onComposeSent?: () => void;
  maxSingleFileSizeBytes?: number;
  maxAttachmentCount?: number;
}

export default function InboxLayout({
  children,
  activeFolder = "INBOX",
  onSelectFolder,
  activeLabel,
  onSelectLabel,
  counts,
  onCompose,
}: InboxLayoutProps) {
  const handleOpenCompose = () => {
    if (onCompose) onCompose();
  };

  return (
    <SidebarProvider defaultOpen={true} className="h-full min-h-0 min-w-0 w-full flex-1">
      <div className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col gap-4 sm:gap-5 xl:flex-row">
        <InboxMobileHeader />

        <InboxSidebar
          onCompose={handleOpenCompose}
          activeFolder={activeFolder}
          onSelectFolder={onSelectFolder}
          activeLabel={activeLabel}
          onSelectLabel={onSelectLabel}
          counts={counts}
        />

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
