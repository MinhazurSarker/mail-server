"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/utils";
import * as React from "react";
import AddApiKeyDialog from "./add-api-key-dialog";
import ApiKeyRow from "./api-key-row";
import CardHeader from "./card-header";
import { defaultApiKeys } from "./data";
import TableHeader from "./table-header";
import { ApiKey, ApiKeyTableProps } from "./types";

export default function ApiKeys({
  className,
  initialData = defaultApiKeys,
  onAddKey,
  onDeleteKey,
  onToggleKey,
}: ApiKeyTableProps) {
  const [keys, setKeys] = React.useState<ApiKey[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleToggle = (id: string, enabled: boolean) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status: enabled ? "Active" : "Disabled",
            }
          : k,
      ),
    );
    onToggleKey?.(id, enabled);
  };

  const handleDelete = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    onDeleteKey?.(id);
  };

  const handleAdd = (name: string) => {
    const randomHex = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const newKey: ApiKey = {
      id: String(Date.now()),
      name,
      value: `sk_live_**********${randomHex}`,
      status: "Active",
      created: "Just now",
      lastUsed: "Never",
      hasToggle: true,
    };
    setKeys((prev) => [newKey, ...prev]);
    onAddKey?.(name);
  };

  return (
    <>
      <Card
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
          className,
        )}
      >
        <CardHeader onAddClick={() => setIsDialogOpen(true)} />

        <CardContent className="-mx-6">
          <ScrollArea scrollbars="horizontal" className="w-full">
            <Table className="min-w-187.5">
              <TableHeader />
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {keys.map((apiKey) => (
                  <ApiKeyRow
                    key={apiKey.id}
                    apiKey={apiKey}
                    onToggleStatus={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddApiKeyDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGenerate={handleAdd}
      />
    </>
  );
}
