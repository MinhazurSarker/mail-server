"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import { usePathname } from "@/i18n/navigation";

export default function InboxBreadcrumb() {
  const pathname = usePathname();
  const pageTitle = pathname.includes("inbox-details")
    ? "Inbox Details"
    : "Inbox";

  return <PageBreadcrumb pageTitle={pageTitle} />;
}
