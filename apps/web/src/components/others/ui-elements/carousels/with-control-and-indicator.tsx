"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const carouselData = [
  {
    thumbnail: "/images/carousel/carousel-01.png",
  },
  {
    thumbnail: "/images/carousel/carousel-02.png",
  },
  {
    thumbnail: "/images/carousel/carousel-03.png",
  },
  {
    thumbnail: "/images/carousel/carousel-04.png",
  },
];

export default function WithControlAndIndicators() {
  const swiperOptions = {
    modules: [Navigation, Pagination, Autoplay],
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".next-style-two.swiper-button-next",
      prevEl: ".prev-style-two.swiper-button-prev",
    },
  };

  return (
    <div className="carouselFour relative rounded-lg border border-gray-200 dark:border-gray-800">
      <Swiper {...swiperOptions}>
        {carouselData.map((item, i) => (
          <SwiperSlide key={i + 1}>
            <div className="overflow-hidden rounded-lg">
              <Image
                width={487}
                height={297}
                src={item.thumbnail}
                className="w-full rounded-lg"
                alt="carousel"
              />
            </div>
          </SwiperSlide>
        ))}

        <div className="swiper-pagination"></div>
      </Swiper>

      <div className="swiper-button-prev prev-style-one">
        <ChevronLeftIcon className="size-6!" />
      </div>
      <div className="swiper-button-next next-style-one">
        <ChevronRightIcon className="size-6!" />
      </div>
    </div>
  );
}
