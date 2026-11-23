"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/icons";

export default function DefaultDropdown() {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button size="lg" />}>
        Account Menu
        <ChevronDownIcon className="size-5 transition-transform duration-200 group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit Profile</DropdownMenuItem>
        <DropdownMenuItem>Account Settings</DropdownMenuItem>
        <DropdownMenuItem>License</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
