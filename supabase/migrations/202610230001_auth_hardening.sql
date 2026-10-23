-- Auth/profile hardening for role-aware routing. Non-destructive for existing users.

alter table public.profiles alter column role set default 'customer';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin','admin','manager','cashier','inventory_staff','customer'));

-- New signups receive only the non-privileged customer role. Existing profiles,
-- including super_admin accounts, are not changed or recreated.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path=pg_catalog,public
as $$ begin
  insert into public.profiles(id,email,first_name,last_name,phone,role,is_active)
  values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name',''),new.raw_user_meta_data->>'phone','customer',true)
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute function public.handle_new_auth_user();

-- A user may read their linked profile but cannot change authorization fields.
drop policy if exists "Own profile" on public.profiles;
drop policy if exists "Own profile read" on public.profiles;
create policy "Own profile read" on public.profiles for select to authenticated using(auth.uid()=id);
drop policy if exists "Own profile update" on public.profiles;
create policy "Own profile update" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update(first_name,last_name,phone,avatar_url) on public.profiles to authenticated;

-- Customer account queries are scoped through auth.uid().
drop policy if exists "Own customer read" on public.customers;
create policy "Own customer read" on public.customers for select to authenticated using(user_id=auth.uid());
drop policy if exists "Own customer update" on public.customers;
create policy "Own customer update" on public.customers for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Some existing deployments do not include the optional addresses table.
-- Secure it when present without making auth hardening depend on that feature.
do $$ begin
  if to_regclass('public.addresses') is not null then
    execute 'alter table public.addresses enable row level security';
    execute 'drop policy if exists "Own addresses" on public.addresses';
    execute $policy$
      create policy "Own addresses" on public.addresses for all to authenticated
      using(exists(select 1 from public.customers c where c.id=addresses.customer_id and c.user_id=auth.uid()))
      with check(exists(select 1 from public.customers c where c.id=addresses.customer_id and c.user_id=auth.uid()))
    $policy$;
  end if;
end $$;

-- Ensure the existing order isolation policies remain explicit and repeatable.
drop policy if exists "Own orders" on public.orders;
create policy "Own orders" on public.orders for select to authenticated
  using(exists(select 1 from public.customers c where c.id=orders.customer_id and c.user_id=auth.uid()));
drop policy if exists "Own order items" on public.order_items;
create policy "Own order items" on public.order_items for select to authenticated
  using(exists(select 1 from public.orders o join public.customers c on c.id=o.customer_id where o.id=order_items.order_id and c.user_id=auth.uid()));

-- Supplier records are staff-only even though the admin product form reads them.
alter table public.suppliers enable row level security;
drop policy if exists "Staff read suppliers" on public.suppliers;
create policy "Staff read suppliers" on public.suppliers for select to authenticated using(public.is_inventory_staff());
revoke select on public.suppliers from anon,authenticated;
grant select on public.suppliers to authenticated;
