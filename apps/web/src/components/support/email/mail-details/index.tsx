"use client";

import { activeEmailDetails } from "../data";
import DetailsAttachments from "./details-attachments";
import DetailsContent from "./details-content";
import DetailsFooter from "./details-footer";
import DetailsHeader from "./details-header";
import type { MailDetailsProps } from "./types";

export default function MailDetails({
  email = activeEmailDetails,
  onBack,
  onDelete,
  onMarkUnread,
  onArchive,
  onViewRawEml,
  onReply,
  onReplyAll,
  onForward,
}: MailDetailsProps) {
  return (
    <div className="flex h-full min-w-0 w-full flex-col">
      <DetailsHeader
        onBack={onBack}
        onDelete={onDelete}
        onMarkUnread={onMarkUnread}
        onArchive={onArchive}
        onViewRawEml={onViewRawEml}
        spfResult={email.spfResult}
        dkimResult={email.dkimResult}
        dmarcResult={email.dmarcResult}
      />
      <div className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto">
        <DetailsContent email={email} />
        <DetailsAttachments attachments={email.attachments} />
      </div>
      <DetailsFooter
        onReply={onReply}
        onReplyAll={onReplyAll}
        onForward={onForward}
      />
    </div>
  );
}
