import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils";
import { defaultOrderHistoryItems } from "./data";
import { OrderHistoryProps } from "./types";

export default function OrderHistory({
  items = defaultOrderHistoryItems,
  title = "Order History",
  className,
}: OrderHistoryProps) {
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
      <CardContent className="pt-2">
        <div className="flex flex-col">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <div key={item.id} className="flex gap-4">
                {/* Timeline icon circle with dashed line beneath */}
                <div className="flex flex-col items-center">
                  <div className="relative z-1 flex size-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-theme-xs dark:bg-gray-800">
                      {item.icon}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="my-1.5 w-0 flex-1 border-s border-dashed border-gray-200 dark:border-gray-800" />
                  )}
                </div>

                {/* Timeline item content */}
                <div
                  className={cn(
                    "flex min-w-0 flex-1 flex-col gap-1 pt-0.5",
                    !isLast ? "pb-6" : "pb-0",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {item.title}
                    </p>
                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {item.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {item.subtitle}
                    </p>
                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {item.date}
                    </span>
                  </div>

                  {item.actions && item.actions.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      {item.actions.map((action, actionIdx) => (
                        <Button
                          key={actionIdx}
                          variant="outline"
                          size="xs"
                          onClick={action.onClick}
                          className="h-7 shrink-0 rounded-md px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export * from "./data";
export * from "./icons";
export * from "./types";
