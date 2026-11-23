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

export default function DefaultPopover() {
  return (
    <div className="custom-scrollbar max-w-full overflow-auto sm:overflow-visible">
      <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:gap-5">
        <div>
          <Popover>
            <PopoverTrigger render={<Button size="sm" />}>
              Popover on Top
            </PopoverTrigger>
            <PopoverContent side="top">
              <PopoverArrow />
              <PopoverHeader>
                <PopoverTitle>Top Popover</PopoverTitle>
              </PopoverHeader>
              <PopoverBody>
                <PopoverDescription>
                  Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris
                  facilisis congue exclamate justo nec facilisis.
                </PopoverDescription>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover>
            <PopoverTrigger render={<Button size="sm" />}>
              Popover on Bottom
            </PopoverTrigger>
            <PopoverContent side="bottom">
              <PopoverArrow />
              <PopoverHeader>
                <PopoverTitle>Bottom Popover</PopoverTitle>
              </PopoverHeader>
              <PopoverBody>
                <PopoverDescription>
                  Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris
                  facilisis congue exclamate justo nec facilisis.
                </PopoverDescription>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover>
            <PopoverTrigger render={<Button size="sm" />}>
              Popover on Right
            </PopoverTrigger>
            <PopoverContent side="right">
              <PopoverArrow />
              <PopoverHeader>
                <PopoverTitle>Right Popover</PopoverTitle>
              </PopoverHeader>
              <PopoverBody>
                <PopoverDescription>
                  Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris
                  facilisis congue exclamate justo nec facilisis.
                </PopoverDescription>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover>
            <PopoverTrigger render={<Button size="sm" />}>
              Popover on Left
            </PopoverTrigger>
            <PopoverContent side="left">
              <PopoverArrow />
              <PopoverHeader>
                <PopoverTitle>Left Popover</PopoverTitle>
              </PopoverHeader>
              <PopoverBody>
                <PopoverDescription>
                  Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris
                  facilisis congue exclamate justo nec facilisis.
                </PopoverDescription>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
