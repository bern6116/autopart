"use client";

import { useState } from "react";
import Image from "next/image";
import { Wrench } from "lucide-react";

interface ProductImageProps {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  illustrative?: boolean;
  priority?: boolean;
}

export default function ProductImage({ src, alt, sizes, className = "", illustrative = false, priority = false }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();

  return (
    <div className={`relative bg-gray-50 ${className}`}>
      {src && failedSrc !== src ? (
        <>
          <Image
            src={src}
            alt={illustrative ? `${alt} — illustrative image` : alt}
            fill
            unoptimized
            priority={priority}
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
            sizes={sizes}
            onError={() => setFailedSrc(src)}
          />
          {illustrative && <span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-600">Illustrative image</span>}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Wrench aria-hidden="true" size={28} strokeWidth={1.5} />
          <span className="text-xs font-semibold">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
