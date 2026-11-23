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
import { WifiError } from "./icons";

export default function EmptyStateFive({
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
          <WifiError />
        </EmptyStateIllustration>
        <EmptyStateHeader>
          <EmptyStateTitle>Connection Lost</EmptyStateTitle>
          <EmptyStateDescription>
            Your network connection was interrupted. Reconnect to continue using
            the app.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateActions>
          <Button variant="outline" className="min-w-28.75">
            Reconnect
          </Button>
        </EmptyStateActions>
      </EmptyStateContent>
    </EmptyState>
  );
}

EmptyStateFive.Background = EmptyStateBackground;
EmptyStateFive.Content = EmptyStateContent;
EmptyStateFive.Illustration = EmptyStateIllustration;
EmptyStateFive.Header = EmptyStateHeader;
EmptyStateFive.Title = EmptyStateTitle;
EmptyStateFive.Description = EmptyStateDescription;
EmptyStateFive.Actions = EmptyStateActions;

export {
  EmptyState,
  EmptyStateActions,
  EmptyStateBackground,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateFive,
  EmptyStateHeader,
  EmptyStateIllustration,
  EmptyStateTitle,
};
