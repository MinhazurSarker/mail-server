import { CardTitle, CardHeader as Header } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/icons";

interface CardHeaderProps {
  onViewAll?: () => void;
}

export default function CardHeader({ onViewAll }: CardHeaderProps) {
  return (
    <Header className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4.5 dark:border-gray-800">
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Recent Files
      </CardTitle>

      {onViewAll ? (
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
        >
          View All
          <ArrowRightIcon className="size-4 rtl:rotate-180" />
        </button>
      ) : (
        <Link
          href="#"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
        >
          View All
          <ArrowRightIcon className="size-4 rtl:rotate-180" />
        </Link>
      )}
    </Header>
  );
}
