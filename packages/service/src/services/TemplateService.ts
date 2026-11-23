import { TemplateModel, type ITemplate, UserModel, isValidObjectId } from "@cellsinbox/db";
import { MailService } from "./MailService.js";

export interface TemplateSendRecipient {
  to: string;
  variables: Record<string, string>;
}

export class TemplateService {
  /**
   * Extract variable keys enclosed in double curly braces {{variable}}
   */
  static extractVariables(text: string): string[] {
    if (!text) return [];
    const matches = text.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g);
    const keys = new Set<string>();
    for (const match of matches) {
      if (match[1]) {
        keys.add(match[1].trim());
      }
    }
    return Array.from(keys);
  }

  /**
   * Interpolate {{key}} placeholders in text with provided variables map
   */
  static interpolate(template: string, variables: Record<string, any> = {}): string {
    if (!template) return "";
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      const val = variables[key.trim()];
      return val !== undefined && val !== null ? String(val) : "";
    });
  }

  static async createTemplate(data: {
    organizationId: string;
    userId: string;
    name: string;
    subject: string;
    bodyHtml?: string;
    bodyText?: string;
    description?: string;
  }): Promise<ITemplate> {
    const rawSubject = data.subject || "";
    const rawHtml = data.bodyHtml || "";
    const rawText = data.bodyText || "";

    const combinedVars = Array.from(
      new Set([
        ...this.extractVariables(rawSubject),
        ...this.extractVariables(rawHtml),
        ...this.extractVariables(rawText),
      ]),
    );

    const template = new TemplateModel({
      organizationId: data.organizationId,
      userId: data.userId,
      name: data.name.trim(),
      subject: rawSubject,
      bodyHtml: rawHtml,
      bodyText: rawText,
      variables: combinedVars,
      description: data.description?.trim(),
    });

    return await template.save();
  }

  static async updateTemplate(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      subject: string;
      bodyHtml: string;
      bodyText: string;
      description: string;
    }>,
  ): Promise<ITemplate> {
    const template = await TemplateModel.findOne({ _id: id, organizationId });
    if (!template) throw new Error("Template not found.");

    if (data.name !== undefined) template.name = data.name.trim();
    if (data.subject !== undefined) template.subject = data.subject;
    if (data.bodyHtml !== undefined) template.bodyHtml = data.bodyHtml;
    if (data.bodyText !== undefined) template.bodyText = data.bodyText;
    if (data.description !== undefined) template.description = data.description?.trim();

    template.variables = Array.from(
      new Set([
        ...this.extractVariables(template.subject),
        ...this.extractVariables(template.bodyHtml || ""),
        ...this.extractVariables(template.bodyText || ""),
      ]),
    );

    return await template.save();
  }

  static async deleteTemplate(id: string, organizationId: string): Promise<boolean> {
    const res = await TemplateModel.deleteOne({ _id: id, organizationId });
    return res.deletedCount > 0;
  }

  static async getTemplate(idOrName: string, organizationId: string): Promise<ITemplate | null> {
    if (isValidObjectId(idOrName)) {
      const byId = await TemplateModel.findOne({ _id: idOrName, organizationId });
      if (byId) return byId;
    }
    return await TemplateModel.findOne({ name: idOrName, organizationId });
  }

  static async listTemplates(organizationId: string): Promise<ITemplate[]> {
    return await TemplateModel.find({ organizationId }).sort({ updatedAt: -1 });
  }

  /**
   * Dispatches autonomous emails to multiple recipients using the template with per-recipient variables map.
   */
  static async sendTemplateBatch(params: {
    organizationId: string;
    userId: string;
    templateId: string;
    recipients: TemplateSendRecipient[];
  }): Promise<{
    total: number;
    sent: number;
    failed: number;
    results: Array<{ to: string; status: "SENT" | "FAILED"; messageId?: string; error?: string }>;
  }> {
    const template = await this.getTemplate(params.templateId, params.organizationId);
    if (!template) {
      throw new Error(`Template '${params.templateId}' not found.`);
    }

    const user = await UserModel.findById(params.userId);
    if (!user) throw new Error("Sender user not found.");

    const results: Array<{ to: string; status: "SENT" | "FAILED"; messageId?: string; error?: string }> = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const item of params.recipients) {
      const cleanTo = (item.to || "").trim().toLowerCase();
      if (!cleanTo || !cleanTo.includes("@")) {
        results.push({ to: item.to, status: "FAILED", error: "Malformed recipient email address" });
        failedCount++;
        continue;
      }

      // Merge user variables with system defaults
      const vars = {
        to: cleanTo,
        email: cleanTo,
        sender_name: user.displayName || user.email,
        sender_email: user.email,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        ...item.variables,
      };

      const interpolatedSubject = this.interpolate(template.subject, vars);
      const interpolatedHtml = template.bodyHtml ? this.interpolate(template.bodyHtml, vars) : undefined;
      const interpolatedText = template.bodyText ? this.interpolate(template.bodyText, vars) : undefined;

      try {
        const sendRes = await MailService.sendMail({
          userId: user._id.toString(),
          to: [cleanTo],
          subject: interpolatedSubject,
          html: interpolatedHtml,
          text: interpolatedText || (interpolatedHtml ? undefined : interpolatedSubject),
        });

        results.push({
          to: cleanTo,
          status: "SENT",
          messageId: sendRes.messageId,
        });
        sentCount++;
      } catch (err: any) {
        results.push({
          to: cleanTo,
          status: "FAILED",
          error: err.message || "Sending failed",
        });
        failedCount++;
      }
    }

    return {
      total: params.recipients.length,
      sent: sentCount,
      failed: failedCount,
      results,
    };
  }
}
