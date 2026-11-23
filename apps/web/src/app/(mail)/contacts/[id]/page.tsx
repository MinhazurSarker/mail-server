"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Component, { ContactData } from "./Component";
import { rpcCall } from "@/lib/api";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    rpcCall<{ contacts: ContactData[] }>("contacts", "list", { limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const found = (res.contacts || []).find((c) => c.id === id);
        if (found) {
          setData(found);
        } else {
          router.replace("/contacts");
        }
      })
      .catch((err) => {
        console.error("Failed to load contact:", err);
        if (isMounted) router.replace("/contacts");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return <Component key={data.id} data={data} />;
}
