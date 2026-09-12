// ============================================================
// AUTO CORE — TypeScript Types & Interfaces
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
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
  rating: number;
  reviewCount: number;
  stock: number;
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

// Vehicle selector data
export const VEHICLE_MAKES = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Nissan",
  "Hyundai",
  "Kia",
  "Subaru",
  "Mazda",
  "Jeep",
  "Ram",
  "GMC",
  "Dodge",
  "Chrysler",
  "Lexus",
  "Infiniti",
  "Acura",
  "Volvo",
  "Porsche",
  "Land Rover",
  "Tesla",
] as const;

export const VEHICLE_MODELS: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Tundra", "4Runner", "Highlander", "Prius", "Sienna", "Avalon"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline", "Odyssey", "HR-V", "Passport", "Fit", "Insight"],
  Ford: ["F-150", "Mustang", "Explorer", "Escape", "Edge", "Bronco", "Ranger", "Expedition", "Maverick", "Focus"],
  Chevrolet: ["Silverado", "Equinox", "Tahoe", "Traverse", "Colorado", "Camaro", "Malibu", "Suburban", "Blazer", "Corvette"],
  BMW: ["3 Series", "5 Series", "7 Series", "X3", "X5", "M3", "M5", "X1", "X7", "4 Series"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "A-Class", "CLA", "GLA", "AMG GT", "Sprinter"],
  Audi: ["A4", "A6", "Q5", "Q7", "A3", "Q3", "A8", "TT", "R8", "e-tron"],
  Nissan: ["Altima", "Maxima", "Rogue", "Pathfinder", "Frontier", "Titan", "Murano", "Sentra", "Kicks", "Armada"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Kona", "Palisade", "Ioniq", "Venue", "Nexo", "Genesis"],
  Kia: ["Sportage", "Sorento", "Telluride", "Soul", "Forte", "Stinger", "Carnival", "Seltos", "K5", "EV6"],
};

export const VEHICLE_YEARS = Array.from({ length: 30 }, (_, i) => String(2024 - i));

export const VEHICLE_TYPES = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Wagon", "Van/Minivan", "Convertible", "Electric"];
