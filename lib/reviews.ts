// ── Sample review data for product detail pages ──────────────
// Replace with Supabase queries when connected.

import type { Review } from "@/lib/types";

export const sampleReviews: Record<string, Review[]> = {
  "prod-001": [
    {
      id: "rev-001-1",
      productId: "prod-001",
      userId: "u1",
      userName: "Marcus Reed",
      userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      title: "Quietest brakes I've ever had",
      body: "Installed these on my 2021 Camry last month and the difference is night and day. Zero squeal, great stopping power, and very easy to install. Would definitely buy again.",
      verified: true,
      helpful: 24,
      createdAt: "2024-09-01T10:00:00Z",
    },
    {
      id: "rev-001-2",
      productId: "prod-001",
      userId: "u2",
      userName: "Sandra Kim",
      userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      title: "OEM quality at a great price",
      body: "These pads fit perfectly and the hardware kit included made installation painless. Highly recommend for anyone doing a DIY brake job.",
      verified: true,
      helpful: 18,
      createdAt: "2024-09-10T10:00:00Z",
    },
    {
      id: "rev-001-3",
      productId: "prod-001",
      userId: "u3",
      userName: "David Torres",
      userAvatar: "https://randomuser.me/api/portraits/men/65.jpg",
      rating: 4,
      title: "Good pads, slight bedding-in dust",
      body: "Performance is excellent after the first few hundred miles of bedding in. There's some dust initially but it clears up. Overall very happy.",
      verified: true,
      helpful: 9,
      createdAt: "2024-09-18T10:00:00Z",
    },
  ],
  "prod-005": [
    {
      id: "rev-005-1",
      productId: "prod-005",
      userId: "u4",
      userName: "Alex Brown",
      userAvatar: "https://randomuser.me/api/portraits/men/18.jpg",
      rating: 5,
      title: "Track-ready performance",
      body: "Upgraded from stock rotors and these Brembos transformed the feel of my 3 Series. Excellent heat dissipation and zero warping after 6 months of hard driving.",
      verified: true,
      helpful: 31,
      createdAt: "2024-08-15T10:00:00Z",
    },
    {
      id: "rev-005-2",
      productId: "prod-005",
      userId: "u5",
      userName: "Rachel Chen",
      userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
      rating: 5,
      title: "Worth every penny",
      body: "The UV coating looks premium and holds up well. Paired with Brembo pads and the braking system is outstanding. Fitment was perfect.",
      verified: true,
      helpful: 15,
      createdAt: "2024-08-28T10:00:00Z",
    },
  ],
};

// Fallback reviews for products without specific reviews
export const fallbackReviews: Review[] = [
  {
    id: "rev-gen-1",
    productId: "",
    userId: "u10",
    userName: "James Wilson",
    userAvatar: "https://randomuser.me/api/portraits/men/55.jpg",
    rating: 5,
    title: "Exactly as described",
    body: "Fast shipping, part fit perfectly, and works great. Would order from Auto Core again without hesitation.",
    verified: true,
    helpful: 12,
    createdAt: "2024-10-01T10:00:00Z",
  },
  {
    id: "rev-gen-2",
    productId: "",
    userId: "u11",
    userName: "Maria Lopez",
    userAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
    rating: 4,
    title: "Good quality, quick delivery",
    body: "The part quality is solid and matches OEM specs. Delivery was faster than expected. Packaging was secure.",
    verified: true,
    helpful: 7,
    createdAt: "2024-10-05T10:00:00Z",
  },
  {
    id: "rev-gen-3",
    productId: "",
    userId: "u12",
    userName: "Tom Ashford",
    userAvatar: "https://randomuser.me/api/portraits/men/77.jpg",
    rating: 5,
    title: "Perfect fit, great price",
    body: "Checked the compatibility chart and it matched my vehicle exactly. Installation was straightforward and the part is performing well.",
    verified: false,
    helpful: 5,
    createdAt: "2024-10-10T10:00:00Z",
  },
];

export function getReviews(productId: string): Review[] {
  return sampleReviews[productId] ?? fallbackReviews.map((r) => ({ ...r, productId }));
}
