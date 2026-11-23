import {
  ArchiveIcon,
  EnvelopeIcon,
  InboxIcon,
  InfoCircleIcon,
  SendIcon,
  StarIcon,
  TrashBinIcon,
} from "@/icons";
import type {
  FilterCategory,
  LabelCategory,
  MailboxCategory,
  MailItem,
} from "./types";

export const mailboxCategories: MailboxCategory[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon, path: "#", count: 3 },
  {
    id: "sent",
    label: "Sent",
    icon: SendIcon,
    path: "#",
    iconClassName: "rtl:-scale-x-100",
  },
  { id: "draft", label: "Drafts", icon: EnvelopeIcon, path: "#" },
  { id: "spam", label: "Spam", icon: InfoCircleIcon, path: "#", count: 2 },
  { id: "trash", label: "Trash", icon: TrashBinIcon, path: "#" },
  { id: "archive", label: "Archive", icon: ArchiveIcon, path: "#" },
];

export const filterCategories: FilterCategory[] = [
  { id: "starred", label: "Starred", icon: StarIcon, path: "#" },
  { id: "important", label: "Important", icon: InboxIcon, path: "#" },
];

export const labelCategories: LabelCategory[] = [
  { id: "personal", label: "Personal", colorClass: "text-green-500" },
  { id: "work", label: "Work", colorClass: "text-red-500" },
  { id: "payments", label: "Payments", colorClass: "text-orange-500" },
  { id: "invoices", label: "Invoices", colorClass: "text-sky-500" },
  { id: "blank", label: "Blank", colorClass: "text-brand-500" },
];

export const mockEmails: MailItem[] = [
  {
    id: "mail-1",
    sender: "Wise",
    email: "support@wise.com",
    subject: "Transfer Confirmation #982341",
    content: "Your recent international transfer of $1,250.00 USD has been completed successfully.",
    time: "12:16 PM",
    date: "Today",
    badge: "Important",
    isRead: false,
    isStarred: true,
  },
  {
    id: "mail-2",
    sender: "Search Console",
    email: "sc-noreply@google.com",
    subject: "Weekly Performance Report for your verified site",
    content: "Your site impressions increased by 24% over the last 7 days. Review the detailed breakdown.",
    time: "Apr 24",
    date: "Apr 24, 2028",
    badge: "Social",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-3",
    sender: "Paypal",
    email: "service@paypal.com",
    subject: "Invoice #INV-2028-09 received from Acquired Co.",
    content: "You received an invoice from Acquired Co for $480.00 USD due on May 15, 2028.",
    time: "Apr 30",
    date: "Apr 30, 2028",
    isRead: true,
    isStarred: true,
  },
  {
    id: "mail-4",
    sender: "Google Meet",
    email: "calendar@google.com",
    subject: "Meeting invitation: TailAdmin Design System Sync",
    content: "Tomorrow at 3:00 PM - 4:00 PM. Participants: Lindsey Curtis, Kaiya George, and 3 others.",
    time: "Apr 16",
    date: "Apr 16, 2028",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-5",
    sender: "Loom",
    email: "notifications@loom.com",
    subject: "Alexander shared a new screen recording with you",
    content: "Check out the walkthrough of the new responsive table layouts and filter components.",
    time: "Apr 24",
    date: "Apr 24, 2028",
    isRead: false,
    isStarred: false,
  },
  {
    id: "mail-6",
    sender: "Airbnb",
    email: "automated@airbnb.com",
    subject: "Your reservation in San Francisco is confirmed!",
    content: "Reservation code: HMD4592. Check-in instructions and host contact details are available.",
    time: "Mar 05",
    date: "Mar 05, 2028",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-7",
    sender: "Facebook",
    email: "security@facebookmail.com",
    subject: "New login to Business Manager from Chrome on Mac",
    content: "We noticed a recent sign-in to your account. If this was you, no action is needed.",
    time: "Feb 25",
    date: "Feb 25, 2028",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-8",
    sender: "Instagram",
    email: "updates@instagram.com",
    subject: "TailAdmin tagged you in a new post: Next.js 16 Launch",
    content: "Take a look at the latest product release highlights and team announcements.",
    time: "Feb 20",
    date: "Feb 20, 2028",
    badge: "Promotional",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-9",
    sender: "FormBold",
    email: "hello@formbold.com",
    subject: "New form submission: Contact Inquiry received",
    content: "Someone submitted the enterprise tier contact form. View submission details inside.",
    time: "Jan 22",
    date: "Jan 22, 2028",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-10",
    sender: "GrayGrids",
    email: "support@graygrids.com",
    subject: "Your all-access license has been renewed",
    content: "Thank you for being a valued customer. Download your latest template files today.",
    time: "Feb 25",
    date: "Feb 25, 2028",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-11",
    sender: "UIdeck",
    email: "news@uideck.com",
    subject: "5 New Tailwind CSS Dashboard templates published",
    content: "Explore the new premium additions to our UI kit library with responsive dark mode.",
    time: "Feb 15",
    date: "Feb 15, 2028",
    isRead: true,
    isStarred: false,
  },
];

export const activeEmailDetails: MailItem = {
  id: "mail-active",
  sender: "Codescandy",
  email: "hello@example.com",
  subject: "Contact For “Website Design”",
  content: `Hello Dear Alexander,

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut rutrum mi. Aenean ac leo non justo suscipit consectetur. Nam vestibulum eleifend magna quis porta. ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut rutrum mi. Aenean ac leo.

Praesent ut rutrum mi. Aenean ac leo non justo suscipit consectetur. Nam vestibulum eleifend magna quis porta.

Nullam tincidunt sodales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque, pellentesque non massa ornare, accumsan ornare massa. odales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque.

Suspendisse semper vel turpis vitae aliquam. Aenean semper dui in consequat ullamcorper.

Nullam tincidunt sodales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque, pellentesque non massa ornare, accumsan ornare massa. sodales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque.

Praesent ut rutrum mi. Aenean ac leo non justo suscipit consectetur. Nam vestibulum eleifend magna quis porta.`,
  time: "10:30 AM",
  date: "Dec 20, 2028",
  isRead: true,
  isStarred: true,
  attachments: [
    {
      name: "Guidelines.pdf",
      type: "PDF",
      size: "2.4 MB",
      url: "#",
    },
    {
      name: "Branding Assets",
      type: "Media",
      size: "18.5 MB",
      url: "#",
    },
  ],
};
