"use client";

import { useMemo, useState } from "react";
import { initialModels } from "./data";
import ModelsHeader from "./header";
import ModelListItem from "./model-list-item";
import type { ModelData } from "./types";

export default function AllModels() {
  const [models, setModels] = useState<ModelData[]>(initialModels);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("All");
  const [generation, setGeneration] = useState("All");

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    return models.filter((model) => {
      const matchesSearch =
        !query ||
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query);
      const matchesProvider =
        provider === "All" || model.provider === provider;
      const matchesGeneration =
        generation === "All" || model.generation === generation;

      return matchesSearch && matchesProvider && matchesGeneration;
    });
  }, [models, search, provider, generation]);

  const handleToggle = (id: string) => {
    setModels((prev) =>
      prev.map((model) =>
        model.id === id ? { ...model, enabled: !model.enabled } : model,
      ),
    );
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        All Models
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <ModelsHeader
          search={search}
          onSearchChange={setSearch}
          provider={provider}
          onProviderChange={setProvider}
          generation={generation}
          onGenerationChange={setGeneration}
        />

        <div className="flex flex-col">
          {filteredModels.map((model, index) => (
            <ModelListItem
              key={model.id}
              item={model}
              isLast={index === filteredModels.length - 1}
              onToggle={handleToggle}
            />
          ))}

          {filteredModels.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No models match your search or filter criteria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
