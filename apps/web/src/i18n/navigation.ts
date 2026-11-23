"use client";

import { useRouter as useNextRouter, usePathname } from "next/navigation";
import Link from "next/link";

export { Link, usePathname };

export function useRouter() {
  const router = useNextRouter();
  return {
    ...router,
    push: (href: string, options?: any) => router.push(href),
    replace: (href: string, options?: any) => router.replace(href),
  };
}
