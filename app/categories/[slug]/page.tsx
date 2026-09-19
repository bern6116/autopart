import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { categories, products } from "@/lib/data";
import CategoryPageClient from "@/components/categories/CategoryPageClient";

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Category Not Found" };
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  // Products for this category (by name match)
  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === category.name.toLowerCase()
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <CategoryPageClient category={category} categoryProducts={categoryProducts} allCategories={categories} />
      </main>
      <Footer />
    </>
  );
}
