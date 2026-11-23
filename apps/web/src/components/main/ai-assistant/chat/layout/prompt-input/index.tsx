"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import CodeControls from "./code-controls";
import { MODE_CONFIG } from "./data";
import ImageControls from "./image-controls";
import ModelSelector from "./model-selector";
import SubmitButton from "./submit-button";
import TextControls from "./text-controls";
import {
  AiPromptInputProps,
  GeneratorMode,
  ModelOption,
  SearchMode,
} from "./types";
import VideoControls from "./video-controls";

export default function AiPromptInput({ mode, onSend }: AiPromptInputProps) {
  const params = useParams();
  const routeSlug = (params?.slug as string) || "text";
  const currentMode: GeneratorMode =
    mode ||
    (routeSlug === "image" || routeSlug === "code" || routeSlug === "video"
      ? routeSlug
      : "text");

  const config = MODE_CONFIG[currentMode] || MODE_CONFIG.text;

  const [modelOverrides, setModelOverrides] = useState<
    Partial<Record<GeneratorMode, ModelOption>>
  >({});

  const selectedModel = modelOverrides[currentMode] || config.defaultModel;

  const [prompt, setPrompt] = useState("");

  // Text generator specific options
  const [searchMode, setSearchMode] = useState<SearchMode>("web");

  // Image generator specific options
  const [imageAspectRatio, setImageAspectRatio] = useState("3:4");
  const [imageCount, setImageCount] = useState(2);
  const [imageResolution, setImageResolution] = useState("1k");

  // Video generator specific options
  const [videoAspectRatio, setVideoAspectRatio] = useState("9:16");
  const [videoResolution, setVideoResolution] = useState("720p");
  const [videoDuration, setVideoDuration] = useState("4s");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectModel = (model: ModelOption) => {
    setModelOverrides((prev) => ({
      ...prev,
      [currentMode]: model,
    }));
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSend?.(prompt, selectedModel.id, {
      searchMode: currentMode === "text" ? searchMode : undefined,
      aspectRatio:
        currentMode === "image"
          ? imageAspectRatio
          : currentMode === "video"
            ? videoAspectRatio
            : undefined,
      imageCount: currentMode === "image" ? imageCount : undefined,
      resolution:
        currentMode === "image"
          ? imageResolution
          : currentMode === "video"
            ? videoResolution
            : undefined,
      duration: currentMode === "video" ? videoDuration : undefined,
      sound: currentMode === "video" ? soundEnabled : undefined,
    });
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isSend = currentMode === "text" || Boolean(prompt.trim());

  return (
    <div className="mx-auto w-full max-w-180 px-4 pt-2 pb-4 sm:px-0">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          // Placeholder for file selection handling
          if (e.target.files && e.target.files.length > 0) {
            e.target.value = "";
          }
        }}
      />

      <InputGroup className="flex-col rounded-2xl border-gray-200 p-3 transition dark:border-gray-800 dark:bg-gray-900">
        <InputGroupTextarea
          rows={2}
          placeholder={config.placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-16 w-full resize-none p-2 text-sm text-gray-800 shadow-none placeholder:text-gray-400 dark:text-white"
        />

        <InputGroupAddon
          align="block-end"
          className="flex w-full items-center justify-between border-none p-0 pt-2"
        >
          {/* Mode-Specific Left Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {currentMode === "text" && (
              <TextControls
                searchMode={searchMode}
                onSearchModeChange={setSearchMode}
                onUploadClick={handleUploadClick}
              />
            )}

            {currentMode === "image" && (
              <ImageControls
                aspectRatio={imageAspectRatio}
                onAspectRatioChange={setImageAspectRatio}
                imageCount={imageCount}
                onImageCountChange={setImageCount}
                resolution={imageResolution}
                onResolutionChange={setImageResolution}
                onUploadClick={handleUploadClick}
              />
            )}

            {currentMode === "code" && (
              <CodeControls onUploadClick={handleUploadClick} />
            )}

            {currentMode === "video" && (
              <VideoControls
                aspectRatio={videoAspectRatio}
                onAspectRatioChange={setVideoAspectRatio}
                resolution={videoResolution}
                onResolutionChange={setVideoResolution}
                duration={videoDuration}
                onDurationChange={setVideoDuration}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((prev) => !prev)}
                onUploadClick={handleUploadClick}
              />
            )}
          </div>

          {/* Model Selector & Action Buttons */}
          <div className="flex items-center gap-2">
            <ModelSelector
              models={config.models}
              selectedModel={selectedModel}
              onSelectModel={handleSelectModel}
            />

            <SubmitButton isSend={isSend} onClick={handleSubmit} />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
