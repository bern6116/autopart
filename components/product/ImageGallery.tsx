"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const all = images.length > 0 ? images : ["/placeholder-product.jpg"];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive((i) => (i - 1 + all.length) % all.length);
  const next = () => setActive((i) => (i + 1) % all.length);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative bg-[#f4f4f4] rounded-2xl overflow-hidden aspect-square border border-gray-100 group">
          <Image
            src={all[active]}
            alt={`${productName} — image ${active + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Zoom button */}
          <button
            onClick={() => setZoomed(true)}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            aria-label="Zoom image"
          >
            <ZoomIn size={16} className="text-[#0d0d0d]" />
          </button>

          {/* Arrows (only when multiple images) */}
          {all.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Counter pill */}
          {all.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {active + 1} / {all.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {all.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {all.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  i === active
                    ? "border-[#d4f000] shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={all[active]}
              alt={productName}
              fill
              className="object-contain"
              sizes="90vw"
            />
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
              aria-label="Close zoom"
            >
              ✕
            </button>
            {all.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <ChevronLeft size={22} />
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
