import { JsonLd } from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/schema/breadcrumbSchema";
import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center text-sm text-neutral-500"
      >
        {items.map((item, index) => (
          <span key={item.href} className="flex items-center">
            {index > 0 && <span className="mx-1.5">/</span>}
            <Link
              href={item.href}
              className="hover:text-primary-500 transition-colors"
            >
              {item.label}
            </Link>
          </span>
        ))}
      </nav>
    </>
  );
}
