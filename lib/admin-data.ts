// ============================================================
// AUTO CORE Admin — Sample Data for UI (replace with Supabase queries)
// ============================================================
import type {
  DBProduct, DBCategory, DBSupplier, DBOrder, DBCustomer,
  DBPurchaseOrder, DBInventoryTransaction, DBSale, Profile,
  DashboardStats,
} from "@/types/database";

// ── Dashboard Stats ───────────────────────────────────────────
export const dashboardStats: DashboardStats = {
  total_products: 486,
  inventory_value: 124580.50,
  low_stock_count: 12,
  out_of_stock_count: 4,
  today_sales: 3240.00,
  monthly_sales: 87650.00,
  pending_orders: 18,
  total_customers: 1243,
  monthly_revenue: [42000,55000,48000,61000,59000,72000,68000,81000,76000,87650,0,0],
  top_products: [
    { name: "Bosch Brake Pads", sold: 142, revenue: 6104.58 },
    { name: "NGK Iridium Plugs", sold: 98,  revenue: 1469.02 },
    { name: "K&N Air Filter",    sold: 76,  revenue: 4179.24 },
    { name: "Monroe Strut",      sold: 54,  revenue: 7019.46 },
    { name: "Brembo Rotor",      sold: 49,  revenue: 4654.51 },
  ],
};

// ── Monthly Revenue Chart Data ────────────────────────────────
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Admin Orders ──────────────────────────────────────────────
export const adminOrders: DBOrder[] = [
  { id:"o1", order_number:"AC-20241001", customer_id:"c1", customer_name:"Marcus Reed", customer_email:"marcus@example.com", customer_phone:"555-0101", status:"delivered",  payment_method:"card",   payment_status:"paid",    subtotal:137.98, discount:0,   shipping:0,    tax:11.04, total:149.02, shipping_address:null, notes:"",  created_at:"2024-10-01T10:00:00Z", updated_at:"2024-10-05T10:00:00Z" },
  { id:"o2", order_number:"AC-20241002", customer_id:"c2", customer_name:"Sandra Kim",  customer_email:"sandra@example.com", customer_phone:"555-0102", status:"shipped",   payment_method:"online", payment_status:"paid",    subtotal:94.99,  discount:0,   shipping:0,    tax:7.60,  total:102.59, shipping_address:null, notes:"",  created_at:"2024-10-03T09:00:00Z", updated_at:"2024-10-06T09:00:00Z" },
  { id:"o3", order_number:"AC-20241003", customer_id:"c3", customer_name:"James Torres",customer_email:"james@example.com",  customer_phone:"555-0103", status:"processing",payment_method:"cod",    payment_status:"pending", subtotal:54.99,  discount:5,   shipping:9.99, tax:4.80,  total:64.78,  shipping_address:null, notes:"",  created_at:"2024-10-06T14:00:00Z", updated_at:"2024-10-06T14:00:00Z" },
  { id:"o4", order_number:"AC-20241004", customer_id:"c4", customer_name:"Rachel Chen", customer_email:"rachel@example.com", customer_phone:"555-0104", status:"pending",   payment_method:"cash",   payment_status:"pending", subtotal:189.99, discount:0,   shipping:0,    tax:15.20, total:205.19, shipping_address:null, notes:"",  created_at:"2024-10-07T11:00:00Z", updated_at:"2024-10-07T11:00:00Z" },
  { id:"o5", order_number:"AC-20241005", customer_id:"c5", customer_name:"Alex Brown",  customer_email:"alex@example.com",   customer_phone:"555-0105", status:"confirmed", payment_method:"card",   payment_status:"paid",    subtotal:38.99,  discount:0,   shipping:9.99, tax:3.92,  total:52.90,  shipping_address:null, notes:"",  created_at:"2024-10-08T08:30:00Z", updated_at:"2024-10-08T09:00:00Z" },
  { id:"o6", order_number:"AC-20241006", customer_id:"c1", customer_name:"Marcus Reed", customer_email:"marcus@example.com", customer_phone:"555-0101", status:"cancelled", payment_method:"card",   payment_status:"refunded",subtotal:129.99, discount:0,   shipping:0,    tax:10.40, total:140.39, shipping_address:null, notes:"Cancelled by customer", created_at:"2024-10-09T15:00:00Z", updated_at:"2024-10-10T10:00:00Z" },
  { id:"o7", order_number:"AC-20241007", customer_id:"c2", customer_name:"Sandra Kim",  customer_email:"sandra@example.com", customer_phone:"555-0102", status:"ready",     payment_method:"online", payment_status:"paid",    subtotal:32.99,  discount:0,   shipping:9.99, tax:3.44,  total:46.42,  shipping_address:null, notes:"",  created_at:"2024-10-10T12:00:00Z", updated_at:"2024-10-10T14:00:00Z" },
  { id:"o8", order_number:"AC-20241008", customer_id:"c6", customer_name:"Maria Lopez", customer_email:"maria@example.com",  customer_phone:"555-0106", status:"refunded",  payment_method:"card",   payment_status:"refunded",subtotal:47.99,  discount:0,   shipping:9.99, tax:4.64,  total:62.62,  shipping_address:null, notes:"",  created_at:"2024-10-11T10:00:00Z", updated_at:"2024-10-12T10:00:00Z" },
];

// ── Admin Products ────────────────────────────────────────────
export const adminProducts: DBProduct[] = [
  { id:"p1",  name:"Bosch QuietCast Brake Pads",     slug:"bosch-quietcast-brake-pads",     sku:"BSH-BC905",     category_id:"cat1", brand_id:"br1", supplier_id:"s1", description:"Premium ceramic brake pads", short_description:"Ceramic brake pads", cost_price:22.00, selling_price:42.99, discount_percent:27, stock_quantity:84,  reorder_level:20, status:"active",       is_featured:true,  tags:["brakes","ceramic"], specifications:{ Material:"Ceramic" }, created_at:"2024-01-15T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p2",  name:"K&N High-Flow Air Filter",        slug:"kn-air-filter",                  sku:"KN-33-2304",    category_id:"cat2", brand_id:"br2", supplier_id:"s2", description:"High-flow performance filter", short_description:"Performance air filter", cost_price:28.00, selling_price:54.99, discount_percent:0,  stock_quantity:52,  reorder_level:15, status:"active",       is_featured:true,  tags:["filter"], specifications:{ Media:"Cotton Gauze" }, created_at:"2024-02-10T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p3",  name:"Monroe OESpectrum Strut Assembly",slug:"monroe-strut",                   sku:"MNR-172631",    category_id:"cat3", brand_id:"br3", supplier_id:"s3", description:"Complete strut assembly", short_description:"Strut assembly", cost_price:75.00, selling_price:129.99, discount_percent:19, stock_quantity:3,   reorder_level:10, status:"active",       is_featured:true,  tags:["suspension"], specifications:{ Type:"Complete" }, created_at:"2024-03-05T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p4",  name:"Denso Heavy-Duty Alternator",     slug:"denso-alternator",               sku:"DNS-210-0396",  category_id:"cat4", brand_id:"br4", supplier_id:"s1", description:"Remanufactured alternator", short_description:"Heavy-duty alternator", cost_price:95.00, selling_price:189.99, discount_percent:0,  stock_quantity:2,   reorder_level:5,  status:"active",       is_featured:true,  tags:["electrical"], specifications:{ Amperage:"110A" }, created_at:"2024-08-20T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p5",  name:"Brembo Sport Brake Rotor",        slug:"brembo-sport-rotor",             sku:"BRM-09A90011",  category_id:"cat1", brand_id:"br5", supplier_id:"s2", description:"Drilled and slotted rotor", short_description:"Sport brake rotor", cost_price:55.00, selling_price:94.99, discount_percent:24, stock_quantity:38,  reorder_level:15, status:"active",       is_featured:true,  tags:["brakes","sport"], specifications:{ Type:"Drilled & Slotted" }, created_at:"2024-04-10T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p6",  name:"Bosch Platinum Spark Plug Set",   slug:"bosch-spark-plug",               sku:"BSH-4304",      category_id:"cat5", brand_id:"br1", supplier_id:"s1", description:"Platinum +4 spark plugs", short_description:"Spark plug set", cost_price:16.00, selling_price:32.99, discount_percent:0,  stock_quantity:120, reorder_level:25, status:"active",       is_featured:false, tags:["engine"], specifications:{ Material:"Platinum" }, created_at:"2024-01-20T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p7",  name:"ACDelco Serpentine Belt",          slug:"acdelco-serpentine-belt",        sku:"ACD-6K930",     category_id:"cat5", brand_id:"br6", supplier_id:"s3", description:"OE-spec EPDM belt", short_description:"Serpentine belt", cost_price:12.00, selling_price:24.99, discount_percent:29, stock_quantity:67,  reorder_level:20, status:"active",       is_featured:false, tags:["engine","belt"], specifications:{ Material:"EPDM" }, created_at:"2024-02-25T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p8",  name:"NGK Iridium IX Spark Plug",        slug:"ngk-iridium-spark-plug",         sku:"NGK-6619",      category_id:"cat5", brand_id:"br7", supplier_id:"s2", description:"Fine-wire iridium plug", short_description:"Iridium spark plug", cost_price:7.00, selling_price:14.99, discount_percent:0,  stock_quantity:200, reorder_level:30, status:"active",       is_featured:true,  tags:["engine","ignition"], specifications:{ Material:"Iridium" }, created_at:"2024-01-05T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p9",  name:"Bosch OE Oxygen Sensor",           slug:"bosch-o2-sensor",                sku:"BSH-15717",     category_id:"cat4", brand_id:"br1", supplier_id:"s1", description:"OE-style O2 sensor", short_description:"Oxygen sensor", cost_price:24.00, selling_price:47.99, discount_percent:24, stock_quantity:45,  reorder_level:15, status:"active",       is_featured:false, tags:["electrical","sensor"], specifications:{ Wires:"4-Wire" }, created_at:"2024-03-15T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p10", name:"Moog Front Lower Ball Joint",      slug:"moog-ball-joint",                sku:"MG-K80631",     category_id:"cat3", brand_id:"br8", supplier_id:"s3", description:"Gusher bearing design", short_description:"Ball joint", cost_price:19.00, selling_price:38.99, discount_percent:0,  stock_quantity:58,  reorder_level:15, status:"active",       is_featured:false, tags:["suspension"], specifications:{ Position:"Front Lower" }, created_at:"2024-04-01T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p11", name:"Denso Cabin Air Filter",            slug:"denso-cabin-filter",             sku:"DNS-453-6002",  category_id:"cat2", brand_id:"br4", supplier_id:"s2", description:"Activated charcoal filter", short_description:"Cabin air filter", cost_price:9.00, selling_price:18.99, discount_percent:24, stock_quantity:0,   reorder_level:20, status:"out_of_stock", is_featured:false, tags:["filter","cabin"], specifications:{ Media:"Charcoal" }, created_at:"2024-05-10T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"p12", name:"ACDelco Engine Oil Filter",         slug:"acdelco-oil-filter",             sku:"ACD-PF64",      category_id:"cat2", brand_id:"br6", supplier_id:"s3", description:"High-capacity oil filter", short_description:"Oil filter", cost_price:4.00, selling_price:8.99, discount_percent:0,  stock_quantity:320, reorder_level:50, status:"active",       is_featured:false, tags:["filter","oil"], specifications:{ Thread:"22mm" }, created_at:"2024-01-10T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
];

// ── Admin Categories ──────────────────────────────────────────
export const adminCategories: DBCategory[] = [
  { id:"cat1", name:"Brake System",  slug:"brake-system",  description:"Brake pads, rotors, calipers", image_url:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", parent_id:null, status:"active", product_count:870,  created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"cat2", name:"Filters",       slug:"filters",       description:"Oil, air, fuel, cabin filters", image_url:"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400", parent_id:null, status:"active", product_count:430,  created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"cat3", name:"Suspension",    slug:"suspension",    description:"Shocks, struts, control arms",  image_url:"https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=400", parent_id:null, status:"active", product_count:650,  created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"cat4", name:"Electrical",    slug:"electrical",    description:"Alternators, sensors, batteries",image_url:"https://images.unsplash.com/photo-1558618047-f2b4ed8a0b46?w=400",   parent_id:null, status:"active", product_count:980,  created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"cat5", name:"Engine Parts",  slug:"engine-parts",  description:"Pistons, belts, spark plugs",   image_url:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400", parent_id:null, status:"active", product_count:1240, created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"cat6", name:"Body Parts",    slug:"body-parts",    description:"Bumpers, hoods, fenders",        image_url:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400", parent_id:null, status:"active", product_count:720,  created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
];

// ── Suppliers ─────────────────────────────────────────────────
export const adminSuppliers: DBSupplier[] = [
  { id:"s1", name:"AutoParts Direct Inc.",    contact_person:"Tom Hargrove",  email:"tom@autopartsdirect.com",   phone:"313-555-0101", address:"100 Commerce Dr",    city:"Detroit, MI",    country:"USA", status:"active",   notes:"Primary supplier for Bosch parts", created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"s2", name:"Pacific Auto Supply Co.",  contact_person:"Linda Chen",    email:"linda@pacificauto.com",     phone:"310-555-0202", address:"500 Harbor Blvd",    city:"Los Angeles, CA",country:"USA", status:"active",   notes:"West coast distributor", created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"s3", name:"Midwest Parts Warehouse",  contact_person:"Gary Peterson", email:"gary@midwestparts.com",     phone:"312-555-0303", address:"2200 Industrial Rd", city:"Chicago, IL",    country:"USA", status:"active",   notes:"Fast delivery, good pricing", created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
  { id:"s4", name:"Global Auto Imports Ltd.", contact_person:"Kenji Tanaka",  email:"kenji@globalauto.com",      phone:"212-555-0404", address:"88 Import Ave",      city:"New York, NY",   country:"USA", status:"inactive", notes:"International parts supplier", created_at:"2024-01-01T00:00:00Z", updated_at:"2024-01-01T00:00:00Z" },
];

// ── Customers ─────────────────────────────────────────────────
export const adminCustomers: DBCustomer[] = [
  { id:"c1", user_id:"u1", first_name:"Marcus", last_name:"Reed",    email:"marcus@example.com", phone:"555-0101", status:"active",    total_orders:8,  total_spent:842.16,  last_order_date:"2024-10-01T10:00:00Z", created_at:"2024-01-10T00:00:00Z" },
  { id:"c2", user_id:"u2", first_name:"Sandra", last_name:"Kim",     email:"sandra@example.com", phone:"555-0102", status:"active",    total_orders:5,  total_spent:487.23,  last_order_date:"2024-10-03T09:00:00Z", created_at:"2024-02-14T00:00:00Z" },
  { id:"c3", user_id:"u3", first_name:"James",  last_name:"Torres",  email:"james@example.com",  phone:"555-0103", status:"active",    total_orders:3,  total_spent:195.44,  last_order_date:"2024-10-06T14:00:00Z", created_at:"2024-03-20T00:00:00Z" },
  { id:"c4", user_id:"u4", first_name:"Rachel", last_name:"Chen",    email:"rachel@example.com", phone:"555-0104", status:"active",    total_orders:12, total_spent:1284.55, last_order_date:"2024-10-07T11:00:00Z", created_at:"2024-01-05T00:00:00Z" },
  { id:"c5", user_id:"u5", first_name:"Alex",   last_name:"Brown",   email:"alex@example.com",   phone:"555-0105", status:"active",    total_orders:2,  total_spent:103.80,  last_order_date:"2024-10-08T08:30:00Z", created_at:"2024-05-18T00:00:00Z" },
  { id:"c6", user_id:"u6", first_name:"Maria",  last_name:"Lopez",   email:"maria@example.com",  phone:"555-0106", status:"suspended", total_orders:1,  total_spent:62.62,   last_order_date:"2024-10-11T10:00:00Z", created_at:"2024-09-01T00:00:00Z" },
  { id:"c7", user_id:null, first_name:"Tom",    last_name:"Ashford", email:"tom@example.com",    phone:"555-0107", status:"active",    total_orders:7,  total_spent:623.44,  last_order_date:"2024-09-25T10:00:00Z", created_at:"2024-02-28T00:00:00Z" },
];

// ── Inventory Transactions ────────────────────────────────────
export const inventoryTransactions: DBInventoryTransaction[] = [
  { id:"tx1", product_id:"p1", type:"stock_in",    quantity:50,  previous_stock:34,  new_stock:84,  reference_id:"po1", reference_type:"purchase", notes:"Purchase received",    user_id:"staff1", created_at:"2024-10-01T09:00:00Z" },
  { id:"tx2", product_id:"p2", type:"sale",         quantity:2,   previous_stock:54,  new_stock:52,  reference_id:"s1",  reference_type:"sale",     notes:"POS Sale",             user_id:"staff2", created_at:"2024-10-01T11:30:00Z" },
  { id:"tx3", product_id:"p3", type:"adjustment",   quantity:-2,  previous_stock:5,   new_stock:3,   reference_id:null,  reference_type:null,       notes:"Damaged in warehouse", user_id:"staff1", created_at:"2024-10-02T14:00:00Z" },
  { id:"tx4", product_id:"p4", type:"stock_in",     quantity:5,   previous_stock:-3,  new_stock:2,   reference_id:"po2", reference_type:"purchase", notes:"Emergency stock",      user_id:"staff1", created_at:"2024-10-03T10:00:00Z" },
  { id:"tx5", product_id:"p5", type:"sale",         quantity:3,   previous_stock:41,  new_stock:38,  reference_id:"s2",  reference_type:"sale",     notes:"Online order",         user_id:"staff2", created_at:"2024-10-04T15:00:00Z" },
  { id:"tx6", product_id:"p11",type:"stock_out",    quantity:5,   previous_stock:5,   new_stock:0,   reference_id:null,  reference_type:null,       notes:"Out of stock",         user_id:"staff1", created_at:"2024-10-05T10:00:00Z" },
];

// ── Purchase Orders ───────────────────────────────────────────
export const adminPurchaseOrders: DBPurchaseOrder[] = [
  { id:"po1", po_number:"PO-2024-001", supplier_id:"s1", status:"received", order_date:"2024-09-25", expected_date:"2024-10-01", received_date:"2024-10-01", subtotal:880.00, tax:70.40, shipping:25.00, total:975.40, notes:"Regular restock", created_by:"staff1", created_at:"2024-09-25T10:00:00Z", updated_at:"2024-10-01T10:00:00Z" },
  { id:"po2", po_number:"PO-2024-002", supplier_id:"s2", status:"ordered",  order_date:"2024-10-05", expected_date:"2024-10-12", received_date:null,          subtotal:560.00, tax:44.80, shipping:20.00, total:624.80, notes:"K&N filters restocking", created_by:"staff1", created_at:"2024-10-05T10:00:00Z", updated_at:"2024-10-05T10:00:00Z" },
  { id:"po3", po_number:"PO-2024-003", supplier_id:"s3", status:"draft",    order_date:"2024-10-10", expected_date:null,          received_date:null,          subtotal:1200.00,tax:96.00, shipping:0,     total:1296.00,notes:"Bulk belt order", created_by:"staff2", created_at:"2024-10-10T10:00:00Z", updated_at:"2024-10-10T10:00:00Z" },
  { id:"po4", po_number:"PO-2024-004", supplier_id:"s1", status:"partial",  order_date:"2024-10-08", expected_date:"2024-10-15", received_date:null,          subtotal:475.00, tax:38.00, shipping:15.00, total:528.00, notes:"Partial delivery expected", created_by:"staff1", created_at:"2024-10-08T10:00:00Z", updated_at:"2024-10-12T10:00:00Z" },
];

// ── Staff / Users ─────────────────────────────────────────────
export const adminUsers: Profile[] = [
  { id:"staff1", email:"admin@autocore.com",    first_name:"Daniel",  last_name:"Park",     phone:"313-555-9001", avatar_url:null, role:"super_admin",    is_active:true, last_login:"2024-10-12T08:00:00Z", created_at:"2024-01-01T00:00:00Z", updated_at:"2024-10-12T08:00:00Z" },
  { id:"staff2", email:"manager@autocore.com",  first_name:"Sarah",   last_name:"Mitchell", phone:"313-555-9002", avatar_url:null, role:"manager",        is_active:true, last_login:"2024-10-12T07:30:00Z", created_at:"2024-01-15T00:00:00Z", updated_at:"2024-10-12T07:30:00Z" },
  { id:"staff3", email:"cashier@autocore.com",  first_name:"Tom",     last_name:"Wilson",   phone:"313-555-9003", avatar_url:null, role:"cashier",        is_active:true, last_login:"2024-10-11T18:00:00Z", created_at:"2024-02-01T00:00:00Z", updated_at:"2024-10-11T18:00:00Z" },
  { id:"staff4", email:"inventory@autocore.com",first_name:"James",   last_name:"Hart",     phone:"313-555-9004", avatar_url:null, role:"inventory_staff",is_active:true, last_login:"2024-10-12T06:00:00Z", created_at:"2024-03-10T00:00:00Z", updated_at:"2024-10-12T06:00:00Z" },
  { id:"staff5", email:"staff@autocore.com",    first_name:"Linda",   last_name:"Ross",     phone:"313-555-9005", avatar_url:null, role:"cashier",        is_active:false,last_login:"2024-09-20T10:00:00Z", created_at:"2024-04-01T00:00:00Z", updated_at:"2024-09-20T10:00:00Z" },
];
