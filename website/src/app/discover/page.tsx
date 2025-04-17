import Link from "next/link";
import { getCategories } from "@/lib/feeds";
import { PageContainer } from "@/components/discover/PageContainer";
import { generateBreadcrumbSchema } from "@/lib/schema/breadcrumbSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";

// Generate metadata for the page
export function generateMetadata(): Metadata {
  return {
    title: "Discover Feeds | Tulip Social",
    description: "Explore popular Bluesky feeds across different categories.",
  };
}

export default async function DiscoverPage() {
  const categories = await getCategories();

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: "Discover", href: "/discover" },
  ]);

  return (
    <>
      {/* Add schema.org JSON-LD */}
      <JsonLd data={breadcrumbSchema} />

      <PageContainer>
        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-neutral-600">
            Discover Feeds
          </h1>
          <p className="text-sm md:text-base text-neutral-600">
            Explore popular Bluesky feeds across different categories. Find
            interesting content and add feeds to your timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/discover/${category.slug}`}
              className="block p-4 md:p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow hover:border-primary-300"
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl"
                  role="img"
                  aria-label={category.name}
                >
                  {category.emoji || "📋"}
                </span>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-neutral-600">
                    {category.name}
                  </h2>
                  <p className="text-sm md:text-base text-neutral-500">
                    {category.count} feeds
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
