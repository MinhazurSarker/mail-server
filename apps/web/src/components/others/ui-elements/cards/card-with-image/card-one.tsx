import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function CardOne() {
  return (
    <Card size="sm">
      <Image
        src="/images/cards/card-01.png"
        alt="card"
        className="w-full overflow-hidden rounded-lg"
        width={303}
        height={190}
      />

      <CardContent>
        <CardTitle>Card title</CardTitle>
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
