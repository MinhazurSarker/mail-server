"use client";

import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { XIcon } from "@/icons";
import { useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
    <Alert className="relative block w-full max-w-144.25 p-6">
      <AlertAction className="inset-e-4 top-4">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleClose}
          aria-label="Close"
        >
          <XIcon />
        </Button>
      </AlertAction>

      <AlertDescription className="text-pretty text-gray-700 dark:text-gray-400">
        <p>
          By Clicking on &apos;Accept&apos;, you agree to the storing of cookies
          on your device to enhance site navigation, analyze site usage, and
          assist in our marketing efforts.
        </p>
      </AlertDescription>

      <div className="-me-12 mt-6 flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="#" />}
          className="justify-start sm:justify-center"
        >
          Cookie Settings
        </Button>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Deny All
          </Button>
          <Button type="button" size="sm" className="w-full sm:w-auto">
            Accept All
          </Button>
        </div>
      </div>
    </Alert>
  );
}
