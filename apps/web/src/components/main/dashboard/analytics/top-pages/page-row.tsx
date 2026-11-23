import { PageItem } from "./types";

interface PageRowProps {
  page: PageItem;
}

export default function PageRow({ page }: PageRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {page.path}
      </span>
      <span className="text-end text-sm text-gray-500 dark:text-gray-400">
        {page.pageviews}
      </span>
    </div>
  );
}
