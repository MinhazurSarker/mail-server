"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Component from "./Component";
import { rpcCall } from "@/lib/api";
import type { UserItem } from "../page";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    rpcCall<{ items: UserItem[] }>("admin", "usersList", {})
      .then((res) => {
        if (!isMounted) return;
        const found = (res.items || []).find((u) => u.id === id);
        if (found) {
          setData(found);
        } else {
          router.replace("/users");
        }
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
        if (isMounted) router.replace("/users");
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
