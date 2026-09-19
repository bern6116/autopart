-- ============================================================
-- AUTO CORE — Complete Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  first_name   TEXT DEFAULT '',
  last_name    TEXT DEFAULT '',
  phone        TEXT,
  avatar_url   TEXT,
  role         TEXT DEFAULT 'cashier' CHECK (role IN ('super_admin','admin','manager','cashier','inventory_staff')),
  is_active    BOOLEAN DEFAULT true,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Brands ───────────────────────────────────────────────────
CREATE TABLE brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  description TEXT DEFAULT '',
  country     TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT DEFAULT '',
  image_url     TEXT,
  parent_id     UUID REFERENCES categories(id),
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  product_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Suppliers ────────────────────────────────────────────────
CREATE TABLE suppliers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  contact_person TEXT DEFAULT '',
  email          TEXT DEFAULT '',
  phone          TEXT DEFAULT '',
  address        TEXT DEFAULT '',
  city           TEXT DEFAULT '',
  country        TEXT DEFAULT '',
  status         TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  notes          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  sku               TEXT UNIQUE NOT NULL,
  category_id       UUID REFERENCES categories(id),
  brand_id          UUID REFERENCES brands(id),
  supplier_id       UUID REFERENCES suppliers(id),
  description       TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  cost_price        DECIMAL(10,2) DEFAULT 0,
  selling_price     DECIMAL(10,2) NOT NULL,
  discount_percent  INTEGER DEFAULT 0,
  stock_quantity    INTEGER DEFAULT 0,
  reorder_level     INTEGER DEFAULT 5,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','out_of_stock')),
  is_featured       BOOLEAN DEFAULT false,
  tags              TEXT[] DEFAULT '{}',
  specifications    JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- ── Vehicle compatibility ─────────────────────────────────────
CREATE TABLE vehicle_makes  (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE);
CREATE TABLE vehicle_models (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), make_id UUID REFERENCES vehicle_makes(id), name TEXT NOT NULL);

CREATE TABLE vehicle_compatibility (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  make_id    UUID REFERENCES vehicle_makes(id),
  model_id   UUID REFERENCES vehicle_models(id),
  year_from  INTEGER NOT NULL,
  year_to    INTEGER NOT NULL,
  engine     TEXT,
  trim       TEXT
);

-- ── Inventory ────────────────────────────────────────────────
CREATE TABLE inventory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  current_stock   INTEGER DEFAULT 0,
  available_stock INTEGER DEFAULT 0,
  reserved_stock  INTEGER DEFAULT 0,
  reorder_level   INTEGER DEFAULT 5,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID REFERENCES products(id),
  type            TEXT NOT NULL CHECK (type IN ('stock_in','stock_out','adjustment','transfer','damaged','returned','sale','purchase')),
  quantity        INTEGER NOT NULL,
  previous_stock  INTEGER NOT NULL,
  new_stock       INTEGER NOT NULL,
  reference_id    UUID,
  reference_type  TEXT,
  notes           TEXT DEFAULT '',
  user_id         UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Customers ────────────────────────────────────────────────
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT DEFAULT '',
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','blocked')),
  total_orders    INTEGER DEFAULT 0,
  total_spent     DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
  label         TEXT DEFAULT 'Home',
  full_name     TEXT DEFAULT '',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  postal_code   TEXT NOT NULL,
  country       TEXT DEFAULT 'US',
  is_default    BOOLEAN DEFAULT false
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL,
  customer_id      UUID REFERENCES customers(id),
  customer_name    TEXT NOT NULL,
  customer_email   TEXT DEFAULT '',
  customer_phone   TEXT DEFAULT '',
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','ready','shipped','delivered','cancelled','refunded')),
  payment_method   TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash','card','online','cod','other')),
  payment_status   TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal         DECIMAL(10,2) NOT NULL,
  discount         DECIMAL(10,2) DEFAULT 0,
  shipping         DECIMAL(10,2) DEFAULT 0,
  tax              DECIMAL(10,2) DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  sku          TEXT NOT NULL,
  quantity     INTEGER NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  discount     DECIMAL(10,2) DEFAULT 0,
  total        DECIMAL(10,2) NOT NULL
);

-- ── Purchase Orders ───────────────────────────────────────────
CREATE TABLE purchase_orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number     TEXT UNIQUE NOT NULL,
  supplier_id   UUID REFERENCES suppliers(id),
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','ordered','partial','received','cancelled')),
  order_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date DATE,
  subtotal      DECIMAL(10,2) DEFAULT 0,
  tax           DECIMAL(10,2) DEFAULT 0,
  shipping      DECIMAL(10,2) DEFAULT 0,
  total         DECIMAL(10,2) DEFAULT 0,
  notes         TEXT DEFAULT '',
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id       UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id),
  quantity_ordered  INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost         DECIMAL(10,2) NOT NULL,
  total_cost        DECIMAL(10,2) NOT NULL
);

-- ── Sales / POS ───────────────────────────────────────────────
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number     TEXT UNIQUE NOT NULL,
  customer_id     UUID REFERENCES customers(id),
  customer_name   TEXT DEFAULT 'Walk-in',
  cashier_id      UUID REFERENCES profiles(id),
  payment_method  TEXT DEFAULT 'cash',
  payment_status  TEXT DEFAULT 'paid',
  subtotal        DECIMAL(10,2) NOT NULL,
  discount        DECIMAL(10,2) DEFAULT 0,
  tax             DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  amount_tendered DECIMAL(10,2) DEFAULT 0,
  change_amount   DECIMAL(10,2) DEFAULT 0,
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id      UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  sku          TEXT NOT NULL,
  quantity     INTEGER NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  discount     DECIMAL(10,2) DEFAULT 0,
  total        DECIMAL(10,2) NOT NULL
);

-- ── Cart ─────────────────────────────────────────────────────
CREATE TABLE cart (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES profiles(id) UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), cart_id UUID REFERENCES cart(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id), quantity INTEGER DEFAULT 1,
  UNIQUE(cart_id, product_id)
);

-- ── Wishlists ────────────────────────────────────────────────
CREATE TABLE wishlists       (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES profiles(id) UNIQUE);
CREATE TABLE wishlist_items  (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE, product_id UUID REFERENCES products(id), added_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(wishlist_id, product_id));

-- ── Saved vehicles ────────────────────────────────────────────
CREATE TABLE saved_vehicles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nickname   TEXT DEFAULT '',
  make       TEXT NOT NULL,
  model      TEXT NOT NULL,
  year       INTEGER NOT NULL,
  engine     TEXT DEFAULT '',
  trim       TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'system' CHECK (type IN ('order','inventory','system','promotion')),
  is_read    BOOLEAN DEFAULT false,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reviews ───────────────────────────────────────────────────
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id),
  rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
  title         TEXT DEFAULT '',
  body          TEXT DEFAULT '',
  is_verified   BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── System settings ───────────────────────────────────────────
CREATE TABLE system_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO system_settings VALUES
  ('business_name',           'Auto Core'),
  ('business_email',          'support@autocore.com'),
  ('business_phone',          '1-800-AUTO-CORE'),
  ('business_address',        '4821 Industrial Blvd'),
  ('business_city',           'Detroit, MI 48201'),
  ('business_country',        'USA'),
  ('currency',                'USD'),
  ('currency_symbol',         '$'),
  ('tax_rate',                '8'),
  ('tax_name',                'Sales Tax'),
  ('shipping_standard',       '9.99'),
  ('shipping_express',        '19.99'),
  ('shipping_free_threshold', '75'),
  ('low_stock_alert',         '5');

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands                ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory             ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;

-- Public read for catalogue
CREATE POLICY "Public read products"    ON products    FOR SELECT USING (status = 'active');
CREATE POLICY "Public read categories"  ON categories  FOR SELECT USING (status = 'active');
CREATE POLICY "Public read brands"      ON brands      FOR SELECT USING (status = 'active');
CREATE POLICY "Public read reviews"     ON reviews     FOR SELECT USING (true);

-- Users can manage their own data
CREATE POLICY "Own profile"             ON profiles         FOR ALL  USING (auth.uid() = id);
CREATE POLICY "Own cart"                ON cart             FOR ALL  USING (auth.uid() = user_id);
CREATE POLICY "Own cart items"          ON cart_items       FOR ALL  USING (cart_id IN (SELECT id FROM cart WHERE user_id = auth.uid()));
CREATE POLICY "Own wishlist"            ON wishlists        FOR ALL  USING (auth.uid() = user_id);
CREATE POLICY "Own wishlist items"      ON wishlist_items   FOR ALL  USING (wishlist_id IN (SELECT id FROM wishlists WHERE user_id = auth.uid()));
CREATE POLICY "Own saved vehicles"      ON saved_vehicles   FOR ALL  USING (auth.uid() = user_id);
CREATE POLICY "Own notifications"       ON notifications    FOR ALL  USING (auth.uid() = user_id);
CREATE POLICY "Own orders"              ON orders           FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Admin full access (service role bypasses RLS — use in server actions)

-- ── Triggers: update timestamps ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated   BEFORE UPDATE ON products   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated     BEFORE UPDATE ON orders     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated  BEFORE UPDATE ON suppliers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchases_updated  BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Trigger: auto-update inventory after sale ─────────────────
CREATE OR REPLACE FUNCTION decrease_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory
  SET current_stock   = current_stock - NEW.quantity,
      available_stock = available_stock - NEW.quantity,
      updated_at      = NOW()
  WHERE product_id = NEW.product_id;
  INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reference_id, reference_type, notes)
  SELECT NEW.product_id, 'sale', NEW.quantity,
         current_stock + NEW.quantity, current_stock, NEW.sale_id, 'sale', 'POS Sale'
  FROM inventory WHERE product_id = NEW.product_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_inventory AFTER INSERT ON sale_items FOR EACH ROW EXECUTE FUNCTION decrease_inventory_on_sale();

-- ── Trigger: auto-update inventory after purchase received ────
CREATE OR REPLACE FUNCTION increase_inventory_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_received > OLD.quantity_received THEN
    DECLARE added INTEGER := NEW.quantity_received - OLD.quantity_received;
    BEGIN
      UPDATE inventory
      SET current_stock = current_stock + added, available_stock = available_stock + added, updated_at = NOW()
      WHERE product_id = NEW.product_id;
      INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reference_id, reference_type, notes)
      SELECT NEW.product_id, 'purchase', added, current_stock - added, current_stock, NEW.purchase_id, 'purchase', 'Purchase received'
      FROM inventory WHERE product_id = NEW.product_id;
    END;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_inventory AFTER UPDATE ON purchase_items FOR EACH ROW EXECUTE FUNCTION increase_inventory_on_purchase();

-- ── Indexes for performance ───────────────────────────────────
CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_brand     ON products(brand_id);
CREATE INDEX idx_products_sku       ON products(sku);
CREATE INDEX idx_products_status    ON products(status);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_created     ON orders(created_at DESC);
CREATE INDEX idx_inventory_product  ON inventory(product_id);
CREATE INDEX idx_inv_tx_product     ON inventory_transactions(product_id);
CREATE INDEX idx_inv_tx_type        ON inventory_transactions(type);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
