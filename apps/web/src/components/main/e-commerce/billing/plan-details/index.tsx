import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanBenefits from "./plan-benefits";
import PlanInfo from "./plan-info";

export default function PlanDetails() {
  return (
    <Card className="flex flex-col justify-between gap-0 rounded-2xl border border-gray-200 bg-white xl:w-4/6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader className="border-b border-gray-200 pb-5 dark:border-gray-800">
        <CardTitle className="text-lg font-medium text-gray-800 dark:text-white/90">
          Plan Details
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Plan Summary and Progress */}
          <PlanInfo />

          {/* Right Column: Plan Benefits and Actions */}
          <PlanBenefits />
        </div>
      </CardContent>
    </Card>
  );
}

