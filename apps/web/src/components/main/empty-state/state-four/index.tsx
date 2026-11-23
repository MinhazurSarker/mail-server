"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/icons";
import * as React from "react";
import { EmptyState } from "../empty-state";
import { EmptyStateActions } from "../empty-state-actions";
import { EmptyStateBackground } from "../empty-state-background";
import { EmptyStateContent } from "../empty-state-content";
import { EmptyStateDescription } from "../empty-state-description";
import { EmptyStateHeader } from "../empty-state-header";
import { EmptyStateIllustration } from "../empty-state-illustration";
import { EmptyStateTitle } from "../empty-state-title";
import { UsersIcon } from "./icons";

export default function EmptyStateFour({
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
          <UsersIcon />
        </EmptyStateIllustration>
        <EmptyStateHeader>
          <EmptyStateTitle>No Team Members Yet</EmptyStateTitle>
          <EmptyStateDescription>
            Invite your teammates to collaborate, share resources, and manage
            projects together.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateActions>
          <Button className="min-w-32">
            <PlusIcon className="size-5" />
            <span>Add Member</span>
          </Button>
        </EmptyStateActions>
      </EmptyStateContent>
    </EmptyState>
  );
}
