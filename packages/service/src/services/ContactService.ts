import { ContactModel, UserModel, type IContact } from "@cellsinbox/db";

export class ContactService {
  static async listContacts(
    userId: string,
    options?: {
      search?: string;
      favoriteOnly?: boolean;
      limit?: number;
      skip?: number;
    },
  ): Promise<{ items: IContact[]; total: number }> {
    const filter: Record<string, any> = { userId };

    if (options?.favoriteOnly) {
      filter.isFavorite = true;
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      ContactModel.find(filter)
        .sort({ isFavorite: -1, name: 1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 100),
      ContactModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async getContactById(contactId: string, userId: string): Promise<IContact | null> {
    return await ContactModel.findOne({ _id: contactId, userId });
  }

  static async createContact(
    userId: string,
    data: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      jobTitle?: string;
      notes?: string;
      isFavorite?: boolean;
    },
  ): Promise<IContact> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    const contact = new ContactModel({
      organizationId: user.organizationId,
      userId: user._id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim(),
      company: data.company?.trim(),
      jobTitle: data.jobTitle?.trim(),
      notes: data.notes?.trim(),
      isFavorite: data.isFavorite === true,
    });

    return await contact.save();
  }

  static async updateContact(
    contactId: string,
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      jobTitle?: string;
      notes?: string;
      isFavorite?: boolean;
    },
  ): Promise<IContact> {
    const update: Record<string, any> = {};
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.email !== undefined) update.email = data.email.toLowerCase().trim();
    if (data.phone !== undefined) update.phone = data.phone.trim();
    if (data.company !== undefined) update.company = data.company.trim();
    if (data.jobTitle !== undefined) update.jobTitle = data.jobTitle.trim();
    if (data.notes !== undefined) update.notes = data.notes.trim();
    if (data.isFavorite !== undefined) update.isFavorite = data.isFavorite;

    const contact = await ContactModel.findOneAndUpdate(
      { _id: contactId, userId },
      { $set: update },
      { new: true },
    );

    if (!contact) throw new Error("Contact not found or access denied.");
    return contact;
  }

  static async deleteContact(contactId: string, userId: string): Promise<void> {
    const res = await ContactModel.deleteOne({ _id: contactId, userId });
    if (res.deletedCount === 0) {
      throw new Error("Contact not found or access denied.");
    }
  }

  static async searchAutocomplete(
    userId: string,
    query: string,
    limit: number = 8,
  ): Promise<Array<{ id: string; name: string; email: string; company?: string }>> {
    if (!query || query.trim().length === 0) {
      const recents = await ContactModel.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limit);
      return recents.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        company: c.company,
      }));
    }

    const q = query.trim();
    const matches = await ContactModel.find({
      userId,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ isFavorite: -1, name: 1 })
      .limit(limit);

    return matches.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      company: c.company,
    }));
  }
}
