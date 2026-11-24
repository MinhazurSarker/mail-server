"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { CalendarEvent, EventFormData } from "./types";

export interface CalendarEventModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  selectedEvent: CalendarEvent | null;
  initialStartDate?: string;
  initialEndDate?: string;
  onSave: (data: EventFormData) => void;
  onDelete?: (id: string) => void;
}

const EVENT_COLORS = [
  { label: "Primary", value: "Primary", bgClass: "bg-blue-500", textClass: "text-blue-500", borderClass: "border-blue-500" },
  { label: "Success", value: "Success", bgClass: "bg-emerald-500", textClass: "text-emerald-500", borderClass: "border-emerald-500" },
  { label: "Warning", value: "Warning", bgClass: "bg-amber-500", textClass: "text-amber-500", borderClass: "border-amber-500" },
  { label: "Danger", value: "Danger", bgClass: "bg-rose-500", textClass: "text-rose-500", borderClass: "border-rose-500" },
  { label: "Info", value: "Info", bgClass: "bg-cyan-500", textClass: "text-cyan-500", borderClass: "border-cyan-500" },
] as const;

export default function CalendarEventModal({
  open,
  onOpenChange,
  isOpen,
  onClose,
  selectedEvent,
  initialStartDate = "",
  initialEndDate = "",
  onSave,
  onDelete,
}: CalendarEventModalProps) {
  const isModalOpen = open ?? isOpen ?? false;
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      onClose?.();
    }
  };

  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  useEffect(() => {
    if (isModalOpen) {
      if (selectedEvent) {
        setEventTitle((selectedEvent.title as string) || "");
        const startStr =
          typeof selectedEvent.start === "string"
            ? selectedEvent.start.split("T")[0]
            : selectedEvent.start instanceof Date
              ? selectedEvent.start.toISOString().split("T")[0]
              : "";
        const endStr =
          typeof selectedEvent.end === "string"
            ? selectedEvent.end.split("T")[0]
            : selectedEvent.end instanceof Date
              ? selectedEvent.end.toISOString().split("T")[0]
              : startStr;
        setEventStartDate(startStr);
        setEventEndDate(endStr || startStr);
        setEventLevel(selectedEvent.extendedProps?.calendar || "Primary");
        setEventLocation((selectedEvent.extendedProps as any)?.location || "");
        setEventDescription((selectedEvent.extendedProps as any)?.description || "");
      } else {
        setEventTitle("");
        setEventStartDate(initialStartDate);
        setEventEndDate(initialEndDate || initialStartDate);
        setEventLevel("Primary");
        setEventLocation("");
        setEventDescription("");
      }
    }
  }, [isModalOpen, selectedEvent, initialStartDate, initialEndDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    onSave({
      title: eventTitle.trim(),
      start: eventStartDate,
      end: eventEndDate || eventStartDate,
      level: eventLevel,
      location: eventLocation.trim() || undefined,
      description: eventDescription.trim() || undefined,
    } as any);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1E2635] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {selectedEvent ? "Edit Event" : "Create Calendar Event"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
            {selectedEvent
              ? "Update details or reschedule this event."
              : "Schedule a meeting, deadline, or milestone."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Event Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Event Title *
            </Label>
            <Input
              required
              placeholder="e.g. Product Review with Wayne Corp"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="h-10 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Event Color / Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Category & Color
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {EVENT_COLORS.map((col) => {
                const isSelected = eventLevel === col.value;
                return (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setEventLevel(col.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold ring-1 ring-brand-500"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className={`size-2 rounded-full ${col.bgClass}`} />
                    <span>{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Start Date *
              </Label>
              <Input
                type="date"
                required
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="h-10 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                End Date *
              </Label>
              <Input
                type="date"
                required
                value={eventEndDate}
                min={eventStartDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="h-10 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Location / Meeting Link */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Location / Video Link (Optional)
            </Label>
            <Input
              placeholder="e.g. Conference Room A, or https://meet.jit.si/..."
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="h-10 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Notes / Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Notes (Optional)
            </Label>
            <textarea
              rows={2}
              placeholder="Agenda items, dial-in codes, or description..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            {selectedEvent && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this event?")) {
                    onDelete(String(selectedEvent.id));
                  }
                }}
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium cursor-pointer"
              >
                {selectedEvent ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
