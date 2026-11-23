"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils";
import { useState } from "react";

const responseToneOptions = ["Concise", "Balanced", "Expressive"];
const outputLengthOptions = ["Short", "Medium", "Long"];

export default function BehaviorSection() {
  const [tone, setTone] = useState("Concise");
  const [creativity, setCreativity] = useState(60);
  const [outputLength, setOutputLength] = useState("Short");

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        AI Behavior
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Response tone */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Response tone
            </h3>
          </div>

          <ButtonGroup className="gap-0.5 rounded-lg bg-gray-100 p-0.5 *:data-slot:rounded-md! dark:bg-gray-800">
            {responseToneOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTone(option)}
                className={cn(
                  "h-8 px-3 text-sm font-medium transition-colors",
                  tone === option
                    ? "bg-white text-gray-900 shadow-theme-xs hover:bg-white hover:text-gray-900 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-900 dark:hover:text-white"
                    : "text-gray-500 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white",
                )}
              >
                {option}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Creativity */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Creativity
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Higher values produce more varied output.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-62.5">
            <Slider
              value={[creativity]}
              onValueChange={(val) => {
                const nextVal = Array.isArray(val) ? val[0] : val;
                if (typeof nextVal === "number") {
                  setCreativity(nextVal);
                }
              }}
              min={0}
              max={100}
              className="flex-1"
            />
            <span className="min-w-9 text-end text-sm font-medium text-gray-700 dark:text-gray-300">
              {creativity}%
            </span>
          </div>
        </div>

        {/* Output length */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Output length
            </h3>
          </div>

          <ButtonGroup className="gap-0.5 rounded-lg bg-gray-100 p-0.5 *:data-slot:rounded-md! dark:bg-gray-800">
            {outputLengthOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOutputLength(option)}
                className={cn(
                  "h-8 px-3 text-sm font-medium transition-colors",
                  outputLength === option
                    ? "bg-white text-gray-900 shadow-theme-xs hover:bg-white hover:text-gray-900 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-900 dark:hover:text-white"
                    : "text-gray-500 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white",
                )}
              >
                {option}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
    </section>
  );
}
