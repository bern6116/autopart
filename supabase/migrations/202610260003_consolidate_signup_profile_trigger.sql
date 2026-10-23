-- Consolidate the two competing auth.users signup triggers.
--
-- This migration is intentionally non-retroactive:
--   * existing auth users and profiles are not updated or recreated;
--   * existing cashier roles are left unchanged for manual review;
--   * Kendall's existing super_admin role is not touched.

begin;

-- Refuse to remove either trigger unless the live trigger names still invoke
-- the two known signup functions. This prevents an unrelated trigger from
-- being removed if the database has drifted since inspection.
do $preflight$
declare
  v_legacy_function text;
  v_hardened_function text;
  v_missing_columns text;
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Missing required table public.profiles';
  end if;

  select string_agg(required.column_name, ', ' order by required.column_name)
    into v_missing_columns
  from (
    values
      ('id'), ('email'), ('first_name'), ('middle_name'), ('last_name'),
      ('phone'), ('role'), ('is_active'), ('created_at'), ('updated_at')
  ) as required(column_name)
  where not exists (
    select 1
    from information_schema.columns existing
    where existing.table_schema = 'public'
      and existing.table_name = 'profiles'
      and existing.column_name = required.column_name
  );

  if v_missing_columns is not null then
    raise exception 'Missing required public.profiles columns: %', v_missing_columns;
  end if;

  select n.nspname || '.' || p.proname
    into v_legacy_function
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
  join pg_namespace n on n.oid = p.pronamespace
  where t.tgrelid = 'auth.users'::regclass
    and t.tgname = 'on_auth_user_created'
    and not t.tgisinternal;

  if v_legacy_function is distinct from 'public.handle_new_user' then
    raise exception
      'Expected on_auth_user_created to invoke public.handle_new_user, found %',
      coalesce(v_legacy_function, '<missing>');
  end if;

  select n.nspname || '.' || p.proname
    into v_hardened_function
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
  join pg_namespace n on n.oid = p.pronamespace
  where t.tgrelid = 'auth.users'::regclass
    and t.tgname = 'on_auth_user_created_profile'
    and not t.tgisinternal;

  if v_hardened_function is distinct from 'public.handle_new_auth_user' then
    raise exception
      'Expected on_auth_user_created_profile to invoke public.handle_new_auth_user, found %',
      coalesce(v_hardened_function, '<missing>');
  end if;
end
$preflight$;

-- Canonical signup handler. Authorization metadata is never trusted for role
-- assignment: every newly created profile starts as a customer.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_first_name  text;
  v_middle_name text;
  v_last_name   text;
  v_phone       text;
begin
  v_first_name := nullif(btrim(new.raw_user_meta_data ->> 'first_name'), '');
  v_middle_name := nullif(btrim(new.raw_user_meta_data ->> 'middle_name'), '');
  v_last_name := nullif(btrim(new.raw_user_meta_data ->> 'last_name'), '');
  v_phone := nullif(btrim(new.raw_user_meta_data ->> 'phone'), '');

  insert into public.profiles (
    id,
    email,
    first_name,
    middle_name,
    last_name,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(v_first_name, ''),
    v_middle_name,
    coalesce(v_last_name, ''),
    v_phone,
    'customer',
    true,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

-- Keep the hardened trigger as the single canonical signup trigger. Recreate it
-- so its binding is explicit, then remove only the verified legacy trigger.
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

drop trigger on_auth_user_created on auth.users;

-- The legacy function is no longer a signup handler. DROP without CASCADE is
-- deliberate: an unknown remaining dependency aborts and rolls back everything.
drop function public.handle_new_user();

commit;

-- Read-only manual review: accounts that may have received the historical
-- cashier default. This intentionally includes legitimate cashiers; review each
-- row and do not bulk-change roles based on this query alone.
--
-- select
--   u.id,
--   u.email,
--   u.created_at as auth_created_at,
--   p.created_at as profile_created_at,
--   p.first_name,
--   p.middle_name,
--   p.last_name,
--   p.role,
--   p.is_active,
--   abs(extract(epoch from (p.created_at - u.created_at))) as creation_gap_seconds
-- from auth.users u
-- join public.profiles p on p.id = u.id
-- where p.role = 'cashier'
-- order by u.created_at;

-- Verification: exactly one enabled user-defined AFTER INSERT trigger should
-- remain on auth.users, invoking public.handle_new_auth_user.
--
-- select
--   t.tgname as trigger_name,
--   t.tgenabled as enabled,
--   n.nspname as function_schema,
--   p.proname as function_name,
--   pg_get_triggerdef(t.oid, true) as trigger_definition
-- from pg_trigger t
-- join pg_proc p on p.oid = t.tgfoid
-- join pg_namespace n on n.oid = p.pronamespace
-- where t.tgrelid = 'auth.users'::regclass
--   and not t.tgisinternal
--   and (pg_get_triggerdef(t.oid, true) ilike '%after insert%')
-- order by t.tgname;

-- Verify the canonical function is SECURITY DEFINER with a restricted path.
--
-- select
--   p.oid::regprocedure as function_name,
--   p.prosecdef as security_definer,
--   p.proconfig as function_settings,
--   pg_get_functiondef(p.oid) as function_definition
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public'
--   and p.proname = 'handle_new_auth_user';

-- Confirm existing role assignments, including Kendall's, were not changed.
--
-- select id, role, is_active
-- from public.profiles
-- where id = '6494660f-1d66-4b37-99b9-9f5667c236d1'::uuid;
