import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function DefaultLinks() {
  return (
    <div className="flex flex-col items-start space-y-3">
      <Button variant="link" nativeButton={false} render={<Link href={"#"} />}>
        Primary Link
      </Button>
      <Button
        variant="link"
        nativeButton={false}
        className="text-green-500 dark:text-green-500"
        render={<Link href={"#"} />}
      >
        Success Link
      </Button>
      <Button
        variant="link"
        nativeButton={false}
        className="text-red-500 dark:text-red-500"
        render={<Link href={"#"} />}
      >
        Danger Link
      </Button>
      <Button
        variant="link"
        nativeButton={false}
        className="text-amber-500 dark:text-amber-500"
        render={<Link href={"#"} />}
      >
        Warning Link
      </Button>
      <Button
        variant="link"
        nativeButton={false}
        className="text-sky-500 dark:text-sky-500"
        render={<Link href={"#"} />}
      >
        Info Link
      </Button>
      <Button
        variant="link"
        nativeButton={false}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        render={<Link href={"#"} />}
      >
        Light Link
      </Button>
    </div>
  );
}
