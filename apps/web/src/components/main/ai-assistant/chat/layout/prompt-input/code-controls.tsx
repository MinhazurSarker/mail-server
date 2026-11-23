"use client";

import AttachButton from "./attach-button";
import { CodeControlsProps } from "./types";

export default function CodeControls({ onUploadClick }: CodeControlsProps) {
  return (
    <AttachButton
      onClick={onUploadClick}
      ariaLabel="Attach code or snippet"
    />
  );
}
