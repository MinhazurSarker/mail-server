import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils";
import { defaultCustomerDetails } from "./data";
import { CustomerDetailsProps } from "./types";

export default function CustomerDetails({
  data = defaultCustomerDetails,
  className,
  title = "Customer Details",
}: CustomerDetailsProps) {
  const details = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    { label: "Country", value: data.country },
    { label: "Address", value: data.address },
  ];

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-gray-200 bg-white p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col text-sm leading-5">
          {details.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-start gap-5 py-2.5",
                index !== details.length - 1 &&
                  "border-b border-gray-100 dark:border-gray-800",
              )}
            >
              <p className="w-20 shrink-0 text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <p className="min-w-0 flex-1 text-gray-700 dark:text-gray-300">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
