"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  SendIcon,
  StarIcon,
  TrashBinIcon,
} from "@/icons";
import { rpcCall } from "@/lib/api";

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
}

export default function ContactDetailComponent({ data }: { data: ContactData }) {
  const router = useRouter();
  const [contact, setContact] = useState<ContactData>(data);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await rpcCall<{ contact: ContactData }>("contacts", "update", {
        contactId: contact.id,
        name: contact.name.trim(),
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone?.trim() || undefined,
        company: contact.company?.trim() || undefined,
        jobTitle: contact.jobTitle?.trim() || undefined,
        notes: contact.notes?.trim() || undefined,
        isFavorite: contact.isFavorite,
      });
      setContact(res.contact);
      showToast("Contact updated successfully");
    } catch (err: any) {
      alert("Error updating contact: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await rpcCall<{ contact: ContactData }>("contacts", "update", {
        contactId: contact.id,
        isFavorite: !contact.isFavorite,
      });
      setContact(res.contact);
      showToast(res.contact.isFavorite ? "Marked as favorite" : "Removed from favorites");
    } catch (err: any) {
      alert("Error updating favorite: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    setDeleting(true);
    try {
      await rpcCall("contacts", "delete", { contactId: contact.id });
      router.push("/contacts");
    } catch (err: any) {
      alert("Error deleting contact: " + err.message);
      setDeleting(false);
    }
  };

  const handleSendEmail = () => {
    router.push(`/inbox/new?to=${encodeURIComponent(contact.email)}`);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-theme-xl dark:bg-white dark:text-gray-900 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle={`Edit: ${contact.name}`} />
        <div className="flex items-center gap-2">
          <Link href="/contacts">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeftIcon className="size-4" />
              Contacts List
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSendEmail}
            className="gap-2"
          >
            <SendIcon className="size-4" />
            Send Email
          </Button>
        </div>
      </div>

      <ComponentCard
        title="Contact Profile"
        desc="Update contact information, company affiliation, or delete this record."
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Badge
                size="sm"
                color={contact.isFavorite ? "warning" : "gray"}
                variant="light"
                className="gap-1 cursor-pointer"
                onClick={handleToggleFavorite}
              >
                <StarIcon
                  className={`size-3.5 ${
                    contact.isFavorite
                      ? "fill-amber-400 text-amber-500"
                      : "text-gray-400"
                  }`}
                />
                {contact.isFavorite ? "Favorite Contact" : "Standard Contact"}
              </Badge>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              <TrashBinIcon className="size-3.5" />
              Delete Contact
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={contact.phone || ""}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Company</Label>
              <Input
                placeholder="Acme Corp"
                value={contact.company || ""}
                onChange={(e) => setContact({ ...contact, company: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Job Title</Label>
              <Input
                placeholder="Senior Product Manager"
                value={contact.jobTitle || ""}
                onChange={(e) => setContact({ ...contact, jobTitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                placeholder="Add private background notes about this contact..."
                value={contact.notes || ""}
                onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/contacts">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
