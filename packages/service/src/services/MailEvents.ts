import { EventEmitter } from "node:events";

export interface MailReceivedPayload {
  userId: string;
  organizationId: string;
  messageId: string;
  folder: string;
  subject: string;
  from: { name?: string; address: string };
  to: Array<{ name?: string; address: string }>;
  date: Date | string;
  snippet?: string;
  hasAttachments: boolean;
}

export interface MailStateChangedPayload {
  userId: string;
  messageId: string;
  folder?: string;
  isRead?: boolean;
  isStarred?: boolean;
}

class MailEventEmitter extends EventEmitter {
  emitMailReceived(payload: MailReceivedPayload): boolean {
    return this.emit("mail:received", payload);
  }

  onMailReceived(listener: (payload: MailReceivedPayload) => void): this {
    return this.on("mail:received", listener);
  }

  offMailReceived(listener: (payload: MailReceivedPayload) => void): this {
    return this.off("mail:received", listener);
  }

  emitStateChanged(payload: MailStateChangedPayload): boolean {
    return this.emit("mail:state_changed", payload);
  }

  onStateChanged(listener: (payload: MailStateChangedPayload) => void): this {
    return this.on("mail:state_changed", listener);
  }

  offStateChanged(listener: (payload: MailStateChangedPayload) => void): this {
    return this.off("mail:state_changed", listener);
  }
}

export const MailEvents = new MailEventEmitter();
