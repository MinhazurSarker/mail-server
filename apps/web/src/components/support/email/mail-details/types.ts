import type { MailItem } from "../types";

export interface MailDetailsData extends MailItem {
  html?: string;
  text?: string;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  rawEml?: string;
  cc?: Array<{ name?: string; address: string }>;
  bcc?: Array<{ name?: string; address: string }>;
}

export interface MailDetailsProps {
  email?: MailDetailsData;
  onBack?: () => void;
  onDelete?: () => void;
  onMarkUnread?: () => void;
  onArchive?: () => void;
  onViewRawEml?: () => void;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
}

export interface DetailsHeaderProps {
  onBack?: () => void;
  onDelete?: () => void;
  onMarkUnread?: () => void;
  onArchive?: () => void;
  onViewRawEml?: () => void;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
}

export interface DetailsContentProps {
  email: MailDetailsData;
}

export interface DetailsAttachmentsProps {
  attachments?: MailItem["attachments"];
}
