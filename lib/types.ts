// ============================================================
// AUTO CORE — TypeScript Types & Interfaces
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandId?: string;
  brandSlug?: string;
  sku: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  thumbnail: string;
  imageIsIllustrative?: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  reorderLevel?: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  tags: string[];
  compatibility: VehicleCompatibility[];
  specifications: Record<string, string>;
  isFeatured: boolean;
  isOnSale: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCompatibility {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  engine?: string;
  trim?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
  parentId?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  country: string;
  productCount: number;
  isFeatured: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: Author;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface VehicleFilter {
  make: string;
  model: string;
  year: string;
  type: string;
}

export interface SavedVehicle {
  make: "Honda";
  makeId: string;
  model: string;
  modelId: string;
  year: string;
  engine?: string;
}

export interface DealProduct {
  product: Product;
  dealPrice: number;
  dealEndsAt: string;
  savings: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface BannerSlide {
  id: string;
  headline: string;
  subheadline: string;
  description: string;
  cta: string;
  ctaHref: string;
  image: string;
  badge?: string;
}

export const VEHICLE_TYPES = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Wagon", "Van/Minivan", "Convertible", "Electric"];
