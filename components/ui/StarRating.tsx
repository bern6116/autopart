import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 14,
  showValue = false,
  showCount = false,
  count = 0,
  className = "",
}: StarRatingProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i + 1 <= Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="text-gray-200"
                fill="currentColor"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${(rating % 1) * 100}%` }}
                >
                  <Star size={size} className="text-yellow-400" fill="currentColor" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      )}
      {showCount && count > 0 && (
        <span className="text-xs text-gray-500">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
