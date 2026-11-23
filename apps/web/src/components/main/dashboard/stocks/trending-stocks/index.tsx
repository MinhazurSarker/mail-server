"use client";

import { Card } from "@/components/ui/card";
import { isRtl } from "@/i18n/languages";
import { useLocale } from "next-intl";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import CardHeader from "./card-header";
import { trendingStocksData } from "./data";
import TrendingCard from "./trending-card";

export default function TrendingStocks() {
  const locale = useLocale();
  const rtl = isRtl(locale as Parameters<typeof isRtl>[0]);

  const swiperOptions = {
    modules: [Navigation, Autoplay],
    slidesPerView: 1,
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    spaceBetween: 20,
    navigation: {
      nextEl: rtl ? ".trending-stocks-prev" : ".trending-stocks-next",
      prevEl: rtl ? ".trending-stocks-next" : ".trending-stocks-prev",
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1280: {
        slidesPerView: 2.3,
      },
      1536: {
        slidesPerView: 2.3,
      },
    },
  };

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="stocksSlider" dir={rtl ? "rtl" : "ltr"}>
        <Swiper
          key={rtl ? "rtl" : "ltr"}
          dir={rtl ? "rtl" : "ltr"}
          {...swiperOptions}
        >
          {trendingStocksData.map((stock) => (
            <SwiperSlide key={stock.id} className="swiper-slide">
              <TrendingCard
                symbol={stock.symbol}
                companyName={stock.companyName}
                price={stock.price}
                change={stock.change}
                direction={stock.direction}
                logoBg={stock.logoBg}
                icon={stock.icon}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Card>
  );
}
