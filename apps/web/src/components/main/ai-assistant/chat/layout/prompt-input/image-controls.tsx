"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { DiamondIcon, LayerIcon } from "@/icons";
import AttachButton from "./attach-button";
import { IMAGE_ASPECT_RATIOS, IMAGE_COUNTS, IMAGE_RESOLUTIONS } from "./data";
import { ImageControlsProps } from "./types";

export default function ImageControls({
  aspectRatio,
  onAspectRatioChange,
  imageCount,
  onImageCountChange,
  resolution,
  onResolutionChange,
  onUploadClick,
}: ImageControlsProps) {
  const selectedImageAspect =
    IMAGE_ASPECT_RATIOS.find((item) => item.id === aspectRatio) ||
    IMAGE_ASPECT_RATIOS[3];

  return (
    <>
      {/* PaperClip Button */}
      <AttachButton
        onClick={onUploadClick}
        ariaLabel="Attach reference image"
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
              {selectedImageAspect.icon}
              <span>{aspectRatio}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-32 min-w-0 p-1.5"
        >
          {IMAGE_ASPECT_RATIOS.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onAspectRatioChange(item.id)}
              className={`gap-2 ${aspectRatio === item.id ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Number of Images (Count) Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-2.5 font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LayerIcon className="size-4.5" />
              <span>{imageCount}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-24 min-w-0 p-1.5"
        >
          {IMAGE_COUNTS.map((cnt) => (
            <DropdownMenuItem
              key={cnt}
              onClick={() => onImageCountChange(cnt)}
              className={`justify-center ${imageCount === cnt ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
            >
              <span>{cnt}</span>
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
              <span>{resolution.toUpperCase()}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-24 min-w-0 p-1.5"
        >
          {IMAGE_RESOLUTIONS.map((res) => (
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
    </>
  );
}
