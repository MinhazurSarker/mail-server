import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterXIcon,
} from "@/icons";

export default function SocialLinks() {
  return (
    <div className="absolute inset-s-1/2 bottom-6 -translate-x-1/2 rtl:translate-x-1/2">
      <p className="mt-20 mb-6 text-center text-base text-gray-500 dark:text-gray-400">
        Follow Us On
      </p>

      <div className="flex items-center justify-center gap-5">
        <Button
          size="icon"
          variant="ghost"
          nativeButton={false}
          aria-label="Facebook"
          className="text-gray-500"
          render={<Link href="#" />}
        >
          <FacebookIcon />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          nativeButton={false}
          aria-label="Twitter"
          className="text-gray-500"
          render={<Link href="#" />}
        >
          <TwitterXIcon />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          nativeButton={false}
          aria-label="LinkedIn"
          className="text-gray-500"
          render={<Link href="#" />}
        >
          <LinkedinIcon />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          nativeButton={false}
          aria-label="Instagram"
          className="text-gray-500"
          render={<Link href="#" />}
        >
          <InstagramIcon />
        </Button>
      </div>
    </div>
  );
}
