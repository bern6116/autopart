-- ============================================================
-- Migration 202610260001 — Fix public catalog access
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================
-- What this migration does:
--
--  1. Recreates catalog_products as a security-barrier view that:
--       - filters status = 'active' (all active products, not Honda-only)
--       - joins the primary product image (product_image_url)
--       - excludes cost_price, supplier_id (internal fields)
--       - is readable by anon + authenticated (no writes)
--
--     NOTE on Honda scope: migration 202610220001_honda_storefront.sql
--     added a WHERE EXISTS(Honda fitment) clause to catalog_products.
--     That clause causes the view to return 0 rows until vehicle_compatibility
--     rows exist for every product. This migration removes that restriction.
--     Honda filtering is applied client-side when the user explicitly selects
--     a vehicle model — it is not an appropriate database-level restriction
--     for a general parts catalog view.
--
--  2. Ensures anon can read categories, brands, system_settings,
--     and the vehicle fitment tables.
--
--  3. Creates product_images with RLS and anon read grant if the
--     table does not already exist.
--
--  4. Does NOT:
--       - expose cost_price or supplier_id
--       - grant writes to anon or authenticated on catalog tables
--       - touch the products base table grants (revoke stays in place)
--       - delete or modify any product, category, or order rows
-- ============================================================

-- ── 1. product_images table (idempotent) ─────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS product_images_product_idx
  ON public.product_images (product_id, is_primary, sort_order);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.product_images TO anon, authenticated;

-- ── 2. catalog_products view (recreate — all active, with image) ─
-- Drops both the honda-scoped version from 202610220001 and any
-- prior version, then creates a clean version.
DROP VIEW IF EXISTS public.catalog_products;

CREATE VIEW public.catalog_products
  WITH (security_barrier = true)
AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.sku,
  p.category_id,
  p.brand_id,
  p.description,
  p.short_description,
  p.selling_price,
  p.discount_percent,
  p.stock_quantity,
  p.reorder_level,
  p.status,
  p.is_featured,
  p.tags,
  p.specifications,
  p.created_at,
  p.updated_at,
  -- Primary image URL; NULL when no product_images row exists.
  -- Application falls back to LOCAL_PRODUCT_ASSETS by SKU, then
  -- ProductImage shows "Image unavailable" placeholder.
  (
    SELECT pi.url
    FROM   public.product_images pi
    WHERE  pi.product_id = p.id
    ORDER  BY pi.is_primary DESC, pi.sort_order ASC
    LIMIT  1
  ) AS product_image_url
FROM  public.products p
WHERE p.status = 'active';
-- No Honda EXISTS filter here — that would hide all products until
-- every product has a matching vehicle_compatibility row.

REVOKE ALL ON public.catalog_products FROM public;
GRANT SELECT ON public.catalog_products TO anon, authenticated;

-- ── 3. Supporting catalog tables ─────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (status = 'active');
GRANT SELECT ON public.categories TO anon, authenticated;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read brands" ON public.brands;
CREATE POLICY "Public read brands"
  ON public.brands FOR SELECT
  USING (status = 'active');
GRANT SELECT ON public.brands TO anon, authenticated;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read system settings" ON public.system_settings;
CREATE POLICY "Public read system settings"
  ON public.system_settings FOR SELECT
  TO anon, authenticated
  USING (true);
GRANT SELECT ON public.system_settings TO anon, authenticated;

GRANT SELECT ON public.vehicle_makes TO anon, authenticated;
GRANT SELECT ON public.vehicle_models TO anon, authenticated;
GRANT SELECT ON public.vehicle_compatibility TO anon, authenticated;

-- ── 4. Verification queries ──────────────────────────────────
-- Run these after applying to confirm the fix:
--
-- How many active products are in the catalog?
--   SELECT COUNT(*) FROM catalog_products;
--   -- Should match: SELECT COUNT(*) FROM products WHERE status = 'active';
--
-- Confirm product_image_url column exists:
--   SELECT id, name, product_image_url FROM catalog_products LIMIT 3;
--
-- Confirm cost_price NOT exposed:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'catalog_products';
--
-- Confirm grants:
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_name IN ('catalog_products','product_images','categories','brands')
--     AND grantee IN ('anon','authenticated')
--   ORDER BY table_name, grantee;
--
-- Honda fitment count (shows how many products have fitment data):
--   SELECT COUNT(DISTINCT vc.product_id)
--   FROM vehicle_compatibility vc
--   JOIN vehicle_makes vm ON vm.id = vc.make_id
--   WHERE vm.name = 'Honda';
