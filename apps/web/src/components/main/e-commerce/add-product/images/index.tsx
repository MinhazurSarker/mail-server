"use client";

import { UploadIcon } from "@/icons";
import { cn } from "@/utils";
import { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

interface UploadedFile {
  file: File;
  previewUrl: string;
}

export default function ProductImages() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingFiles: File[]) => {
    const newFiles: UploadedFile[] = Array.from(incomingFiles).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const [{ canDrop, isOver }, dropRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        if (item?.files?.length) {
          handleFiles(item.files);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [],
  );

  const isActive = isOver && canDrop;

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h2 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          Products Images
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        <div
          ref={(node) => {
            if (node) dropRef(node);
          }}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleContainerClick();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload product images"
          className={cn(
            "flex min-h-50 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-brand-500",
            isActive
              ? "border-brand-500 bg-brand-50/20 dark:border-brand-400 dark:bg-brand-500/10"
              : "border-gray-300 hover:border-brand-500 dark:border-gray-700 dark:hover:border-brand-400",
          )}
        >
          <div className="mb-4 flex size-13 items-center justify-center rounded-full border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <UploadIcon className="size-6 text-gray-700 dark:text-gray-300" />
          </div>

          <div className="text-center text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-white/90">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm dark:text-gray-500">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/svg+xml,image/png,image/jpeg,image/gif"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {/* Uploaded Files Preview */}
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {files.map((uploaded, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploaded.previewUrl}
                  alt={uploaded.file.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute inset-e-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                  aria-label="Remove image"
                >
                  &times;
                </button>
                <div className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {uploaded.file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
