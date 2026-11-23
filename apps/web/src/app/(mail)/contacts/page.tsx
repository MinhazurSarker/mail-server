"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Users,
  Star,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Briefcase,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
} from "lucide-react";

interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formFavorite, setFormFavorite] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadContacts = useCallback(async (searchQuery = "", favoriteOnly = false) => {
    try {
      const res = await rpcCall<{ items: ContactItem[]; total: number }>("contacts", "list", {
        search: searchQuery || undefined,
        favoriteOnly: favoriteOnly || undefined,
      });
      setContacts(res.items || []);
      setTotal(res.total || 0);
      if (res.items?.length > 0 && !selectedContact) {
        setSelectedContact(res.items[0]);
      }
    } catch (err: any) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedContact]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    loadContacts(search, filterFavorite);
  }, [router, loadContacts, search, filterFavorite]);

  const handleOpenCreate = () => {
    setEditingContactId(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormCompany("");
    setFormJobTitle("");
    setFormNotes("");
    setFormFavorite(false);
    setShowDialog(true);
  };

  const handleOpenEdit = (c: ContactItem) => {
    setEditingContactId(c.id);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone || "");
    setFormCompany(c.company || "");
    setFormJobTitle(c.jobTitle || "");
    setFormNotes(c.notes || "");
    setFormFavorite(c.isFavorite);
    setShowDialog(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    setSubmitting(true);
    try {
      if (editingContactId) {
        const res = await rpcCall<{ contact: ContactItem }>("contacts", "update", {
          contactId: editingContactId,
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          company: formCompany || undefined,
          jobTitle: formJobTitle || undefined,
          notes: formNotes || undefined,
          isFavorite: formFavorite,
        });
        setContacts((prev) => prev.map((c) => (c.id === editingContactId ? res.contact : c)));
        setSelectedContact(res.contact);
        showToast("Contact updated successfully!");
      } else {
        const res = await rpcCall<{ contact: ContactItem }>("contacts", "create", {
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          company: formCompany || undefined,
          jobTitle: formJobTitle || undefined,
          notes: formNotes || undefined,
          isFavorite: formFavorite,
        });
        setContacts((prev) => [res.contact, ...prev]);
        setSelectedContact(res.contact);
        showToast("Contact added to address book!");
      }
      setShowDialog(false);
    } catch (err: any) {
      alert("Error saving contact: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async (c: ContactItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await rpcCall<{ contact: ContactItem }>("contacts", "update", {
        contactId: c.id,
        isFavorite: !c.isFavorite,
      });
      setContacts((prev) => prev.map((item) => (item.id === c.id ? res.contact : item)));
      if (selectedContact?.id === c.id) {
        setSelectedContact(res.contact);
      }
    } catch (err: any) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await rpcCall("contacts", "delete", { contactId });
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
      showToast("Contact deleted");
    } catch (err: any) {
      alert("Error deleting contact: " + err.message);
    }
  };

  const handleSendEmailTo = (contactEmail: string) => {
    router.push(`/inbox?composeTo=${encodeURIComponent(contactEmail)}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* ── TOP HEADER ── */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <ArrowLeft className="size-3.5" />
              Back to Mail
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h1 className="font-bold text-sm tracking-tight">Address Book</h1>
          </div>
          <Badge variant="outline" className="text-[11px] font-medium border-border/80">
            {total} Contacts
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 h-8 text-xs font-semibold">
            <Plus className="size-3.5" />
            New Contact
          </Button>
        </div>
      </header>

      {/* ── 3-COLUMN WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR CATEGORIES ── */}
        <aside className="w-56 border-r border-border bg-card/20 flex flex-col p-3 shrink-0 justify-between">
          <div className="space-y-1">
            <Button
              variant={!filterFavorite ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setFilterFavorite(false);
                loadContacts(search, false);
              }}
              className="w-full justify-between font-normal text-xs h-9 px-2.5"
            >
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span className={!filterFavorite ? "font-semibold" : ""}>All Contacts</span>
              </div>
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                {contacts.length}
              </Badge>
            </Button>

            <Button
              variant={filterFavorite ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setFilterFavorite(true);
                loadContacts(search, true);
              }}
              className="w-full justify-between font-normal text-xs h-9 px-2.5"
            >
              <div className="flex items-center gap-2">
                <Star className="size-4 text-amber-400" />
                <span className={filterFavorite ? "font-semibold" : ""}>Favorites</span>
              </div>
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                {contacts.filter((c) => c.isFavorite).length}
              </Badge>
            </Button>
          </div>
        </aside>

        {/* ── CONTACT LIST COLUMN ── */}
        <section className="w-80 md:w-96 border-r border-border bg-card/40 flex flex-col shrink-0">
          <div className="p-2.5 px-3 border-b border-border bg-card/60 relative">
            <Search className="size-3.5 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Filter contacts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadContacts(e.target.value, filterFavorite);
              }}
              className="pl-8 h-8 text-xs bg-muted/30 focus-visible:bg-background"
            />
          </div>

          <ScrollArea className="flex-1">
            {contacts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
                <Users className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {contacts.map((c) => {
                  const isSelected = selectedContact?.id === c.id;
                  const initials = c.name.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      className={`p-3 cursor-pointer flex gap-3 items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-8 text-xs font-semibold shrink-0 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate text-foreground">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {c.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(c, e)}
                        className="text-muted-foreground hover:text-amber-400 transition-colors p-1"
                      >
                        <Star
                          className={`size-3.5 ${
                            c.isFavorite ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </section>

        {/* ── DETAIL PANE ── */}
        <main className="flex-1 bg-background flex flex-col overflow-hidden">
          {!selectedContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2 p-8 text-center">
              <Users className="size-12 text-muted-foreground/30" />
              <h3 className="text-sm font-semibold text-foreground">Select a contact</h3>
              <p className="text-xs text-muted-foreground">Choose a contact to view full card details.</p>
            </div>
          ) : (
            <div className="p-8 max-w-2xl space-y-6 overflow-y-auto">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 text-lg font-bold border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedContact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      {selectedContact.name}
                      {selectedContact.isFavorite && (
                        <Star className="size-4 text-amber-400 fill-amber-400" />
                      )}
                    </h2>
                    {(selectedContact.jobTitle || selectedContact.company) && (
                      <p className="text-xs text-muted-foreground">
                        {[selectedContact.jobTitle, selectedContact.company].filter(Boolean).join(" at ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => handleSendEmailTo(selectedContact.email)}
                    className="h-8 text-xs gap-1.5 font-semibold"
                  >
                    <Mail className="size-3.5" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(selectedContact)}
                    className="h-8 text-xs gap-1"
                  >
                    <Edit2 className="size-3" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => handleDeleteContact(selectedContact.id)}
                    className="h-8"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
                  <Mail className="size-4 text-primary" />
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Email</span>
                    <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline font-mono">
                      {selectedContact.email}
                    </a>
                  </div>
                </div>

                {selectedContact.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
                    <Phone className="size-4 text-primary" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Phone</span>
                      <span className="font-mono">{selectedContact.phone}</span>
                    </div>
                  </div>
                )}

                {selectedContact.company && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
                    <Building className="size-4 text-primary" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Company</span>
                      <span>{selectedContact.company}</span>
                    </div>
                  </div>
                )}

                {selectedContact.jobTitle && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
                    <Briefcase className="size-4 text-primary" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Job Title</span>
                      <span>{selectedContact.jobTitle}</span>
                    </div>
                  </div>
                )}

                {selectedContact.notes && (
                  <div className="p-4 rounded-lg border border-border bg-card/40 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Notes</span>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">{selectedContact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── CREATE / EDIT DIALOG ── */}
      {showDialog && (
        <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md border-border shadow-2xl z-50 overflow-hidden">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/40">
            <CardTitle className="text-sm font-semibold">
              {editingContactId ? "Edit Contact" : "Add New Contact"}
            </CardTitle>
            <Button variant="ghost" size="icon-xs" onClick={() => setShowDialog(false)}>
              <X className="size-4 text-muted-foreground" />
            </Button>
          </CardHeader>
          <form onSubmit={handleSaveContact}>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="contactName" className="text-xs">Full Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Alice Smith"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="contactEmail" className="text-xs">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="alice@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="contactPhone" className="text-xs">Phone</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+1 555-0192"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactCompany" className="text-xs">Company</Label>
                  <Input
                    id="contactCompany"
                    placeholder="Acme Corp"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="contactJob" className="text-xs">Job Title</Label>
                <Input
                  id="contactJob"
                  placeholder="VP of Engineering"
                  value={formJobTitle}
                  onChange={(e) => setFormJobTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="contactNotes" className="text-xs">Notes</Label>
                <Textarea
                  id="contactNotes"
                  rows={3}
                  placeholder="Additional context or notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="contactFav"
                  type="checkbox"
                  checked={formFavorite}
                  onChange={(e) => setFormFavorite(e.target.checked)}
                  className="size-4 rounded border-border"
                />
                <Label htmlFor="contactFav" className="text-xs cursor-pointer">
                  Mark as Favorite Contact
                </Label>
              </div>
            </CardContent>

            <CardFooter className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowDialog(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs font-semibold">
                {submitting ? "Saving..." : editingContactId ? "Update Contact" : "Create Contact"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-primary/50 text-foreground px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
