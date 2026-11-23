import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default function CardOne() {
  return (
    <Card>
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
