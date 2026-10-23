-- Reliable, retry-safe inventory operations for Auto Core.
-- Apply after lib/supabase-schema.sql. Existing stock is treated as the current
-- balance; it is intentionally not backfilled as fictional movement history.

create extension if not exists pgcrypto;

-- Some early project databases contain only profiles/products. Bootstrap the
-- missing workflow tables; IF NOT EXISTS preserves all existing tables/data.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  first_name text not null,
  last_name text not null,
  email text,
  phone text default '',
  status text default 'active' check (status in ('active','suspended','blocked')),
  total_orders integer default 0,
  total_spent numeric(10,2) default 0,
  last_order_date timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references public.customers(id),
  customer_name text not null,
  customer_email text default '',
  customer_phone text default '',
  status text default 'pending' check (status in ('pending','confirmed','processing','ready','shipped','delivered','cancelled','refunded')),
  payment_method text default 'cash' check (payment_method in ('cash','card','online','cod','other')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null,
  shipping_address jsonb,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null
);

create table if not exists public.system_settings (
  key text primary key,
  value text not null
);

insert into public.system_settings(key,value) values ('tax_rate','8')
on conflict (key) do nothing;

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text unique not null,
  supplier_id uuid,
  status text default 'draft' check (status in ('draft','ordered','partial','received','cancelled')),
  order_date date not null default current_date,
  expected_date date,
  received_date date,
  subtotal numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  total numeric(10,2) default 0,
  notes text default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchase_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity_ordered integer not null,
  quantity_received integer default 0,
  unit_cost numeric(10,2) not null,
  total_cost numeric(10,2) not null
);

do $$
begin
  if to_regclass('public.suppliers') is not null
     and not exists (select 1 from pg_constraint where conname='purchase_orders_supplier_id_fkey' and conrelid='public.purchase_orders'::regclass) then
    alter table public.purchase_orders add constraint purchase_orders_supplier_id_fkey
      foreign key (supplier_id) references public.suppliers(id);
  end if;
end $$;

alter table public.products
  alter column stock_quantity set default 0,
  alter column reorder_level set default 5;

alter table public.products drop constraint if exists products_stock_quantity_nonnegative;
alter table public.products add constraint products_stock_quantity_nonnegative check (stock_quantity >= 0) not valid;
alter table public.products drop constraint if exists products_reorder_level_nonnegative;
alter table public.products add constraint products_reorder_level_nonnegative check (reorder_level >= 0) not valid;
alter table public.purchase_items drop constraint if exists purchase_items_quantity_ordered_positive;
alter table public.purchase_items add constraint purchase_items_quantity_ordered_positive check (quantity_ordered > 0) not valid;
alter table public.purchase_items drop constraint if exists purchase_items_received_valid;
alter table public.purchase_items add constraint purchase_items_received_valid
  check (quantity_received >= 0 and quantity_received <= quantity_ordered) not valid;

create table if not exists public.inventory_operations (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  operation_type text not null check (operation_type in ('checkout','cancel_order','receive_purchase','adjust_stock')),
  idempotency_key text not null check (length(btrim(idempotency_key)) between 8 and 200),
  request_hash text not null,
  source_order_id uuid references public.orders(id),
  source_purchase_id uuid references public.purchase_orders(id),
  result jsonb,
  created_at timestamptz not null default now(),
  unique (actor_id, operation_type, idempotency_key)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.inventory_operations(id),
  product_id uuid not null references public.products(id),
  quantity_delta integer not null check (quantity_delta <> 0),
  stock_before integer not null check (stock_before >= 0),
  stock_after integer not null check (stock_after >= 0),
  reason text not null check (length(btrim(reason)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_created_idx on public.stock_movements(product_id, created_at desc);
create index if not exists inventory_operations_order_idx on public.inventory_operations(source_order_id) where source_order_id is not null;
create index if not exists inventory_operations_purchase_idx on public.inventory_operations(source_purchase_id) where source_purchase_id is not null;
create unique index if not exists one_checkout_operation_per_order on public.inventory_operations(source_order_id)
  where operation_type = 'checkout' and source_order_id is not null;
create unique index if not exists one_cancel_operation_per_order on public.inventory_operations(source_order_id)
  where operation_type = 'cancel_order' and source_order_id is not null;

alter table public.inventory_operations enable row level security;
alter table public.stock_movements enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_items enable row level security;

-- The original broad profile policy allowed a user to edit their own protected
-- role. Restrict direct profile updates to non-privileged columns.
revoke update on public.profiles from authenticated;
grant update (first_name,last_name,phone,avatar_url) on public.profiles to authenticated;

-- The old trigger updates the duplicate inventory table outside the new,
-- products-based source of truth. Receiving is now performed only by the RPC.
drop trigger if exists trg_purchase_inventory on public.purchase_items;
do $$ begin
  if to_regclass('public.sale_items') is not null then
    execute 'drop trigger if exists trg_sale_inventory on public.sale_items';
  end if;
end $$;

create or replace function public.is_inventory_staff()
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active
      and p.role in ('super_admin','admin','manager','inventory_staff')
  );
$$;

revoke all on function public.is_inventory_staff() from public;
grant execute on function public.is_inventory_staff() to authenticated;

drop policy if exists "Staff read inventory operations" on public.inventory_operations;
create policy "Staff read inventory operations" on public.inventory_operations for select to authenticated
  using (public.is_inventory_staff());
drop policy if exists "Staff read stock movements" on public.stock_movements;
create policy "Staff read stock movements" on public.stock_movements for select to authenticated
  using (public.is_inventory_staff());

drop policy if exists "Own order items" on public.order_items;
create policy "Own order items" on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id and c.user_id = auth.uid()
  ));
drop policy if exists "Own orders" on public.orders;
create policy "Own orders" on public.orders for select to authenticated
  using (exists (select 1 from public.customers c where c.id=orders.customer_id and c.user_id=auth.uid()));

-- Raw product rows include supplier costs. Remove public table access and expose
-- safe catalog data through the existing UI/RPC layer instead.
drop policy if exists "Public read products" on public.products;
drop policy if exists "Authenticated catalog read" on public.products;
create policy "Authenticated catalog read" on public.products for select to authenticated
  using (status = 'active');

-- RLS filters rows, not columns. Remove direct product reads so customer clients
-- cannot select cost_price/supplier_id, then expose an intentionally safe view.
revoke select on public.products from anon, authenticated;
create or replace view public.catalog_products
with (security_barrier=true) as
select id,name,slug,sku,category_id,brand_id,description,short_description,
       selling_price,discount_percent,stock_quantity,reorder_level,status,
       is_featured,tags,specifications,created_at,updated_at
from public.products where status='active';
revoke all on public.catalog_products from public;
grant select on public.catalog_products to anon, authenticated;

create or replace function public.admin_inventory_products()
returns setof public.products language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_inventory_staff() then raise exception 'Inventory staff role required' using errcode='42501'; end if;
  return query select * from public.products order by name;
end $$;
revoke all on function public.admin_inventory_products() from public, anon;
grant execute on function public.admin_inventory_products() to authenticated;

create or replace function public.begin_inventory_operation(
  p_type text, p_key text, p_payload jsonb
) returns public.inventory_operations
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_actor uuid := auth.uid(); v_hash text; v_op public.inventory_operations;
begin
  if v_actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if length(btrim(coalesce(p_key,''))) < 8 then raise exception 'A stable idempotency key is required'; end if;
  v_hash := encode(digest(coalesce(p_payload,'null'::jsonb)::text, 'sha256'), 'hex');
  insert into public.inventory_operations(actor_id, operation_type, idempotency_key, request_hash)
  values (v_actor, p_type, p_key, v_hash)
  on conflict (actor_id, operation_type, idempotency_key) do nothing;
  select * into v_op from public.inventory_operations
   where actor_id=v_actor and operation_type=p_type and idempotency_key=p_key for update;
  if v_op.request_hash <> v_hash then raise exception 'Idempotency key was already used with a different request'; end if;
  return v_op;
end $$;
revoke all on function public.begin_inventory_operation(text,text,jsonb) from public, anon, authenticated;

create or replace function public.checkout_order(p_idempotency_key text, p_request jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid(); v_op public.inventory_operations; v_customer public.customers;
  v_order_id uuid := gen_random_uuid(); v_number text; v_subtotal numeric(12,2); v_shipping numeric(12,2);
  v_tax numeric(12,2); v_total numeric(12,2); v_tax_rate numeric; v_result jsonb; r record;
begin
  v_op := public.begin_inventory_operation('checkout', p_idempotency_key, p_request);
  if v_op.result is not null then return v_op.result; end if;
  select * into v_customer from public.customers where user_id=v_actor and status='active' for update;
  if not found then raise exception 'An active customer account is required' using errcode='42501'; end if;
  if coalesce(p_request->>'payment_method','') <> 'cod' then
    raise exception 'Only cash on delivery is available until a verified payment provider is configured';
  end if;
  if jsonb_typeof(p_request->'items') <> 'array' or jsonb_array_length(p_request->'items')=0 then raise exception 'Cart is empty'; end if;
  create temporary table checkout_lines(product_id uuid primary key, quantity integer) on commit drop;
  insert into checkout_lines
  select p.id, sum((x->>'quantity')::integer)::integer
  from jsonb_array_elements(p_request->'items') x
  join public.products p on p.sku = x->>'sku'
  group by p.id;
  if exists(select 1 from checkout_lines where quantity <= 0) then raise exception 'Quantities must be positive'; end if;
  perform 1 from public.products p join checkout_lines l on l.product_id=p.id order by p.id for update of p;
  if (select count(*) from checkout_lines) <> (select count(distinct x->>'sku') from jsonb_array_elements(p_request->'items') x)
    then raise exception 'One or more products do not exist'; end if;
  if exists(select 1 from public.products p join checkout_lines l on l.product_id=p.id where p.status <> 'active')
    then raise exception 'One or more products are inactive'; end if;
  if exists(select 1 from public.products p join checkout_lines l on l.product_id=p.id where p.stock_quantity < l.quantity)
    then raise exception 'Insufficient stock'; end if;
  select round(sum((p.selling_price * (100-coalesce(p.discount_percent,0))/100) * l.quantity),2)
    into v_subtotal from public.products p join checkout_lines l on l.product_id=p.id;
  v_shipping := case p_request->>'delivery_method' when 'pickup' then 0 when 'express' then 19.99 else 9.99 end;
  select coalesce((select value::numeric from public.system_settings where key='tax_rate'),8)/100 into v_tax_rate;
  v_tax := round((v_subtotal+v_shipping)*v_tax_rate,2); v_total := v_subtotal+v_shipping+v_tax;
  v_number := 'AC-' || to_char(clock_timestamp(),'YYYYMMDD') || '-' || upper(substr(replace(v_order_id::text,'-',''),1,8));
  insert into public.orders(id,order_number,customer_id,customer_name,customer_email,customer_phone,status,payment_method,payment_status,subtotal,shipping,tax,total,shipping_address)
  values(v_order_id,v_number,v_customer.id,coalesce(p_request->>'customer_name',v_customer.first_name||' '||v_customer.last_name),
    coalesce(p_request->>'customer_email',v_customer.email),coalesce(p_request->>'customer_phone',v_customer.phone),'confirmed','cod','pending',
    v_subtotal,v_shipping,v_tax,v_total,p_request->'shipping_address');
  insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,discount,total)
  select v_order_id,p.id,p.name,p.sku,l.quantity,p.selling_price,coalesce(p.discount_percent,0),
    round((p.selling_price*(100-coalesce(p.discount_percent,0))/100)*l.quantity,2)
  from public.products p join checkout_lines l on l.product_id=p.id;
  for r in select p.id,l.quantity,p.stock_quantity from public.products p join checkout_lines l on l.product_id=p.id order by p.id loop
    update public.products set stock_quantity=r.stock_quantity-r.quantity,
      status=case when r.stock_quantity-r.quantity=0 then 'out_of_stock' else status end where id=r.id;
    insert into public.stock_movements(operation_id,product_id,quantity_delta,stock_before,stock_after,reason)
      values(v_op.id,r.id,-r.quantity,r.stock_quantity,r.stock_quantity-r.quantity,'Order '||v_number);
  end loop;
  v_result := jsonb_build_object('order_id',v_order_id,'order_number',v_number,'total',v_total,'payment_status','pending');
  update public.inventory_operations set source_order_id=v_order_id,result=v_result where id=v_op.id;
  return v_result;
end $$;

create or replace function public.cancel_order(p_order_id uuid, p_idempotency_key text, p_reason text default 'Customer cancellation')
returns jsonb language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_op public.inventory_operations; v_order public.orders; v_result jsonb; r record; v_staff boolean;
begin
  v_op:=public.begin_inventory_operation('cancel_order',p_idempotency_key,jsonb_build_object('order_id',p_order_id,'reason',p_reason));
  if v_op.result is not null then return v_op.result; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  select public.is_inventory_staff() into v_staff;
  if not v_staff and not exists(select 1 from public.customers where id=v_order.customer_id and user_id=auth.uid()) then raise exception 'Not authorized' using errcode='42501'; end if;
  if v_order.status not in ('pending','confirmed','processing','ready') then raise exception 'Order cannot be cancelled in its current state'; end if;
  if exists(select 1 from public.inventory_operations where operation_type='cancel_order' and source_order_id=p_order_id) then raise exception 'Order stock was already restored'; end if;
  perform 1 from public.products p join public.order_items i on i.product_id=p.id where i.order_id=p_order_id order by p.id for update of p;
  for r in select p.id,p.stock_quantity,i.quantity from public.products p join public.order_items i on i.product_id=p.id where i.order_id=p_order_id order by p.id loop
    update public.products set stock_quantity=r.stock_quantity+r.quantity,
      status=case when status='out_of_stock' then 'active' else status end where id=r.id;
    insert into public.stock_movements(operation_id,product_id,quantity_delta,stock_before,stock_after,reason)
      values(v_op.id,r.id,r.quantity,r.stock_quantity,r.stock_quantity+r.quantity,coalesce(nullif(btrim(p_reason),''),'Order cancellation'));
  end loop;
  update public.orders set status='cancelled' where id=p_order_id;
  v_result:=jsonb_build_object('order_id',p_order_id,'status','cancelled');
  update public.inventory_operations set source_order_id=p_order_id,result=v_result where id=v_op.id;
  return v_result;
end $$;

create or replace function public.receive_purchase(p_purchase_id uuid,p_idempotency_key text,p_lines jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_op public.inventory_operations; v_po public.purchase_orders; v_result jsonb; r record;
begin
  if not public.is_inventory_staff() then raise exception 'Inventory staff role required' using errcode='42501'; end if;
  v_op:=public.begin_inventory_operation('receive_purchase',p_idempotency_key,jsonb_build_object('purchase_id',p_purchase_id,'lines',p_lines));
  if v_op.result is not null then return v_op.result; end if;
  select * into v_po from public.purchase_orders where id=p_purchase_id for update;
  if not found or v_po.status not in ('ordered','partial') then raise exception 'Purchase order is not receivable'; end if;
  create temporary table receive_lines(item_id uuid primary key, quantity integer) on commit drop;
  insert into receive_lines select (x->>'item_id')::uuid,sum((x->>'quantity')::int)::int from jsonb_array_elements(p_lines)x group by (x->>'item_id')::uuid;
  if not exists(select 1 from receive_lines) or exists(select 1 from receive_lines where quantity<=0) then raise exception 'Positive receiving quantities are required'; end if;
  perform 1 from public.purchase_items i join receive_lines l on l.item_id=i.id where i.purchase_id=p_purchase_id order by i.product_id for update of i;
  if (select count(*) from public.purchase_items i join receive_lines l on l.item_id=i.id where i.purchase_id=p_purchase_id)<>(select count(*) from receive_lines) then raise exception 'A line does not belong to this purchase order'; end if;
  if exists(select 1 from public.purchase_items i join receive_lines l on l.item_id=i.id where i.quantity_received+l.quantity>i.quantity_ordered) then raise exception 'Received quantity exceeds remaining quantity'; end if;
  perform 1 from public.products p join public.purchase_items i on i.product_id=p.id join receive_lines l on l.item_id=i.id order by p.id for update of p;
  for r in select i.id item_id,p.id product_id,p.stock_quantity,l.quantity from public.purchase_items i join receive_lines l on l.item_id=i.id join public.products p on p.id=i.product_id order by p.id loop
    update public.purchase_items set quantity_received=quantity_received+r.quantity where id=r.item_id;
    update public.products set stock_quantity=r.stock_quantity+r.quantity,status=case when status='out_of_stock' then 'active' else status end where id=r.product_id;
    insert into public.stock_movements(operation_id,product_id,quantity_delta,stock_before,stock_after,reason) values(v_op.id,r.product_id,r.quantity,r.stock_quantity,r.stock_quantity+r.quantity,'Purchase receipt '||v_po.po_number);
  end loop;
  update public.purchase_orders set status=case when not exists(select 1 from public.purchase_items where purchase_id=p_purchase_id and quantity_received<quantity_ordered) then 'received' else 'partial' end,
    received_date=case when not exists(select 1 from public.purchase_items where purchase_id=p_purchase_id and quantity_received<quantity_ordered) then current_date else received_date end where id=p_purchase_id;
  select jsonb_build_object('purchase_id',id,'status',status) into v_result from public.purchase_orders where id=p_purchase_id;
  update public.inventory_operations set source_purchase_id=p_purchase_id,result=v_result where id=v_op.id;
  return v_result;
end $$;

create or replace function public.adjust_stock(p_product_id uuid,p_quantity_delta integer,p_reason text,p_idempotency_key text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_op public.inventory_operations; v_product public.products; v_result jsonb;
begin
  if not public.is_inventory_staff() then raise exception 'Inventory staff role required' using errcode='42501'; end if;
  if p_quantity_delta=0 then raise exception 'Adjustment cannot be zero'; end if;
  if length(btrim(coalesce(p_reason,'')))<3 then raise exception 'A meaningful reason is required'; end if;
  v_op:=public.begin_inventory_operation('adjust_stock',p_idempotency_key,jsonb_build_object('product_id',p_product_id,'quantity_delta',p_quantity_delta,'reason',p_reason));
  if v_op.result is not null then return v_op.result; end if;
  select * into v_product from public.products where id=p_product_id for update;
  if not found then raise exception 'Product not found'; end if;
  if v_product.stock_quantity+p_quantity_delta<0 then raise exception 'Adjustment would make stock negative'; end if;
  update public.products set stock_quantity=v_product.stock_quantity+p_quantity_delta,
    status=case when v_product.stock_quantity+p_quantity_delta=0 then 'out_of_stock' when status='out_of_stock' then 'active' else status end where id=p_product_id;
  insert into public.stock_movements(operation_id,product_id,quantity_delta,stock_before,stock_after,reason)
    values(v_op.id,p_product_id,p_quantity_delta,v_product.stock_quantity,v_product.stock_quantity+p_quantity_delta,btrim(p_reason));
  v_result:=jsonb_build_object('product_id',p_product_id,'stock_before',v_product.stock_quantity,'stock_after',v_product.stock_quantity+p_quantity_delta);
  update public.inventory_operations set result=v_result where id=v_op.id;
  return v_result;
end $$;

revoke all on function public.checkout_order(text,jsonb) from public, anon;
revoke all on function public.cancel_order(uuid,text,text) from public, anon;
revoke all on function public.receive_purchase(uuid,text,jsonb) from public, anon;
revoke all on function public.adjust_stock(uuid,integer,text,text) from public, anon;
grant execute on function public.checkout_order(text,jsonb) to authenticated;
grant execute on function public.cancel_order(uuid,text,text) to authenticated;
grant execute on function public.receive_purchase(uuid,text,jsonb) to authenticated;
grant execute on function public.adjust_stock(uuid,integer,text,text) to authenticated;

revoke insert,update,delete on public.inventory_operations,public.stock_movements from anon,authenticated;
revoke update(stock_quantity,reorder_level,status) on public.products from anon,authenticated;
revoke update(quantity_received) on public.purchase_items from anon,authenticated;

