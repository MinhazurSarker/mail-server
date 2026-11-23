"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface RenameChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onSave: (newTitle: string) => void;
}

export default function RenameChatDialog({
  open,
  onOpenChange,
  currentTitle,
  onSave,
}: RenameChatDialogProps) {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
    }
  }, [open, currentTitle]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-120 p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base font-semibold text-gray-800 dark:text-white/90">
            Rename Chat
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-5"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chat title"
            autoFocus
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
