"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ClockIcon } from "@/icons";
import * as React from "react";
import { AddMeetingDialogProps, MeetingItem, Participant } from "./types";

const AVAILABLE_PARTICIPANTS: Participant[] = [
  { name: "Alex Morgan", avatar: "/images/user/user-01.jpg" },
  { name: "Sarah Connor", avatar: "/images/user/user-02.jpg" },
  { name: "David Miller", avatar: "/images/user/user-03.jpg" },
  { name: "Emily Blunt", avatar: "/images/user/user-04.jpg" },
  { name: "Michael Chang", avatar: "/images/user/user-05.jpg" },
];

export default function AddMeetingDialog({
  isOpen,
  onOpenChange,
  onAddMeeting,
  activeDate = 21,
}: AddMeetingDialogProps) {
  const [title, setTitle] = React.useState("");
  const [meetingType, setMeetingType] = React.useState("interview");
  const [meetingFormat, setMeetingFormat] = React.useState<
    "online" | "in-person"
  >("online");
  const [time, setTime] = React.useState("10:00 AM - 11:30 AM");
  const [selectedParticipants, setSelectedParticipants] = React.useState<
    string[]
  >(["Alex Morgan", "Sarah Connor"]);
  const [notifyAttendees, setNotifyAttendees] = React.useState(true);

  const toggleParticipant = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenParticipants = AVAILABLE_PARTICIPANTS.filter((p) =>
      selectedParticipants.includes(p.name),
    );

    const newMeeting: MeetingItem = {
      id: `meeting-${Date.now()}`,
      title: title.trim(),
      time: time.trim() || "10:00 AM - 11:00 AM",
      participants:
        chosenParticipants.length > 0
          ? chosenParticipants
          : [AVAILABLE_PARTICIPANTS[0]],
      extraParticipantsCount:
        chosenParticipants.length > 5
          ? chosenParticipants.length - 5
          : undefined,
      date: activeDate,
      format: meetingFormat,
      category: meetingType,
    };

    onAddMeeting(newMeeting);
    setTitle("");
    setTime("10:00 AM - 11:30 AM");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-140 p-6">
        <DialogHeader>
          <DialogTitle>Add New Meeting</DialogTitle>
          <DialogDescription>
            Schedule an interview or team discussion for your HR calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Meeting Title */}
          <Field>
            <FieldLabel>Meeting Title</FieldLabel>
            <Input
              type="text"
              placeholder="e.g. Senior Frontend Engineer Interview"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>

          {/* Meeting Type & Format */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Meeting Type</FieldLabel>
              <Select
                value={meetingType}
                onValueChange={(val) => setMeetingType(val ?? "interview")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">Candidate Interview</SelectItem>
                  <SelectItem value="sync">Team Sync</SelectItem>
                  <SelectItem value="evaluation">
                    Performance Evaluation
                  </SelectItem>
                  <SelectItem value="onboarding">
                    New Hire Onboarding
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Meeting Format</FieldLabel>
              <RadioGroup
                value={meetingFormat}
                onValueChange={(val) =>
                  setMeetingFormat(val as "online" | "in-person")
                }
                className="flex items-center gap-4 pt-2.5"
              >
                <Field orientation="horizontal" className="w-auto gap-2">
                  <RadioGroupItem id="format-online" value="online" />
                  <Label
                    htmlFor="format-online"
                    className="cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-300"
                  >
                    Online
                  </Label>
                </Field>
                <Field orientation="horizontal" className="w-auto gap-2">
                  <RadioGroupItem id="format-in-person" value="in-person" />
                  <Label
                    htmlFor="format-in-person"
                    className="cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-300"
                  >
                    In-person
                  </Label>
                </Field>
              </RadioGroup>
            </Field>
          </div>

          {/* Meeting Time */}
          <Field>
            <FieldLabel>Meeting Time</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <ClockIcon className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="e.g. 11:00 AM - 12:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </InputGroup>
          </Field>

          <Separator className="my-2" />

          {/* Attendees Selection */}
          <div>
            <Label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Attendees
            </Label>
            <div className="grid max-h-36 grid-cols-1 gap-2.5 overflow-y-auto pe-1 sm:grid-cols-2">
              {AVAILABLE_PARTICIPANTS.map((participant, index) => {
                const isChecked = selectedParticipants.includes(
                  participant.name,
                );
                const participantId = `participant-${index}`;
                return (
                  <Field
                    key={participant.name}
                    orientation="horizontal"
                    className="cursor-pointer rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/3"
                  >
                    <Checkbox
                      id={participantId}
                      checked={isChecked}
                      onCheckedChange={() =>
                        toggleParticipant(participant.name)
                      }
                    />
                    <Label
                      htmlFor={participantId}
                      className="cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {participant.name}
                    </Label>
                  </Field>
                );
              })}
            </div>
          </div>

          {/* Notifications Checkbox */}
          <div className="pt-1">
            <Field orientation="horizontal" className="w-auto gap-2.5">
              <Checkbox
                id="notify-attendees"
                checked={notifyAttendees}
                onCheckedChange={(checked) =>
                  setNotifyAttendees(Boolean(checked))
                }
              />
              <Label
                htmlFor="notify-attendees"
                className="cursor-pointer text-xs font-normal text-gray-600 dark:text-gray-400"
              >
                Send calendar invitation and email notifications to attendees
              </Label>
            </Field>
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-500 text-white hover:bg-brand-600"
            >
              Schedule Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
