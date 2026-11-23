"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/icons";

export default function PopoverWithLink() {
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

                <PopoverFooter>
                  <PopoverClose
                    nativeButton={false}
                    render={
                      <Link
                        href="#"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      />
                    }
                  >
                    Learn More
                    <ArrowRightIcon className="size-4 rtl:rotate-180" />
                  </PopoverClose>
                </PopoverFooter>
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

                <PopoverFooter>
                  <PopoverClose
                    nativeButton={false}
                    render={
                      <Link
                        href="#"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      />
                    }
                  >
                    Learn More
                    <ArrowRightIcon className="size-4 rtl:rotate-180" />
                  </PopoverClose>
                </PopoverFooter>
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

                <PopoverFooter>
                  <PopoverClose
                    nativeButton={false}
                    render={
                      <Link
                        href="#"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      />
                    }
                  >
                    Learn More
                    <ArrowRightIcon className="size-4 rtl:rotate-180" />
                  </PopoverClose>
                </PopoverFooter>
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

                <PopoverFooter>
                  <PopoverClose
                    nativeButton={false}
                    render={
                      <Link
                        href="#"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      />
                    }
                  >
                    Learn More
                    <ArrowRightIcon className="size-4 rtl:rotate-180" />
                  </PopoverClose>
                </PopoverFooter>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
