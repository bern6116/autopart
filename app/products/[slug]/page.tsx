import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageGallery from "@/components/product/ImageGallery";
import ProductActions from "@/components/product/ProductActions";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/sections/ProductCard";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";

import { products } from "@/lib/data";
import { getReviews } from "@/lib/reviews";

// ── Static params — pre-render all 12 product slugs ──────────
export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

// ── Metadata ─────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.thumbnail, width: 400, height: 400 }],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const reviews = getReviews(product.id);

  // Related: same category, different product, up to 4
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Breadcrumb
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.category, href: `/shop?cat=${encodeURIComponent(product.category)}` },
    { label: product.name, href: null },
  ];

  const stockLabel =
    product.stockStatus === "in_stock"
      ? "In Stock"
      : product.stockStatus === "low_stock"
      ? `Only ${product.stock} left`
      : "Out of Stock";
  const stockVariant =
    product.stockStatus === "in_stock" ? "green"
    : product.stockStatus === "low_stock" ? "orange"
    : "red";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#0d0d0d] transition-colors max-w-[140px] truncate">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#0d0d0d] font-semibold max-w-[200px] truncate">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* ── Main product section ─────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">

            {/* Left — Image gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6">
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right — Product info + actions */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-7">

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="gray" size="sm">{product.category}</Badge>
                  {product.subcategory && (
                    <Badge variant="gray" size="sm">{product.subcategory}</Badge>
                  )}
                  {product.isNew && <Badge variant="yellow" size="sm">New</Badge>}
                  {product.isOnSale && <Badge variant="red" size="sm">On Sale</Badge>}
                  {product.isFeatured && <Badge variant="black" size="sm">Featured</Badge>}
                </div>

                {/* Brand */}
                <div className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                  {product.brand}
                </div>

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d] leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating + SKU row */}
                <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-100 mb-5">
                  <StarRating
                    rating={product.rating}
                    showValue
                    showCount
                    count={product.reviewCount}
                    size={16}
                  />
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Package size={13} />
                    <span>SKU: <span className="font-bold font-mono text-gray-600">{product.sku}</span></span>
                  </div>
                  <Badge variant={stockVariant} size="sm" dot>{stockLabel}</Badge>
                </div>

                {/* Short description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {product.shortDescription}
                </p>

                {/* Actions (qty, cart, buy, wishlist) */}
                <ProductActions product={product} />
              </div>

              {/* Quick spec preview card */}
              {Object.keys(product.specifications).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                    Quick Specs
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{k}</div>
                        <div className="text-sm font-bold text-[#0d0d0d]">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Tabs section ─────────────────────────────────── */}
          <div className="mb-10">
            <ProductTabs product={product} reviews={reviews} />
          </div>

          {/* ── Related Products ─────────────────────────────── */}
          {related.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-8 h-1 bg-[#d4f000] rounded-full inline-block" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">
                      More Like This
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#0d0d0d]">Related Products</h2>
                </div>
                <Link
                  href={`/shop?cat=${encodeURIComponent(product.category)}`}
                  className="text-sm font-bold text-[#0d0d0d] hover:text-gray-600 transition-colors whitespace-nowrap"
                >
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} variant="default" />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
