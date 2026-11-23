"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { cn } from "@/utils";
import { Candidate, CandidateStatus } from "./types";

export interface CandidateRowProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onEdit?: (candidate: Candidate) => void;
}

const statusBadgeColorMap: Record<
  CandidateStatus,
  "success" | "warning" | "error"
> = {
  Hired: "success",
  "In Progress": "warning",
  Pending: "error",
};

export default function CandidateRow({
  candidate,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: CandidateRowProps) {
  const badgeColor = statusBadgeColorMap[candidate.status] ?? "warning";

  return (
    <TableRow
      className={cn(
        "border-b border-gray-200 transition-colors last:border-b-0 dark:border-gray-800",
        isSelected
          ? "bg-gray-50/75 dark:bg-white/4"
          : "hover:bg-gray-50/50 dark:hover:bg-white/2",
      )}
    >
      {/* User Cell with Checkbox */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 sm:px-6 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(candidate.id)}
            aria-label={`Select ${candidate.user.name}`}
          />
          <div className="flex flex-col text-start">
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
              {candidate.user.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {candidate.user.email}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Position Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {candidate.position}
        </span>
      </TableCell>

      {/* Salary Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {candidate.salary}
        </span>
      </TableCell>

      {/* Office Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {candidate.office}
        </span>
      </TableCell>

      {/* Status Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <Badge variant="light" size="sm" color={badgeColor}>
          {candidate.status}
        </Badge>
      </TableCell>

      {/* Action Cell */}
      <TableCell className="px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete?.(candidate.id)}
            className="text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
            aria-label={`Delete ${candidate.user.name}`}
          >
            <TrashBinIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(candidate)}
            className="text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
            aria-label={`Edit ${candidate.user.name}`}
          >
            <PencilIcon className="size-5" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
