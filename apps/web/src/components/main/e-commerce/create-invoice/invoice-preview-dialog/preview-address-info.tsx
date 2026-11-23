import { InvoiceDetailsData } from "../types";

interface PreviewAddressInfoProps {
  details: InvoiceDetailsData;
}

export default function PreviewAddressInfo({
  details,
}: PreviewAddressInfoProps) {
  return (
    <div className="my-2 flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between">
      {/* From */}
      <div className="flex-1 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
          </p>
          <h4 className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
            Pimjo LLC
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            1280, Clair Street,
            <br />
            Massachusetts, New York - 02543
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Issued On:
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {details.issueDate || "11 March, 2027"}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden w-px bg-gray-200 sm:block dark:bg-gray-800" />

      {/* To */}
      <div className="flex-1 space-y-4 sm:text-end">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
          </p>
          <h4 className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
            {details.customer || "David Thompson"}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {details.customerAddress ? (
              details.customerAddress
            ) : (
              <>
                355, Shobe Lane
                <br />
                Colorado, Fort Collins - 80543
              </>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Due On:
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {details.dueDate || "16 March, 2027"}
          </p>
        </div>
      </div>
    </div>
  );
}
