"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, AlertCircle, Star, ThumbsUp, Car } from "lucide-react";
import type { Product } from "@/lib/types";
import type { Review } from "@/lib/types";
import StarRating from "@/components/ui/StarRating";

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
}

type Tab = "description" | "specifications" | "compatibility" | "installation" | "reviews";

const TABS: { id: Tab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "compatibility", label: "Compatibility" },
  { id: "installation", label: "Installation" },
  { id: "reviews", label: "Reviews" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const INSTALLATION_INFO: Record<string, { steps: string[]; tools: string[]; time: string; difficulty: string }> = {
  "Brake System": {
    difficulty: "Intermediate",
    time: "45–90 min",
    tools: ["Jack & jack stands", "Lug wrench", "C-clamp or piston tool", "Brake cleaner", "Torque wrench"],
    steps: [
      "Safely lift and secure the vehicle on jack stands.",
      "Remove the wheel and locate the brake caliper.",
      "Compress the caliper piston using a C-clamp or piston tool.",
      "Slide out the old brake pads and inspect the rotor surface.",
      "Clean the caliper bracket and sliding pins.",
      "Install the new pads — apply brake grease to the back of the pad (not friction surface).",
      "Reinstall the caliper and torque bolts to spec.",
      "Pump the brake pedal several times before moving the vehicle.",
      "Bed in the new pads: perform 5–8 moderate stops from 30 mph.",
    ],
  },
  "Suspension": {
    difficulty: "Advanced",
    time: "2–4 hours",
    tools: ["Floor jack & stands", "Spring compressor", "Socket set", "Torque wrench", "Pry bar", "Penetrating lubricant"],
    steps: [
      "Lift and safely support the vehicle; remove the wheel.",
      "Spray all fasteners with penetrating lubricant and allow to soak.",
      "Disconnect the sway bar end link and ABS sensor wire bracket.",
      "Remove the strut lower mount bolts from the steering knuckle.",
      "Support the strut assembly from above and remove upper strut mount nuts.",
      "Lower the strut assembly out of the wheel well.",
      "Transfer all serviceable hardware to the new assembly (if applicable).",
      "Install the new assembly; torque all fasteners to OEM specifications.",
      "Have the wheel alignment checked after installation.",
    ],
  },
  "Filters": {
    difficulty: "Beginner",
    time: "5–15 min",
    tools: ["Oil filter wrench (if needed)", "Drain pan (oil filter)", "Clean cloth"],
    steps: [
      "Locate the filter housing — refer to your vehicle's owner manual.",
      "For cabin air filters: open the glove box or under-hood housing.",
      "Remove the old filter; note the direction of airflow arrows.",
      "Clean any debris from the housing.",
      "Insert the new filter in the correct orientation.",
      "Close the housing securely.",
      "For oil filters: drain oil first, remove old filter, lightly oil the new gasket, install hand-tight plus 3/4 turn.",
    ],
  },
  "Electrical": {
    difficulty: "Intermediate",
    time: "30–90 min",
    tools: ["Multimeter", "Socket set", "Screwdrivers", "Wire connectors"],
    steps: [
      "Disconnect the negative battery terminal before beginning.",
      "Locate the component using a service manual or wiring diagram.",
      "Unplug all electrical connectors — note their orientation.",
      "Remove mounting hardware and extract the old component.",
      "Install the new component and reconnect all wiring.",
      "Reconnect the battery and verify proper function with a multimeter.",
      "Clear any fault codes with an OBD-II scanner if present.",
    ],
  },
  "Engine Parts": {
    difficulty: "Intermediate",
    time: "20–60 min",
    tools: ["Socket set", "Torque wrench", "Gap tool (spark plugs)", "Anti-seize compound"],
    steps: [
      "Allow the engine to cool completely before working near hot components.",
      "Disconnect the negative battery cable.",
      "Remove any covers or components blocking access.",
      "Remove the old part — for spark plugs: use a plug socket with extension.",
      "Check the gap of new spark plugs against factory specifications.",
      "Apply a small amount of anti-seize to the threads if recommended.",
      "Install the new component and torque to specification.",
      "Reinstall all covers and reconnect the battery.",
      "Start the engine and verify normal operation.",
    ],
  },
};

function getInstallInfo(category: string) {
  return (
    INSTALLATION_INFO[category] ?? {
      difficulty: "Intermediate",
      time: "30–60 min",
      tools: ["Standard hand tools", "Vehicle jack & stands", "Torque wrench"],
      steps: [
        "Consult your vehicle's service manual for specific procedures.",
        "Ensure the vehicle is safely supported before beginning.",
        "Disconnect the battery if working near electrical systems.",
        "Follow OEM torque specifications for all fasteners.",
        "Test the installation thoroughly before returning the vehicle to service.",
      ],
    }
  );
}

export default function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const installInfo = getInstallInfo(product.category);

  // Rating distribution for reviews section
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`shrink-0 px-5 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === id
                ? "border-[#d4f000] text-[#0d0d0d] bg-[#d4f000]/5"
                : "border-transparent text-gray-500 hover:text-[#0d0d0d] hover:bg-gray-50"
            }`}
          >
            {label}
            {id === "reviews" && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === id ? "bg-[#d4f000] text-[#0d0d0d]" : "bg-gray-200 text-gray-500"
              }`}>
                {reviews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── DESCRIPTION ───────────────────────────────────── */}
        {activeTab === "description" && (
          <div className="max-w-3xl space-y-4">
            <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#f4f4f4] text-gray-600 rounded-full text-xs font-semibold capitalize">
                    {tag.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SPECIFICATIONS ─────────────────────────────────── */}
        {activeTab === "specifications" && (
          <div className="max-w-2xl">
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {Object.entries(product.specifications).map(([key, value], i) => (
                <div
                  key={key}
                  className={`grid grid-cols-2 gap-4 px-5 py-3.5 text-sm ${
                    i % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"
                  }`}
                >
                  <span className="font-bold text-[#0d0d0d]">{key}</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              * Specifications are based on manufacturer data. Verify with your vehicle service manual.
            </p>
          </div>
        )}

        {/* ── COMPATIBILITY ──────────────────────────────────── */}
        {activeTab === "compatibility" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-green-600 shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                This part fits{" "}
                <span className="font-bold">{product.compatibility.length} vehicle fitment{product.compatibility.length !== 1 ? "s" : ""}</span>.
                Always confirm with your VIN for exact fitment.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 gap-3 bg-[#0d0d0d] px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Car size={12} /> Make</span>
                <span>Model</span>
                <span>Year Range</span>
                <span>Engine / Notes</span>
              </div>
              {product.compatibility.map((c, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 gap-3 px-5 py-3.5 text-sm items-center ${
                    i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"
                  }`}
                >
                  <span className="font-bold text-[#0d0d0d]">{c.make}</span>
                  <span className="text-gray-700">{c.model}</span>
                  <span className="text-gray-700">
                    {c.yearFrom === c.yearTo ? c.yearFrom : `${c.yearFrom}–${c.yearTo}`}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {c.engine ?? (c.trim ? `Trim: ${c.trim}` : "All engines")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <span className="font-bold">Not sure if this fits?</span> Use our{" "}
                <a href="/vehicle-lookup" className="underline font-bold hover:text-amber-900">Vehicle Lookup</a>{" "}
                tool or contact our support team for confirmation.
              </p>
            </div>
          </div>
        )}

        {/* ── INSTALLATION ──────────────────────────────────── */}
        {activeTab === "installation" && (
          <div className="max-w-3xl space-y-6">
            {/* Difficulty & time */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Skill Level", value: installInfo.difficulty, icon: "🔧" },
                { label: "Estimated Time", value: installInfo.time, icon: "⏱️" },
                { label: "Professional Install", value: "Available", icon: "🏪" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-[#f9f9f9] border border-gray-100 rounded-xl px-4 py-4 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-extrabold text-[#0d0d0d] text-sm">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Tools required */}
            <div>
              <h3 className="font-extrabold text-[#0d0d0d] mb-3">Tools Required</h3>
              <ul className="flex flex-wrap gap-2">
                {installInfo.tools.map((tool) => (
                  <li key={tool} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f4f4] border border-gray-200 rounded-xl text-xs font-semibold text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4f000] shrink-0" />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h3 className="font-extrabold text-[#0d0d0d] mb-4">Installation Steps</h3>
              <ol className="space-y-3">
                {installInfo.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-7 h-7 bg-[#0d0d0d] text-[#d4f000] rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <span className="font-bold">Safety note:</span> Always follow your vehicle&apos;s service manual
                and use proper safety equipment. If unsure, consult a qualified mechanic.
              </p>
            </div>
          </div>
        )}

        {/* ── REVIEWS ───────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Summary row */}
            <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-gray-100">
              {/* Overall score */}
              <div className="flex flex-col items-center justify-center bg-[#f9f9f9] rounded-2xl px-8 py-6 border border-gray-100 shrink-0 min-w-[140px]">
                <div className="text-5xl font-black text-[#0d0d0d] leading-none">
                  {product.rating.toFixed(1)}
                </div>
                <StarRating rating={product.rating} size={16} className="mt-2" />
                <div className="text-xs text-gray-500 mt-1.5 font-medium">
                  {product.reviewCount.toLocaleString()} reviews
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex-1 space-y-2">
                {ratingCounts.map(({ star, count }) => {
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 w-12 shrink-0">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-600 font-semibold">{star}</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review cards */}
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {review.userAvatar ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={review.userAvatar}
                          alt={review.userName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#d4f000] flex items-center justify-center">
                        <span className="font-black text-[#0d0d0d] text-sm">{review.userName[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-[#0d0d0d] text-sm">{review.userName}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <CheckCircle size={9} /> Verified Purchase
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} size={13} className="mb-1.5" />
                    <p className="font-bold text-[#0d0d0d] text-sm mb-1">{review.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0d0d0d] mt-2.5 transition-colors">
                      <ThumbsUp size={12} />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Write review CTA */}
            <div className="bg-[#f9f9f9] border border-gray-100 rounded-2xl p-5 text-center">
              <p className="font-bold text-[#0d0d0d] text-sm mb-1">Have this product?</p>
              <p className="text-xs text-gray-500 mb-4">Share your experience and help other customers.</p>
              <button className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#c4e000] transition-colors">
                Write a Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
