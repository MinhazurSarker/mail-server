import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress-bar";

export default function ProgressBarInMultipleSizes() {
  return (
    <div className="w-full space-y-4 sm:max-w-[320px]">
      <Progress value={50}>
        <ProgressTrack className="h-2 rounded-full">
          <ProgressIndicator className="rounded-none" />
        </ProgressTrack>
      </Progress>
      <Progress value={50}>
        <ProgressTrack className="h-3 rounded-full">
          <ProgressIndicator className="rounded-none" />
        </ProgressTrack>
      </Progress>
      <Progress value={50}>
        <ProgressTrack className="h-4 rounded-full">
          <ProgressIndicator className="rounded-none" />
        </ProgressTrack>
      </Progress>
      <Progress value={50}>
        <ProgressTrack className="h-5 rounded-full">
          <ProgressIndicator className="rounded-none" />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
