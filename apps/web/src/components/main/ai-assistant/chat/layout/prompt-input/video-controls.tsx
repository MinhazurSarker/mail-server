"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ClockIcon, DiamondIcon, MuteIcon, SoundIcon } from "@/icons";
import { cn } from "@/utils";
import AttachButton from "./attach-button";
import {
  VIDEO_ASPECT_RATIOS,
  VIDEO_DURATIONS,
  VIDEO_RESOLUTIONS,
} from "./data";
import { VideoControlsProps } from "./types";

export default function VideoControls({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  duration,
  onDurationChange,
  soundEnabled,
  onToggleSound,
  onUploadClick,
}: VideoControlsProps) {
  const selectedVideoAspect =
    VIDEO_ASPECT_RATIOS.find((item) => item.id === aspectRatio) ||
    VIDEO_ASPECT_RATIOS[3];

  return (
    <>
      {/* PaperClip Button */}
      <AttachButton
        onClick={onUploadClick}
        ariaLabel="Attach video reference"
      />

      {/* Aspect Ratio Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-2.5 font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {selectedVideoAspect.icon}
              <span>{aspectRatio}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-32 min-w-0 p-1.5"
        >
          {VIDEO_ASPECT_RATIOS.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onAspectRatioChange(item.id)}
              className={`gap-2 ${videoAspectRatioCheck(aspectRatio, item.id) ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Resolution Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-2.5 font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <DiamondIcon className="size-4.5" />
              <span>{resolution}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-24 min-w-0 p-1.5"
        >
          {VIDEO_RESOLUTIONS.map((res) => (
            <DropdownMenuItem
              key={res}
              onClick={() => onResolutionChange(res)}
              className={`justify-center ${resolution === res ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
            >
              <span>{res}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duration Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-2.5 font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ClockIcon className="size-4.5" />
              <span>{duration}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-24 min-w-0 p-1.5"
        >
          {VIDEO_DURATIONS.map((dur) => (
            <DropdownMenuItem
              key={dur}
              onClick={() => onDurationChange(dur)}
              className={`justify-center ${duration === dur ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
            >
              <span>{dur}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sound Toggle Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onToggleSound}
        className={cn(
          "h-9 gap-1.5 px-2.5 font-medium border-gray-200",
          soundEnabled
            ? "bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            : "bg-gray-50 text-gray-400 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-500",
        )}
        aria-label="Toggle sound"
      >
        {soundEnabled ? (
          <SoundIcon className="size-4.5" />
        ) : (
          <MuteIcon className="size-4.5" />
        )}
        <span>Sound</span>
      </Button>
    </>
  );
}

function videoAspectRatioCheck(current: string, target: string) {
  return current === target;
}
