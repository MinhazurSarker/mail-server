"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/icons";
import React, { useState } from "react";
import KeyItem from "./key-item";

interface ApiKeyData {
  id: string;
  title: string;
  keyValue: string;
}

const initialKeys: ApiKeyData[] = [
  {
    id: "prod-key",
    title: "Production key",
    keyValue: "lk_live_••••••••••••42ab",
  },
];

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyData[]>(initialKeys);

  const handleRotateKey = (id: string) => {
    setKeys((prev) =>
      prev.map((key) => {
        if (key.id === id) {
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          return {
            ...key,
            keyValue: `lk_live_••••••••••••${randomSuffix}`,
          };
        }
        return key;
      })
    );
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) => prev.filter((key) => key.id !== id));
  };

  const handleGenerateKey = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newKey: ApiKeyData = {
      id: `key-${Date.now()}`,
      title: `Secret key ${keys.length + 1}`,
      keyValue: `lk_live_••••••••••••${randomSuffix}`,
    };
    setKeys((prev) => [...prev, newKey]);
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        API Keys
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {keys.map((key) => (
          <KeyItem
            key={key.id}
            title={key.title}
            keyValue={key.keyValue}
            onRotate={() => handleRotateKey(key.id)}
            onRevoke={() => handleRevokeKey(key.id)}
            isLast={false}
          />
        ))}

        {/* Generate new key row */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Generate new key
            </h3>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateKey}
            >
              <PlusIcon className="size-5" />
              <span>New key</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
