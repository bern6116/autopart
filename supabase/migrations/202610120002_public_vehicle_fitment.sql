-- Public, read-only vehicle fitment lookup used by the homepage finder.
-- This migration creates structure only. Populate it with verified fitment data;
-- it deliberately does not invent compatibility records.

create table if not exists public.vehicle_makes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);
create table if not exists public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid not null references public.vehicle_makes(id) on delete cascade,
  name text not null,
  unique(make_id,name)
);
create table if not exists public.vehicle_compatibility (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  make_id uuid not null references public.vehicle_makes(id),
  model_id uuid not null references public.vehicle_models(id),
  year_from integer not null,
  year_to integer not null,
  engine text,
  trim text,
  check(year_from between 1886 and 2200),
  check(year_to between year_from and 2200)
);

create index if not exists vehicle_models_make_idx on public.vehicle_models(make_id);
create index if not exists vehicle_compat_lookup_idx on public.vehicle_compatibility(make_id,model_id,year_from,year_to);
create index if not exists vehicle_compat_product_idx on public.vehicle_compatibility(product_id);

alter table public.vehicle_makes enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.vehicle_compatibility enable row level security;

drop policy if exists "Public read vehicle makes" on public.vehicle_makes;
create policy "Public read vehicle makes" on public.vehicle_makes for select to anon,authenticated using(true);
drop policy if exists "Public read vehicle models" on public.vehicle_models;
create policy "Public read vehicle models" on public.vehicle_models for select to anon,authenticated using(true);
drop policy if exists "Public read vehicle compatibility" on public.vehicle_compatibility;
create policy "Public read vehicle compatibility" on public.vehicle_compatibility for select to anon,authenticated using(true);

grant select on public.vehicle_makes,public.vehicle_models,public.vehicle_compatibility to anon,authenticated;
revoke insert,update,delete on public.vehicle_makes,public.vehicle_models,public.vehicle_compatibility from anon,authenticated;
