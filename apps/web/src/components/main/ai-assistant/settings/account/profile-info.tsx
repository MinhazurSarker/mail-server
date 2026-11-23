"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useRef, useState } from "react";

export default function ProfileInfo() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    "/images/user/owner.png",
  );
  const [fullName, setFullName] = useState("Musharof Chowdhory");
  const [email, setEmail] = useState("randomuser@pimjo.com");
  const [workspaceName, setWorkspaceName] = useState("Pimjo");
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const initialLetter = fullName.trim()
    ? fullName.trim()[0].toUpperCase()
    : "M";

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Profile info
      </h2>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Avatar Row */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <Avatar className="size-15 shrink-0">
            <AvatarImage
              src={avatarUrl || "/images/user/owner.png"}
              alt={fullName || "Avatar"}
            />
            <AvatarFallback className="bg-brand-400 text-2xl font-medium text-white dark:bg-brand-400 dark:text-white">
              {initialLetter}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
              id="avatar-file-input"
            />
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="h-8"
            >
              Upload avatar
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Min 400x400px, PNG or JPEG formats.
            </p>
          </div>
        </div>

        {/* Full Name Field */}
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <Field className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <FieldLabel className="text-sm font-medium text-gray-800 dark:text-white/90">
              Full Name
            </FieldLabel>
            <div className="w-full sm:w-70">
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Musharof Chowdhory"
              />
            </div>
          </Field>
        </div>

        {/* Email Field */}
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <Field className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <FieldLabel className="text-sm font-medium text-gray-800 dark:text-white/90">
              Email
            </FieldLabel>
            <div className="w-full sm:w-70">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="randomuser@pimjo.com"
              />
            </div>
          </Field>
        </div>

        {/* Workspace Name Field */}
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <Field className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <FieldLabel className="text-sm font-medium text-gray-800 dark:text-white/90">
              Workspace Name
            </FieldLabel>
            <div className="w-full sm:w-70">
              <Input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Pimjo"
              />
            </div>
          </Field>
        </div>

        {/* Save Changes Footer */}
        <div className="flex items-center justify-end px-5 py-4">
          <Button type="submit" variant="default" size="sm">
            {isSaved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
