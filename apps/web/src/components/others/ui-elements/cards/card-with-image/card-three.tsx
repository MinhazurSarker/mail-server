import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { LinkIcon } from "@/icons";
import Image from "next/image";

export default function CardThree() {
  return (
    <Card size="sm">
      <Image
        width={303}
        height={190}
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

        <Button
          variant="link"
          nativeButton={false}
          className="mt-4 gap-1"
          render={<Link href="#" />}
        >
          <LinkIcon className="size-4" />
          Card link
        </Button>
      </CardContent>
    </Card>
  );
}
