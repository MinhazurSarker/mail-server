"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/icons";

export default function DropdownWithSubmenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="lg" />}>
        Dashboard Options
        <ChevronDownIcon className="size-5 transition-transform duration-200 group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Overview</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger showIcon>
              Export Data
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>PDF Report</DropdownMenuItem>
                <DropdownMenuItem>CSV Spreadsheet</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger showIcon>
                    More Formats
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Excel (.xlsx)</DropdownMenuItem>
                      <DropdownMenuItem>JSON Feed</DropdownMenuItem>
                      <DropdownMenuSeparator className="mx-0" />
                      <DropdownMenuItem>XML Document</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="mx-0" />
                <DropdownMenuItem>Scheduled Export...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger showIcon>
              Share Dashboard
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Copy Public Link</DropdownMenuItem>
                <DropdownMenuItem>Email Report</DropdownMenuItem>
                <DropdownMenuItem>Slack Notification</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator className="mx-0" />
          <DropdownMenuItem>
            New Dashboard
            <DropdownMenuShortcut>⌘+N</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
