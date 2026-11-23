"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BellIcon } from "@/icons";
import * as React from "react";

interface SubscribeFormProps {
  onSubscribe?: (email: string) => void;
}

export default function SubscribeForm({ onSubscribe }: SubscribeFormProps) {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubscribe?.(email.trim());
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <div className="w-full sm:w-[320px]">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="h-11 bg-transparent"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full gap-2 px-4 py-3 text-sm font-medium sm:w-auto"
        >
          <BellIcon />
          <span>Notify Me</span>
        </Button>
      </div>
    </form>
  );
}
