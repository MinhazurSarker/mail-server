"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PopoverWithArrow() {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-5">
      <div>
        <Popover>
          <PopoverTrigger render={<Button size="sm" />}>
            Without Arrow
          </PopoverTrigger>
          <PopoverContent side="bottom">
            <PopoverHeader>
              <PopoverTitle>Without Arrow</PopoverTitle>
            </PopoverHeader>
            <PopoverBody>
              <PopoverDescription>
                This popover displays without an arrow indicator pointing to
                the trigger.
              </PopoverDescription>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Popover>
          <PopoverTrigger render={<Button size="sm" />}>
            With Arrow
          </PopoverTrigger>
          <PopoverContent side="bottom">
            <PopoverArrow />
            <PopoverHeader>
              <PopoverTitle>With Arrow</PopoverTitle>
            </PopoverHeader>
            <PopoverBody>
              <PopoverDescription>
                This popover includes an arrow indicator pointing directly to
                the trigger button.
              </PopoverDescription>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
