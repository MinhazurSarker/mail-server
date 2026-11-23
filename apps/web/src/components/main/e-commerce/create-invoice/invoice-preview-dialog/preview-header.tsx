import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface PreviewHeaderProps {
  invoiceNumber?: string;
}

export default function PreviewHeader({ invoiceNumber }: PreviewHeaderProps) {
  const displayInvoiceNumber = invoiceNumber || "34834";

  return (
    <div className="border-b border-gray-100 pb-5 dark:border-gray-800">
      <DialogTitle className="text-title-sm font-medium text-gray-800 dark:text-white/90">
        Invoice: #{displayInvoiceNumber}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Invoice details preview for #{displayInvoiceNumber}
      </DialogDescription>
    </div>
  );
}
