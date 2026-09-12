import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react";
import { blogPosts } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogSection() {
  const [featured, ...rest] = blogPosts;

  return (
    <section className="bg-white py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Insights"
          title="Automotive Tips & Guides"
          subtitle="Expert advice on maintenance, repairs, and getting the most from your vehicle."
          action={
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 transition-colors"
            >
              All articles <ArrowRight size={15} />
            </Link>
          }
          className="mb-8"
        />

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Featured large article */}
          <Link
            href={`/blog/${featured.slug}`}
            className="lg:col-span-3 group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-[#d4f000] hover:shadow-md transition-all product-card"
          >
            <div className="relative aspect-video overflow-hidden bg-gray-100">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#d4f000] text-[#0d0d0d] text-xs font-black px-3 py-1 rounded-full">
                  {featured.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-extrabold text-[#0d0d0d] leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
                {featured.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{featured.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <Image src={featured.author.avatar} alt={featured.author.name} width={32} height={32} className="object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0d0d0d]">{featured.author.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <Calendar size={10} />
                      {formatDate(featured.publishedAt)}
                      <Clock size={10} />
                      {featured.readTime} min read
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0d0d0d] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read More <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </Link>

          {/* Side articles */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-4 bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-[#d4f000] hover:shadow-md transition-all product-card"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#0d0d0d] bg-[#d4f000]/20 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-[#0d0d0d] text-sm leading-snug mt-1.5 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1.5">
                    <Calendar size={10} />
                    {formatDate(post.publishedAt)}
                    <span>·</span>
                    <Clock size={10} />
                    {post.readTime} min
                  </div>
                </div>
              </Link>
            ))}

            {/* View all */}
            <Link
              href="/blog"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-5 text-sm font-bold text-gray-400 hover:border-[#d4f000] hover:text-[#0d0d0d] transition-all"
            >
              View All Articles <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
