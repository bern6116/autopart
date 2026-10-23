-- Parts-brand reconciliation and Kendall-only catalog maintenance.
-- Non-destructive: no products, brands, inventory, orders, or references are deleted.

-- Use the existing authenticated user/profile relationship. Authorization is
-- tied to the verified auth UUID and also requires the existing active
-- super_admin profile; editable user metadata and email are not trusted.
create or replace function public.is_kendall_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid() = '6494660f-1d66-4b37-99b9-9f5667c236d1'::uuid
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super_admin'
        and p.is_active = true
    );
$$;
revoke all on function public.is_kendall_admin() from public;
grant execute on function public.is_kendall_admin() to authenticated;

-- Some older AutoCore databases stored a product manufacturer in products.brand
-- as text. When that legacy column exists, connect only rows having exactly one
-- case/whitespace-normalized match in brands. Ambiguous and unmatched values are
-- deliberately left untouched for manual review.
do $reconcile$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'brand'
  ) then
    execute $sql$
      update public.products p
      set brand_id = (
        select min(b.id::text)::uuid
        from public.brands b
        where lower(btrim(b.name)) = lower(btrim(p.brand))
      )
      where p.brand_id is null
        and nullif(btrim(p.brand), '') is not null
        and (
          select count(*) from public.brands b
          where lower(btrim(b.name)) = lower(btrim(p.brand))
        ) = 1
    $sql$;
  end if;
end
$reconcile$;

alter table public.brands enable row level security;
drop policy if exists "Kendall manage brands" on public.brands;
create policy "Kendall manage brands"
  on public.brands for all to authenticated
  using (public.is_kendall_admin())
  with check (public.is_kendall_admin());
grant insert, update, delete on public.brands to authenticated;

-- Replace the broader product-writing policy without changing any role values.
drop policy if exists "Staff manage products" on public.products;
drop policy if exists "Kendall manage products" on public.products;
create policy "Kendall manage products"
  on public.products for all to authenticated
  using (public.is_kendall_admin())
  with check (public.is_kendall_admin());
grant insert, update on public.products to authenticated;

-- Public read policies and catalog_products remain unchanged. The catalog view
-- exposes neither supplier_id nor cost_price.

-- Manual data-audit queries (run after this migration):
-- Products with no relational manufacturer:
--   select id, sku, name from public.products where brand_id is null order by name;
-- Normalized duplicate manufacturer records requiring review (not merged here):
--   select lower(btrim(name)) normalized_name, count(*), array_agg(id) brand_ids
--   from public.brands group by lower(btrim(name)) having count(*) > 1;
-- Legacy manufacturer values still unmatched (only if products.brand exists):
--   select p.id, p.sku, p.name, p.brand from public.products p
--   where p.brand_id is null and nullif(btrim(p.brand), '') is not null;
