import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DotIcon } from "./icons";

export function BreadcrumbWithCustomDivider() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="mx-1">/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">UI Kits</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="mx-1">/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Alert</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="mx-1 [&>svg]:size-auto">
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">UI Kits</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="mx-1 [&>svg]:size-auto">
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Alert</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
