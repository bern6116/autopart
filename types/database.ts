// ============================================================
// AUTO CORE — Complete Database Types
// ============================================================

export type UserRole = "super_admin" | "admin" | "manager" | "cashier" | "inventory_staff";
export type ProductStatus = "active" | "inactive" | "out_of_stock";
export type OrderStatus = "pending" | "confirmed" | "processing" | "ready" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "card" | "online" | "cod" | "other";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PurchaseStatus = "draft" | "ordered" | "partial" | "received" | "cancelled";
export type StockTxType = "stock_in" | "stock_out" | "adjustment" | "transfer" | "damaged" | "returned" | "sale" | "purchase";
export type SupplierStatus = "active" | "inactive";
export type CustomerStatus = "active" | "suspended" | "blocked";

// ── Profiles (extends Supabase auth.users) ────────────────────
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// ── Products ─────────────────────────────────────────────────
export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  brand_id: string;
  supplier_id: string | null;
  description: string;
  short_description: string;
  cost_price: number;
  selling_price: number;
  discount_percent: number;
  stock_quantity: number;
  reorder_level: number;
  status: ProductStatus;
  is_featured: boolean;
  tags: string[];
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
  // Joined
  category?: DBCategory;
  brand?: DBBrand;
  supplier?: DBSupplier;
  images?: DBProductImage[];
}

export interface DBProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

// ── Categories ───────────────────────────────────────────────
export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  parent_id: string | null;
  status: "active" | "inactive";
  product_count: number;
  created_at: string;
  updated_at: string;
}

// ── Brands ───────────────────────────────────────────────────
export interface DBBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string;
  country: string;
  is_featured: boolean;
  status: "active" | "inactive";
  created_at: string;
}

// ── Suppliers ────────────────────────────────────────────────
export interface DBSupplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: SupplierStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ── Vehicle compatibility ─────────────────────────────────────
export interface DBVehicleMake   { id: string; name: string; }
export interface DBVehicleModel  { id: string; make_id: string; name: string; }
export interface DBVehicleCompat {
  id: string; product_id: string; make_id: string; model_id: string;
  year_from: number; year_to: number; engine: string | null; trim: string | null;
}

// ── Inventory ────────────────────────────────────────────────
export interface DBInventory {
  id: string;
  product_id: string;
  current_stock: number;
  available_stock: number;
  reserved_stock: number;
  reorder_level: number;
  updated_at: string;
  product?: DBProduct;
}

export interface DBInventoryTransaction {
  id: string;
  product_id: string;
  type: StockTxType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string;
  user_id: string;
  created_at: string;
  product?: DBProduct;
  user?: Profile;
}

// ── Purchase Orders ───────────────────────────────────────────
export interface DBPurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: PurchaseStatus;
  order_date: string;
  expected_date: string | null;
  received_date: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  supplier?: DBSupplier;
  items?: DBPurchaseItem[];
}

export interface DBPurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  product?: DBProduct;
}

// ── Customers ────────────────────────────────────────────────
export interface DBCustomer {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  created_at: string;
  addresses?: DBAddress[];
}

export interface DBAddress {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

// ── Orders ───────────────────────────────────────────────────
export interface DBOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: DBAddress | null;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: DBOrderItem[];
  customer?: DBCustomer;
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  product?: DBProduct;
}

// ── Sales / POS ───────────────────────────────────────────────
export interface DBSale {
  id: string;
  sale_number: string;
  customer_id: string | null;
  customer_name: string;
  cashier_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_tendered: number;
  change_amount: number;
  notes: string;
  created_at: string;
  items?: DBSaleItem[];
}

export interface DBSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

// ── Notifications ─────────────────────────────────────────────
export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "order" | "inventory" | "system" | "promotion";
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// ── Reviews ───────────────────────────────────────────────────
export interface DBReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

// ── Settings ─────────────────────────────────────────────────
export interface SystemSettings {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  business_city: string;
  business_country: string;
  logo_url: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  tax_name: string;
  shipping_standard: number;
  shipping_express: number;
  shipping_free_threshold: number;
  payment_cash: boolean;
  payment_card: boolean;
  payment_online: boolean;
  payment_cod: boolean;
  low_stock_alert: number;
  timezone: string;
  date_format: string;
}

// ── Dashboard stats ───────────────────────────────────────────
export interface DashboardStats {
  total_products: number;
  inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  today_sales: number;
  monthly_sales: number;
  pending_orders: number;
  total_customers: number;
  monthly_revenue: number[];
  top_products: { name: string; sold: number; revenue: number }[];
}
