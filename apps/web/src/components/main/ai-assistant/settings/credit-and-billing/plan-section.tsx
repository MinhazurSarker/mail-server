"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress-bar";
import { SparkIcon } from "@/icons";

export default function PlanSection() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Current Plan
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Plan Header & Upgrade */}
        <div className="flex flex-col gap-3 border-b border-dashed border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              You&apos;re on Pro plan
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upgrade to team anytime
            </p>
          </div>

          <Button type="button" size="sm">
            Upgrade to Team
          </Button>
        </div>

        {/* Credits Card */}
        <div className="p-3 pt-4">
          <div className="rounded-lg bg-gray-50 p-5 dark:bg-gray-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-800 dark:text-white/90">
                <SparkIcon className="size-5" />
                <span className="text-sm font-medium">Credits remaining</span>
              </div>
              <span className="font-outfit text-sm font-medium text-gray-800 dark:text-white/90">
                50
              </span>
            </div>

            <div className="my-3">
              <Progress value={100} className="w-full" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col text-start">
                <span className="text-xs font-normal text-gray-800 dark:text-white/90">
                  Daily credits
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Resets to 50 credits in 12 hours
                </span>
              </div>
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                50
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
