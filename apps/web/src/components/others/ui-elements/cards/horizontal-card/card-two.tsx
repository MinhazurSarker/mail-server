import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/icons";
import Image from "next/image";

export default function CardTwo() {
  return (
    <Card size="sm" className="sm:flex-row sm:items-center sm:gap-6">
      <Image
        width={224}
        height={140}
        src="/images/cards/card-03.png"
        alt="card"
        className="w-full overflow-hidden rounded-lg"
      />

      <CardContent>
        <CardTitle>Card title</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi
          architecto aspernatur cum et ipsum
        </CardDescription>

        <CardAction className="mt-4">
          <Button
            variant="link"
            nativeButton={false}
            className="gap-1"
            render={<Link href="#" />}
          >
            Read more <ArrowRightIcon className="size-4" />
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  );
}
