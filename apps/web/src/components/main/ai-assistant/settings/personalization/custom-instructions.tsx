"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function CustomInstructions() {
  const [instructions, setInstructions] = useState("");

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Custom Interactions
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="instructions"
            className="text-sm font-medium text-gray-800 dark:text-white/90"
          >
            Instructions
          </label>
          <Textarea
            id="instructions"
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Be direct. Skip preamble. Use markdown. Prefer examples over abstractions."
            className="w-full resize-y placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />

          {instructions?.length > 0 && (
            <Button
              className="ms-auto w-fit"
              onClick={() => setInstructions("")}
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
