import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress-bar";

export default function ProgressBarWithLabelInside() {
  return (
    <div className="w-full space-y-5 sm:max-w-[320px]">
      <Progress value={40}>
        <ProgressTrack className="h-4 rounded-full">
          <ProgressIndicator className="flex items-center justify-center rounded-full">
            <ProgressValue className="ms-0 text-[10px] font-medium text-white dark:text-white" />
          </ProgressIndicator>
        </ProgressTrack>
      </Progress>
      <Progress value={70}>
        <ProgressTrack className="h-4 rounded-full">
          <ProgressIndicator className="flex items-center justify-center rounded-none">
            <ProgressValue className="ms-0 text-[10px] font-medium text-white dark:text-white" />
          </ProgressIndicator>
        </ProgressTrack>
      </Progress>
    </div>
  );
}
