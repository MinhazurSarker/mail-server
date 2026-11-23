"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Campaign } from "./types";

export interface CampaignRowProps {
  campaign: Campaign;
}

export default function CampaignRow({ campaign }: CampaignRowProps) {
  const t = useTranslations("marketing.featuredCampaign");

  return (
    <TableRow>
      <TableCell className="py-3">
        <div className="flex items-center gap-4.5">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <Image
              width={40}
              height={40}
              src={campaign.creator.image}
              alt={campaign.creator.name}
            />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              {campaign.creator.name}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex w-full items-center gap-5">
          <div className="w-full max-w-8">
            <Image
              width={40}
              height={40}
              src={campaign.campaign.image}
              alt="brand"
            />
          </div>
          <div className="truncate">
            <p className="mb-0.5 truncate text-sm font-medium text-gray-700 dark:text-gray-400">
              {t(`campaigns.${campaign.campaign.nameKey}`)}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("adsCampaign")}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge
          size="sm"
          color={
            campaign.status === "success"
              ? "success"
              : campaign.status === "pending"
                ? "warning"
                : "error"
          }
        >
          {t(`statuses.${campaign.status}`)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
