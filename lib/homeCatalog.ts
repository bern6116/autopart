import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface HomeCatalog {
  products: Product[];
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  currency: string;
}

type CatalogRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string | null;
  brand_id: string | null;
  description: string | null;
  short_description: string | null;
  selling_price: number | string;
  discount_percent: number | null;
  stock_quantity: number;
  reorder_level: number;
  status: string;
  is_featured: boolean;
  tags: string[] | null;
  specifications: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  /** Primary image URL joined from product_images by the catalog_products view */
  product_image_url: string | null;
};

type FitmentRow = { product_id:string; year_from:number; year_to:number; engine:string|null; trim:string|null; vehicle_makes:{name:string}|null; vehicle_models:{name:string}|null };

let cachedRequest: Promise<HomeCatalog> | null = null;

const LOCAL_PRODUCT_ASSETS: Record<string, { image: string; name?: string; illustrative?: boolean }> = {
  "ACD-6K930": { image: "/Product/acdelco-6k930-belt.webp", illustrative: true },
  "ACD-PF64": { image: "/Product/acdelco-pf64-oil-filter.webp" },
  "BSH-15717": { image: "/Product/bosch-15717-oxygen-sensor.webp" },
  "BSH-4304": { image: "/Product/bosch-4304-spark-plugs.webp", illustrative: true },
  "BSH-BC905": { image: "/Product/bosch-quietcast-bc905.webp" },
  "BRM-09A90011": { image: "/Product/brembo-09a90011-rotor.webp", illustrative: true },
  "DNS-210-0396": { image: "/Product/denso-210-0396-alternator.webp", illustrative: true },
  "DNS-453-6002": { image: "/Product/denso-453-6002-cabin-filter.webp" },
  "KN-33-2304": { image: "/Product/kn-33-2304-air-filter.webp" },
  "MNR-172631": { image: "/Product/monroe-172631-strut.webp", illustrative: true },
  "MG-K80631": {
    image: "/Product/moog-k80631-stabilizer-link.webp",
    name: "MOOG K80631 Front Stabilizer Bar Link Kit",
  },
  "NGK-6619": { image: "/Product/ngk-6619-spark-plug.webp" },
};

/** Products created within this many days are considered "new arrivals". */
const NEW_ARRIVALS_DAYS = 30;

export function formatCatalogPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "PHP" ? "en-PH" : "en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }
}

async function fetchHomeCatalog(): Promise<HomeCatalog> {
  const [productsResult, categoriesResult, brandsResult, settingsResult, fitmentsResult] =
    await Promise.all([
      // catalog_products is the security-barrier view that:
      //   - excludes cost_price and supplier_id (internal fields)
      //   - already filters status = 'active'
      //   - is granted to anon + authenticated
      // product_image_url is a column added to the view by migration
      // 202610260001_catalog_view_images.sql so we avoid a separate
      // product_images API call that would 404 (no direct table grant).
      supabase
        .from("catalog_products")
        .select(
          "id,name,slug,sku,category_id,brand_id,description,short_description,selling_price,discount_percent,stock_quantity,reorder_level,status,is_featured,tags,specifications,created_at,updated_at,product_image_url"
        )
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name,slug").eq("status", "active").order("name"),
      supabase.from("brands").select("id,name,slug,logo_url").eq("status", "active").order("name"),
      supabase.from("system_settings").select("key,value").in("key", ["currency"]),
      supabase
        .from("vehicle_compatibility")
        .select("product_id,year_from,year_to,engine,trim,vehicle_makes!inner(name),vehicle_models!inner(name)")
        .eq("vehicle_makes.name", "Honda"),
    ]);

  const queryError = productsResult.error ?? categoriesResult.error ?? brandsResult.error ?? settingsResult.error ?? fitmentsResult.error;
  if (queryError) throw new Error(`Catalog request failed: ${queryError.message || queryError.code || "unknown error"}`);

  const categories = (categoriesResult.data ?? []) as CatalogCategory[];
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const brands = (brandsResult.data ?? []) as CatalogBrand[];
  const brandById = new Map(brands.map((brand) => [brand.id, brand]));

  // Images come from product_image_url on the catalog_products view.
  // The imageByProduct map is kept for compatibility but populated from the view row.
  const imageByProduct = new Map<string, string>();

  const fitmentsByProduct = new Map<string, Product["compatibility"]>();
  for (const row of (fitmentsResult.data ?? []) as unknown as FitmentRow[]) {
    const make = row.vehicle_makes?.name; const model = row.vehicle_models?.name;
    if (!make || !model) continue;
    const list = fitmentsByProduct.get(row.product_id) ?? [];
    list.push({ make, model, yearFrom:row.year_from, yearTo:row.year_to, engine:row.engine ?? undefined, trim:row.trim ?? undefined });
    fitmentsByProduct.set(row.product_id, list);
  }

  const configuredCurrency = (settingsResult.data ?? []).find((setting) => setting.key === "currency")?.value;
  const currency = /^[A-Z]{3}$/.test(configuredCurrency ?? "") ? configuredCurrency! : "USD";

  const products = ((productsResult.data ?? []) as CatalogRow[]).map((row) => {
    const stock = Math.max(0, Number(row.stock_quantity) || 0);
    const reorderLevel = Math.max(0, Number(row.reorder_level) || 0);
    const localAsset = LOCAL_PRODUCT_ASSETS[row.sku];
    // Prefer local bundled asset → view's joined image URL → nothing
    const thumbnail = localAsset?.image ?? row.product_image_url ?? imageByProduct.get(row.id) ?? "";

    const discountPct = Math.max(0, Math.min(100, Number(row.discount_percent) || 0));
    const sellingPrice = Number(row.selling_price) || 0;
    // A product is on sale when it carries a positive discount_percent.
    // originalPrice is the undiscounted price; price is what is charged.
    const isOnSale = discountPct > 0;
    const originalPrice = isOnSale
      ? Math.round((sellingPrice / (1 - discountPct / 100)) * 100) / 100
      : undefined;

    return {
      id: row.id,
      name: localAsset?.name ?? row.name,
      slug: row.slug,
      brand: row.brand_id ? brandById.get(row.brand_id)?.name ?? "" : "",
      brandId: row.brand_id ?? undefined,
      brandSlug: row.brand_id ? brandById.get(row.brand_id)?.slug : undefined,
      sku: row.sku,
      category: row.category_id ? categoryById.get(row.category_id) ?? "" : "",
      description: row.description ?? "",
      shortDescription: row.short_description ?? "",
      price: sellingPrice,
      originalPrice,
      images: thumbnail ? [thumbnail] : [],
      thumbnail,
      imageIsIllustrative: Boolean(localAsset?.illustrative),
      rating: 0,
      reviewCount: 0,
      stock,
      reorderLevel,
      stockStatus:
        stock === 0 ? "out_of_stock" : stock <= reorderLevel ? "low_stock" : "in_stock",
      tags: row.tags ?? [],
      compatibility: fitmentsByProduct.get(row.id) ?? [],
      specifications: row.specifications ?? {},
      isFeatured: Boolean(row.is_featured),
      isOnSale,
      // A product is "new" when created_at is within NEW_ARRIVALS_DAYS.
      // Invalid or missing dates do not qualify.
      isNew: (() => {
        if (!row.created_at) return false;
        const created = new Date(row.created_at).getTime();
        if (Number.isNaN(created)) return false;
        const cutoff = Date.now() - NEW_ARRIVALS_DAYS * 24 * 60 * 60 * 1000;
        return created >= cutoff;
      })(),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } satisfies Product;
  });

  return { products, categories, brands, currency };
}

export function loadHomeCatalog() {
  if (!cachedRequest) {
    cachedRequest = fetchHomeCatalog().catch((error) => {
      cachedRequest = null; // allow retry on next call
      throw error;
    });
  }
  return cachedRequest;
}

/** Call when you need fresh data (e.g. after admin edits products). */
export function clearCatalogCache() {
  cachedRequest = null;
}
