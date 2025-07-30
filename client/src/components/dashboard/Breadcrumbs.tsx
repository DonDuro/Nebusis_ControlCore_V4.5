import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/i18n";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbsProps {
  items?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  // Generate breadcrumbs based on current location if items not provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: "Dashboard", href: "/", current: false }
    ];

    const pathMap: Record<string, string> = {
      workflows: t('nav.workflows'),
      documents: t('nav.documents'),
      verification: t('nav.verification'),
      reports: t('nav.reports'),
      alerts: t('nav.alerts'),
      integration: t('nav.integration'),
      "institutional-plans": t('breadcrumbs.institutionalPlans'),
      "training-management": t('breadcrumbs.training'),
      "cgr-reporting": t('breadcrumbs.auditReports'),
      glossary: t('nav.glossary')
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      breadcrumbs.push({
        label: pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : path,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.current ? (
              <BreadcrumbPage className="text-gray-600">
                {item.label}
              </BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link 
                    href={item.href || "#"}
                    className="flex items-center gap-1 text-primary hover:text-primary"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                )}
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}