-- CAR-48: kis/nagybetű-független egyedi felhasználónév
create unique index if not exists profiles_username_lower_key on public.profiles (lower(username));

create or replace function public.email_for_username(p_username text)
returns text
language sql
security definer
set search_path to 'public', 'auth'
as $function$
  select u.email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.username) = lower(btrim(p_username))
  limit 1;
$function$;

create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(btrim(p_username))
  );
$function$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- CAR-49: regisztrációs mezők szerveroldali ellenőrzése
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, username, full_name, phone)
  values (
    new.id,
    btrim(new.raw_user_meta_data ->> 'username'),
    btrim(new.raw_user_meta_data ->> 'full_name'),
    btrim(new.raw_user_meta_data ->> 'phone')
  );
  return new;
end;
$function$;

alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[A-Za-z0-9_.-]{3,20}$'),
  add constraint profiles_full_name_len check (length(btrim(full_name)) >= 2),
  add constraint profiles_phone_format check (
    phone ~ '^[0-9 +()-]+$' and length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 9
  );

-- CAR-52: járműadatok normalizálása és ellenőrzése
create or replace function public.normalize_vehicle()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.type := btrim(new.type);
  new.plate := upper(btrim(new.plate));
  new.color := nullif(btrim(new.color), '');
  return new;
end;
$function$;

create trigger vehicles_normalize
  before insert or update on public.vehicles
  for each row execute function public.normalize_vehicle();

alter table public.vehicles
  add constraint vehicles_type_len check (length(btrim(type)) >= 2),
  add constraint vehicles_plate_format check (plate ~ '^[A-Z0-9 -]{1,10}$');
