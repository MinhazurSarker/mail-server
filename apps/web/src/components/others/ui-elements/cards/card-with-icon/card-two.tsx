import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, BoxIcon } from "@/icons";

export default function CardTwo() {
  return (
    <Card>
      <CardHeader className="flex size-14 items-center justify-center rounded-[10.5px] bg-brand-50 text-brand-500 dark:bg-brand-500/10">
        <BoxIcon />
      </CardHeader>

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
