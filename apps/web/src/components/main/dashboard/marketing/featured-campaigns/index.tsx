"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerticalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";
import CampaignRow from "./campaign-row";
import { featuredCampaignsData } from "./data";

export default function FeaturedCampaign() {
  const t = useTranslations("marketing.featuredCampaign");

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-4 pb-3 sm:px-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-4 flex justify-between gap-2 sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              />
            }
          >
            <VerticalDotsIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 p-2">
            <DropdownMenuItem>{t("viewMore")}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-full">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("products")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("campaign")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("status")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {featuredCampaignsData.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
