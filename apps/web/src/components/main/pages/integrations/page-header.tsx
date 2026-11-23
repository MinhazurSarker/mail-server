"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/icons";

interface PageHeaderProps {
  pageTitle?: string;
  onAddClick: () => void;
}

export default function PageHeader({
  pageTitle = "Integrations",
  onAddClick,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={onAddClick} className="gap-2">
          <PlusIcon className="size-4" />
          Add New Integration
        </Button>
      </div>
    </div>
  );
}
