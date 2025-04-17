import {
  getFeedsByCategory,
  getCategories,
  getCategoryBySlug,
} from "@/lib/feeds";
import { PageContainer } from "@/components/discover/PageContainer";
import { FeedCard } from "@/components/discover/FeedCard";
import { generateCollectionSchema } from "@/lib/schema/collectionSchema";
import { generateBreadcrumbSchema } from "@/lib/schema/breadcrumbSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/discover/Breadcrumbs";
import { notFound } from "next/navigation";

type PageParams = { category: string };

export type FeedPageProps = {
  params: Promise<PageParams>;
};

async function getValidCategory(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }
  return category;
}

// Generate metadata for the page
export async function generateMetadata(props: FeedPageProps) {
  const params = await props.params;
  const category = await getValidCategory(params.category);

  return {
    title: `${category.name} Feeds | Tulip Social`,
    description: `Find ${category.name.toLowerCase()} feeds on Bluesky`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.map((category) => ({
    category: category.slug,
  }));
}

export default async function CategoryPage(props: FeedPageProps) {
  const params = await props.params;
  const category = await getValidCategory(params.category);
  const feeds = await getFeedsByCategory(category.name);

  // Generate the collection schema
  const collectionSchema = generateCollectionSchema(
    category.name,
    feeds,
    `/discover/${params.category}`
  );

  // Generate the breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: "Discover", href: "/discover" },
    { label: `${category.name} Feeds`, href: `/discover/${params.category}` },
  ]);

  const breadcrumbItems = [
    { label: "Discover", href: "/discover" },
    { label: category.name, href: `/discover/${params.category}` },
  ];

  return (
    <>
      {/* Add schema.org JSON-LD */}
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />

      <PageContainer>
        <Breadcrumbs items={breadcrumbItems} />

        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-neutral-600">
            {category.name} Feeds
          </h1>
          <p className="text-sm md:text-base text-neutral-600">
            Browse {feeds.length} curated {category.name.toLowerCase()} feeds on
            Bluesky
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {feeds.map((feed, index) => (
            <FeedCard
              key={feed.uri}
              feed={feed}
              priority={index < 3} // Prioritize loading for first 3 feeds
            />
          ))}
        </div>
      </PageContainer>
    </>
  );
}
