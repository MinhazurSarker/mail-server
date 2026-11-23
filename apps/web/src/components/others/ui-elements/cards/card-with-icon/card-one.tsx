import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BoxIcon } from "@/icons";

export default function CardOne() {
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
      </CardContent>
    </Card>
  );
}
