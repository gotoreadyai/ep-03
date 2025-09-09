import { useBreadcrumb } from "@refinedev/core";
import { Link } from "react-router";
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <div
              key={`breadcrumb-${breadcrumb.label}`}
              className="flex items-center"
            >
              <BreadcrumbItem>
                {breadcrumb.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
};
