"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { EmptyState } from "../empty-state";
import { EmptyStateActions } from "../empty-state-actions";
import { EmptyStateBackground } from "../empty-state-background";
import { EmptyStateContent } from "../empty-state-content";
import { EmptyStateDescription } from "../empty-state-description";
import { EmptyStateHeader } from "../empty-state-header";
import { EmptyStateIllustration } from "../empty-state-illustration";
import { EmptyStateTitle } from "../empty-state-title";
import { FolderIcon } from "./icons";

export default function EmptyStateOne({
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
          <FolderIcon />
        </EmptyStateIllustration>
        <EmptyStateHeader>
          <EmptyStateTitle>No Project yet</EmptyStateTitle>
          <EmptyStateDescription>
            Upload your first file to get started. Your files will appear here
            once they&apos;re added.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateActions>
          <Button variant="outline" className="min-w-33.25">
            Import Project
          </Button>
          <Button className="min-w-33.5">Create Project</Button>
        </EmptyStateActions>
      </EmptyStateContent>
    </EmptyState>
  );
}
