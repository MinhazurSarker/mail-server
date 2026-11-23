"use client";

import { Button } from "@/components/ui/button";
import { PencilIcon } from "@/icons";
import type { SidebarHeaderProps } from "./types";

export default function SidebarHeader({ onCompose }: SidebarHeaderProps) {
  return (
    <Button
      size="lg"
      onClick={onCompose}
      className="w-full"
    >
      <PencilIcon className="size-5" />
      Compose
    </Button>
  );
}
