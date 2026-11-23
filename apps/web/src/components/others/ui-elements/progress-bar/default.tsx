import { Progress } from "@/components/ui/progress-bar";

export default function DefaultProgressbar() {
  return (
    <div className="w-full space-y-5 sm:max-w-[320px]">
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={40} />
    </div>
  );
}
