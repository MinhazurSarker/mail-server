import { cn } from "@/utils";
import Image from "next/image";
import { ContactlessIcon } from "./icons";
import { CardItem as CardItemType } from "./types";

interface CardItemProps {
  card: CardItemType;
}

export default function CardItem({ card }: CardItemProps) {
  const isActive = card.status === "active";

  return (
    <div className="relative flex flex-col gap-7 overflow-hidden rounded-[14px] bg-gray-900 p-6 select-none dark:bg-gray-950">
      {card.bgImage && (
        <Image
          src={card.bgImage}
          alt="Card Vector"
          width={122}
          height={95}
          className="pointer-events-none absolute inset-e-0 top-0 rtl:-scale-x-100"
        />
      )}

      <div className="relative z-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ContactlessIcon className="text-white" />
          <span
            className={cn(
              "flex h-6 shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
              isActive
                ? "bg-green-500/10 text-green-500"
                : "bg-white/10 text-gray-400 dark:text-white/90",
            )}
          >
            {card.status}
          </span>
        </div>
        {card.brandLogo && (
          <div>
            <Image
              src={card.brandLogo}
              alt="Brand Logo"
              width={48}
              height={30}
              className="h-auto w-auto object-contain"
            />
          </div>
        )}
      </div>

      <div className="relative z-1">
        <h4 className="text-base font-normal text-white">{card.cardHolder}</h4>
      </div>

      <div className="relative z-1 flex justify-between gap-5 sm:gap-10">
        <div className="flex-1">
          <p className="text-xs text-white/80">Card Number</p>
          <p className="text-base font-normal text-white">{card.cardNumber}</p>
        </div>
        <div>
          <p className="text-xs text-white/80">EXP</p>
          <p className="text-base font-normal text-white">{card.expiry}</p>
        </div>
        <div>
          <p className="text-xs text-white/80">CVC</p>
          <p className="text-base font-normal text-white">{card.cvc}</p>
        </div>
      </div>
    </div>
  );
}
