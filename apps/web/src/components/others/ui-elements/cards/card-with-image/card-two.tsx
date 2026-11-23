import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function CardTwo() {
  return (
    <Card size="sm">
      <Image
        width={303}
        height={190}
        src="/images/cards/card-02.png"
        alt="card"
        className="w-full overflow-hidden rounded-lg"
      />

      <CardContent>
        <CardDescription>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi
          architecto aspernatur cum et ipsum
        </CardDescription>

        <CardAction className="mt-4">
          <Button size="lg" nativeButton={false} render={<Link href="#" />}>
            Read more
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  );
}
