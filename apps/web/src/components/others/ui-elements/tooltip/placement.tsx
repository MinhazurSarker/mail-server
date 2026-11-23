"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TooltipPlacement() {
  return (
    <div className="flex flex-col items-center gap-10 sm:flex-row">
      <Tooltip>
        <TooltipTrigger render={<Button size="sm" />}>
          Tooltip Top
        </TooltipTrigger>
        <TooltipContent side="top">This is a tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button size="sm" />}>
          Tooltip Right
        </TooltipTrigger>
        <TooltipContent side="right">This is a tooltip</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button size="sm" />}>
          Tooltip Left
        </TooltipTrigger>
        <TooltipContent side="left">This is a tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button size="sm" />}>
          Tooltip Bottom
        </TooltipTrigger>
        <TooltipContent side="bottom">This is a tooltip</TooltipContent>
      </Tooltip>
    </div>
  );
}
