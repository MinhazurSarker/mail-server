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
import { ArrowLeftIcon } from "@/icons";
import { rpcCall } from "@/lib/api";

export default function NewContactPage() {
  const router = useRouter();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactJobTitle, setContactJobTitle] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!contactName.trim() || !contactEmail.trim()) {
      setErrorMsg("Please provide both full name and email address.");
      return;
    }

    setSubmitting(true);
    try {
      await rpcCall("contacts", "create", {
        name: contactName.trim(),
        email: contactEmail.trim().toLowerCase(),
        phone: contactPhone.trim() || undefined,
        company: contactCompany.trim() || undefined,
        jobTitle: contactJobTitle.trim() || undefined,
        notes: contactNotes.trim() || undefined,
      });
      router.push("/contacts");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create contact");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="New Contact" />
        <Link href="/contacts">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Contacts
          </Button>
        </Link>
      </div>

      <ComponentCard
        title="Contact Details"
        desc="Add an individual to your personal address book."
      >
        <form onSubmit={handleCreateContact} className="space-y-5">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                placeholder="Jane Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                placeholder="jane@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Company</Label>
              <Input
                placeholder="Acme Corp"
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Job Title</Label>
              <Input
                placeholder="Director of Technology"
                value={contactJobTitle}
                onChange={(e) => setContactJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                placeholder="Additional notes about this contact..."
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
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
              {submitting ? "Saving..." : "Create Contact"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
