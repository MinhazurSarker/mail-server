"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon } from "@/icons";
import { cn } from "@/utils";
import * as React from "react";
import BillingInfoItem from "./billing-info-item";
import { defaultBillingInfo } from "./data";
import EditBillingDialog from "./edit-billing-dialog";
import { BillingAddressData, BillingInfoProps } from "./types";

export default function BillingInfo({
  initialData,
  className,
  onUpdate,
}: BillingInfoProps) {
  const [data, setData] = React.useState<BillingAddressData>(
    initialData ?? defaultBillingInfo,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSave = (updatedData: BillingAddressData) => {
    setData(updatedData);
    onUpdate?.(updatedData);
  };

  return (
    <>
      <Card
        className={cn(
          "flex flex-col justify-between gap-0 rounded-2xl border border-gray-200 bg-white xl:w-2/6 dark:border-gray-800 dark:bg-white/3",
          className,
        )}
      >
        <CardHeader className="border-b border-gray-200 pb-5 dark:border-gray-800">
          <CardTitle className="text-lg font-medium text-gray-800 dark:text-white/90">
            Billing Info
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between pt-6">
          <div className="flex flex-col">
            <BillingInfoItem
              label="Name"
              value={`${data.firstName} ${data.lastName}`.trim()}
            />
            <BillingInfoItem label="Street" value={data.street} />
            <BillingInfoItem label="City/State" value={data.cityState} />
            <BillingInfoItem label="Country" value={data.country} />
            <BillingInfoItem label="Zip/Postal code" value={data.zipCode} />
            <BillingInfoItem label="Town/City" value={data.townCity} />
            <BillingInfoItem label="VAT Number" value={data.vatNumber} />
          </div>

          <div className="mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="w-full gap-2 text-sm font-medium"
            >
              <PencilIcon className="size-5" />
              Update Billing Address
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditBillingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        data={data}
        onSave={handleSave}
      />
    </>
  );
}
