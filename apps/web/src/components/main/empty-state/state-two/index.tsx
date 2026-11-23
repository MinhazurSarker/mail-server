"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/icons";
import * as React from "react";
import { EmptyState } from "../empty-state";
import { EmptyStateActions } from "../empty-state-actions";
import { EmptyStateBackground } from "../empty-state-background";
import { EmptyStateContent } from "../empty-state-content";
import { EmptyStateDescription } from "../empty-state-description";
import { EmptyStateHeader } from "../empty-state-header";
import { EmptyStateIllustration } from "../empty-state-illustration";
import { EmptyStateTitle } from "../empty-state-title";
import { FolderEmptyIcon } from "./icons";

export default function EmptyStateTwo({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  if (children) {
    return (
      <EmptyState className={className} {...props}>
        {children}
      </EmptyState>
    );
  }

  return (
    <EmptyState className={className} {...props}>
      <EmptyStateBackground />
      <EmptyStateContent>
        <EmptyStateIllustration>
          <FolderEmptyIcon />
        </EmptyStateIllustration>
        <EmptyStateHeader>
          <EmptyStateTitle>No Items Found</EmptyStateTitle>
          <EmptyStateDescription>
            We couldn&apos;t find any matching items. Try changing your search
            or clearing the applied filters.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateActions>
          <Button variant="outline" className="min-w-32">
            <SearchIcon className="size-5" />
            <span>Clear Filters</span>
          </Button>
        </EmptyStateActions>
      </EmptyStateContent>
    </EmptyState>
  );
}
