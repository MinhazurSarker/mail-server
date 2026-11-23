"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";
import { ComponentProps, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper/types";
import CardsOverviewHeader from "./card-header";
import CardSlider from "./card-slider";
import { cardsData, recentTransactionsData } from "./data";
import RecentTransactions from "./recent-transactions";
import VirtualCardNav from "./virtual-card-nav";

export default function CardsOverview({ className }: ComponentProps<"div">) {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleSlideChange = (beginning: boolean, end: boolean) => {
    setIsBeginning(beginning);
    setIsEnd(end);
  };

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border-gray-200 bg-white p-6 shadow-none dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardsOverviewHeader />
      <CardContent className="flex h-full flex-col justify-between p-0">
        <CardSlider
          cards={cardsData}
          onSlideChange={handleSlideChange}
          onSwiperInit={(swiper) => {
            swiperRef.current = swiper;
          }}
        />
        <div className="border-b border-dashed border-gray-200 pt-4 pb-6 dark:border-gray-800">
          <VirtualCardNav
            isBeginning={isBeginning}
            isEnd={isEnd}
            onPrev={() => swiperRef.current?.slidePrev()}
            onNext={() => swiperRef.current?.slideNext()}
          />
        </div>

        <RecentTransactions transactions={recentTransactionsData} />
      </CardContent>
    </Card>
  );
}
