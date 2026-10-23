-- Honda storefront scope and secure fitment/product maintenance.
-- Non-destructive: no products, inventory, order rows, carts, or fitments are deleted.
-- Existing non-Honda products remain in products and can be managed by staff.

insert into public.vehicle_makes(name) values ('Honda') on conflict (name) do nothing;

-- Staff authorization helper is introduced by 202610120001_inventory_transactions.sql.
-- Honda models and verified fitments may be maintained only by authorized inventory staff.
drop policy if exists "Staff manage vehicle makes" on public.vehicle_makes;
create policy "Staff manage vehicle makes" on public.vehicle_makes for all to authenticated using(public.is_inventory_staff()) with check(public.is_inventory_staff());
drop policy if exists "Staff manage vehicle models" on public.vehicle_models;
create policy "Staff manage vehicle models" on public.vehicle_models for all to authenticated using(public.is_inventory_staff()) with check(public.is_inventory_staff());
drop policy if exists "Staff manage vehicle compatibility" on public.vehicle_compatibility;
create policy "Staff manage vehicle compatibility" on public.vehicle_compatibility for all to authenticated using(public.is_inventory_staff()) with check(public.is_inventory_staff());
grant insert,update,delete on public.vehicle_makes,public.vehicle_models,public.vehicle_compatibility to authenticated;

-- Product form writes retain the existing role boundary. Archiving uses status='inactive'.
drop policy if exists "Staff manage products" on public.products;
create policy "Staff manage products" on public.products for all to authenticated using(public.is_inventory_staff()) with check(public.is_inventory_staff());
grant insert,update on public.products to authenticated;
grant select on public.suppliers to authenticated;

-- The public catalog contains confirmed Honda-compatible products only. This does
-- not change product status and therefore preserves non-Honda inventory/history.
create or replace view public.catalog_products
with (security_barrier=true) as
select p.id,p.name,p.slug,p.sku,p.category_id,p.brand_id,p.description,p.short_description,
       p.selling_price,p.discount_percent,p.stock_quantity,p.reorder_level,p.status,
       p.is_featured,p.tags,p.specifications,p.created_at,p.updated_at
from public.products p
where p.status='active'
  and exists (
    select 1 from public.vehicle_compatibility vc
    join public.vehicle_makes vm on vm.id=vc.make_id
    where vc.product_id=p.id and vm.name='Honda'
  );
revoke all on public.catalog_products from public;
grant select on public.catalog_products to anon,authenticated;
