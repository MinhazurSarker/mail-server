"use client";

import { Button } from "@/components/ui/button";
import {
  CardDescription,
  CardTitle,
  CardHeader as Header,
} from "@/components/ui/card";
import { PlusIcon } from "@/icons";

interface CardHeaderProps {
  onAddClick: () => void;
}

export default function CardHeader({ onAddClick }: CardHeaderProps) {
  return (
    <Header className="-mx-6 flex flex-col justify-between gap-5 border-b border-gray-100 px-6 pb-4 sm:flex-row sm:items-center dark:border-gray-800">
      <div>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
          API Keys
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          API keys are used to authenticate requests to the tailadmin API
        </CardDescription>
      </div>

      <Button
        onClick={onAddClick}
        className="h-11 gap-2 px-4 text-sm font-medium"
      >
        <PlusIcon className="size-5" />
        Add API Key
      </Button>
    </Header>
  );
}
