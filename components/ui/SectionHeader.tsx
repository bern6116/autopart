import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-end justify-between gap-4 ${
        align === "center" ? "flex-col items-center text-center" : ""
      } ${className}`}
    >
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-8 h-1 bg-[#d4f000] rounded-full" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-gray-500 max-w-xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
