"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { VerticalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";

interface CardHeaderProps {
  title?: string;
  freeSpace?: string;
}

export default function CardHeader({
  title = "Storage Details",
  freeSpace = "585 GB Free space left",
}: CardHeaderProps) {
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-outfit text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {freeSpace && (
          <p className="mt-0.5 text-sm font-normal text-gray-500 dark:text-gray-400">
            {freeSpace}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            />
          }
          aria-label="Storage options"
        >
          <VerticalDotsIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>{tCommon("viewMore")}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

