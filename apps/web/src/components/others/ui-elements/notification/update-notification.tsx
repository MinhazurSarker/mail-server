"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { BoltIcon } from "@/icons";

export default function UpdateNotification() {
  return (
    <Alert className="max-w-151.75 p-5 sm:has-data-[slot=alert-action]:pe-56">
      <BoltIcon className="size-6 text-brand-500!" />
      <AlertTitle>New Update Available!</AlertTitle>
      <AlertDescription>
        Enjoy improved functionality and enhancements.
      </AlertDescription>
      <AlertAction className="col-span-full mt-4 flex items-center gap-3 sm:absolute sm:inset-e-5 sm:top-1/2 sm:col-auto sm:mt-0 sm:-translate-y-1/2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="#" />}
        >
          Later
        </Button>
        <Button size="sm" nativeButton={false} render={<Link href="#" />}>
          Update Now
        </Button>
      </AlertAction>
    </Alert>
  );
}
