"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { useState } from "react";

export function DropdownMenuWithLabelAndCheckboxes() {
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showActivityBar, setShowActivityBar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="lg">Settings</Button>} />
      <DropdownMenuContent className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={showStatusBar ?? false}
            onCheckedChange={setShowStatusBar}
          >
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
            disabled
          >
            Activity Bar{" "}
            <Badge variant="light" color="gray">
              Disabled
            </Badge>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Panel
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={theme == "light"}
            onCheckedChange={() => setTheme("light")}
          >
            Light
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={theme == "dark"}
            onCheckedChange={() => setTheme("dark")}
          >
            Dark
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
