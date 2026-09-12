import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────────────────────────
// Supabase client — reads from environment variables.
// Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// in your .env.local file to connect to a real Supabase project.
// ──────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Guard: only warn if actually trying to use the client
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== "undefined") {
    console.warn(
      "[AutoCore] Supabase env vars not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");

// ── Database schema helpers ─────────────────────────────────

export type Tables = {
  products: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    sku: string;
    category: string;
    subcategory: string | null;
    description: string;
    short_description: string;
    price: number;
    original_price: number | null;
    discount_percent: number | null;
    images: string[];
    thumbnail: string;
    rating: number;
    review_count: number;
    stock: number;
    stock_status: "in_stock" | "low_stock" | "out_of_stock";
    tags: string[];
    is_featured: boolean;
    is_on_sale: boolean;
    is_new: boolean;
    created_at: string;
    updated_at: string;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    image: string;
    product_count: number;
    parent_id: string | null;
  };
  brands: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    country: string;
    product_count: number;
    is_featured: boolean;
  };
  blog_posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author_id: string;
    category: string;
    tags: string[];
    published_at: string;
    read_time: number;
  };
  cart_items: {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
  };
  wishlist_items: {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
  };
  orders: {
    id: string;
    user_id: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    total: number;
    shipping_address: Record<string, string>;
    created_at: string;
    updated_at: string;
  };
};

// ── SQL Schema (run in Supabase SQL editor) ─────────────────
/*
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percent INTEGER,
  images TEXT[],
  thumbnail TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock',
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  product_count INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id)
);

-- Brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  description TEXT,
  country TEXT,
  product_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
*/
