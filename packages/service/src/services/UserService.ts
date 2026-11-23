import argon2 from "argon2";
import crypto from "node:crypto";
import { UserModel, type IUser } from "@cellsinbox/db";

export class UserService {
  static async createUser(data: {
    organizationId: string;
    domainId: string;
    email: string;
    displayName?: string;
    role?: "ORG_ADMIN" | "MAILBOX_USER";
  }): Promise<{ user: IUser; temporaryPassword: string }> {
    const cleanEmail = data.email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error(`User with email '${cleanEmail}' already exists.`);
    }

    // Generate high-entropy temporary password
    const temporaryPassword = crypto.randomBytes(9).toString("base64url");
    const passwordHash = await argon2.hash(temporaryPassword);

    const user = new UserModel({
      organizationId: data.organizationId,
      domainId: data.domainId,
      email: cleanEmail,
      displayName: data.displayName,
      passwordHash,
      role: data.role || "MAILBOX_USER",
      status: "PENDING_SECURITY_SETUP",
      twoFactorEnforced: true,
    });

    const savedUser = await user.save();
    return { user: savedUser, temporaryPassword };
  }

  static async getById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  static async getByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email.toLowerCase().trim() });
  }

  static async listByOrganization(organizationId: string): Promise<IUser[]> {
    return await UserModel.find({ organizationId }).sort({ createdAt: -1 });
  }

  static async getSettings(userId: string): Promise<{
    id: string;
    email: string;
    displayName: string;
    role: string;
    twoFactorEnforced: boolean;
    storageQuotaBytes: number;
    storageUsedBytes: number;
    preferences: {
      signature: string;
      autoSaveDrafts: boolean;
      sendReadReceipts: boolean;
      desktopNotifications: boolean;
      defaultFormat: "html" | "text";
      theme: "dark" | "light" | "system";
    };
  }> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName || "",
      role: user.role,
      twoFactorEnforced: user.twoFactorEnforced,
      storageQuotaBytes: user.storageQuotaBytes,
      storageUsedBytes: user.storageUsedBytes,
      preferences: {
        signature: user.preferences?.signature || "",
        autoSaveDrafts: user.preferences?.autoSaveDrafts !== false,
        sendReadReceipts: user.preferences?.sendReadReceipts === true,
        desktopNotifications: user.preferences?.desktopNotifications !== false,
        defaultFormat: user.preferences?.defaultFormat || "html",
        theme: user.preferences?.theme || "dark",
      },
    };
  }

  static async updateSettings(
    userId: string,
    data: {
      displayName?: string;
      preferences?: {
        signature?: string;
        autoSaveDrafts?: boolean;
        sendReadReceipts?: boolean;
        desktopNotifications?: boolean;
        defaultFormat?: "html" | "text";
        theme?: "dark" | "light" | "system";
      };
    },
  ): Promise<void> {
    const updateObj: Record<string, any> = {};
    if (data.displayName !== undefined) {
      updateObj.displayName = data.displayName.trim();
    }
    if (data.preferences) {
      for (const [key, val] of Object.entries(data.preferences)) {
        if (val !== undefined) {
          updateObj[`preferences.${key}`] = val;
        }
      }
    }

    await UserModel.findByIdAndUpdate(userId, { $set: updateObj });
  }

  static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
  ): Promise<void> {
    if (!newPass || newPass.length < 8) {
      throw new Error("New password must be at least 8 characters long.");
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    const isValid = await argon2.verify(user.passwordHash, currentPass);
    if (!isValid) {
      throw new Error("Current password is incorrect.");
    }

    const newHash = await argon2.hash(newPass);
    user.passwordHash = newHash;
    await user.save();
  }
}

