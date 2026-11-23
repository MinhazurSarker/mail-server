"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
  ChevronDownIcon,
  GearIcon,
  InfoIcon,
  LogOutIcon,
  UserCircleIcon,
} from "@/icons";

export default function DropdownWithIcon() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="lg" />}>
        Account Menu
        <ChevronDownIcon className="size-5 transition-transform duration-200 group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <UserCircleIcon />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <GearIcon />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoIcon />
          Info
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
