import { SMTPServer } from "smtp-server";
import { DomainService, UserService, MailService } from "@cellsinbox/service";

export interface SmtpReceiverOptions {
  port?: number;
  host?: string;
  banner?: string;
  size?: number;
  key?: Buffer | string;
  cert?: Buffer | string;
}

export function createSmtpServer(options: SmtpReceiverOptions = {}): SMTPServer {
  const server = new SMTPServer({
    secure: false,
    key: options.key,
    cert: options.cert,
    disabledCommands: ["AUTH"], // Inbound MX port 25 only
    banner: options.banner || "CellsInbox ESMTP Mail Receiver",
    size: options.size || 50 * 1024 * 1024,

    // Validate recipient domain and user
    async onRcptTo(address, session, callback) {
      try {
        const email = address.address.toLowerCase().trim();
        const parts = email.split("@");
        if (parts.length !== 2) {
          return callback(new Error("550 5.1.3 Malformed email address."));
        }

        const domainName = parts[1];
        const domain = await DomainService.getByDomainName(domainName);
        if (!domain || !domain.isVerified) {
          return callback(new Error("554 5.7.1 Relay access denied: Domain not hosted here."));
        }

        const user = await UserService.getByEmail(email);
        if (!user || user.status === "SUSPENDED") {
          return callback(new Error("550 5.1.1 User mailbox not found."));
        }

        callback();
      } catch (err: any) {
        callback(err);
      }
    },

    // Ingest data stream
    onData(stream, session, callback) {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", async () => {
        try {
          const rawMime = Buffer.concat(chunks);
          const envelopeFrom = session.envelope.mailFrom ? session.envelope.mailFrom.address : "unknown";
          const envelopeRecipients = session.envelope.rcptTo.map((r) => r.address);

          await MailService.ingestInboundMessage({
            rawMime,
            envelopeFrom,
            envelopeRecipients,
          });

          callback(null, "250 OK: Message accepted for delivery");
        } catch (err: any) {
          console.error("[SMTP Server] Ingestion error:", err);
          callback(new Error("451 4.3.0 Local processing failure"));
        }
      });
      stream.on("error", (err) => callback(err));
    },
  });

  server.on("error", (err: any) => {
    console.error("[SMTP Server Socket Error]:", err?.message || err);
  });

  server.on("clientError", (err: any) => {
    console.warn("[SMTP Server Client Error]:", err?.message || err);
  });

  return server;
}
