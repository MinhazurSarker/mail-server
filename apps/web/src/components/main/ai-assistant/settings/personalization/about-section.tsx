"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AboutSection() {
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [moreAboutYou, setMoreAboutYou] = useState("");

  const resetForm = () => {
    setNickname("");
    setOccupation("");
    setMoreAboutYou("");
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        About you
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field className="gap-1.5">
              <Label
                htmlFor="nickname"
                className="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                Nickname
              </Label>
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="What should AI call you"
              />
            </Field>

            <Field className="gap-1.5">
              <Label
                htmlFor="occupation"
                className="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                Occupation
              </Label>
              <Input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Software Engineer"
              />
            </Field>
          </div>

          <Field className="gap-1.5">
            <Label
              htmlFor="more-about-you"
              className="text-sm font-medium text-gray-800 dark:text-white/90"
            >
              More about you
            </Label>
            <Input
              id="more-about-you"
              type="text"
              value={moreAboutYou}
              onChange={(e) => setMoreAboutYou(e.target.value)}
              placeholder="Passionate about solving problems and creating value."
            />
          </Field>

          {(nickname?.length > 0 ||
            occupation?.length > 0 ||
            moreAboutYou?.length > 0) && (
            <Button className="ms-auto w-fit" onClick={resetForm}>
              Save
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
