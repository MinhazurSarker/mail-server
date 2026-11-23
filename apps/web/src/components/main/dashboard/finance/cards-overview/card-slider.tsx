"use client";

import { EffectFade, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import CardItem from "./card-item";
import { CardItem as CardItemType } from "./types";

interface CardSliderProps {
  cards: CardItemType[];
  onSlideChange?: (isBeginning: boolean, isEnd: boolean) => void;
  onSwiperInit?: (swiper: SwiperType) => void;
}

export default function CardSlider({
  cards,
  onSlideChange,
  onSwiperInit,
}: CardSliderProps) {
  const handleSlideChange = (swiper: SwiperType) => {
    onSlideChange?.(swiper.isBeginning, swiper.isEnd);
  };

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, EffectFade]}
        loop={false}
        slidesPerView={1}
        effect="fade"
        spaceBetween={0}
        navigation={{
          nextEl: "#card-slider-next",
          prevEl: "#card-slider-prev",
        }}
        onSwiper={(swiper) => {
          onSwiperInit?.(swiper);
          handleSlideChange(swiper);
        }}
        onSlideChange={handleSlideChange}
        className="w-full"
      >
        {cards.map((card) => (
          <SwiperSlide key={card.id}>
            <CardItem card={card} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
