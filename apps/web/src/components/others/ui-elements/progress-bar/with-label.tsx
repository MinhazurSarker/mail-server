import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress-bar";

export default function ProgressBarWithLabel() {
  return (
    <div className="w-full space-y-4 sm:max-w-[320px]">
      <Progress value={40}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressValue />
      </Progress>
      <Progress value={70}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressValue />
      </Progress>
      <Progress value={30}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressValue />
      </Progress>
    </div>
  );
}
