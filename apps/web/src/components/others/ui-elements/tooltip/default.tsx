"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DefaultTooltip() {
  return (
    <div>
      <Tooltip>
        <TooltipTrigger render={<Button size="sm" />}>
          Tooltip Top
        </TooltipTrigger>
        <TooltipContent side="top">This is a tooltip</TooltipContent>
      </Tooltip>
    </div>
  );
}
