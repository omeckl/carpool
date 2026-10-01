-- CAR-45 / CAR-48: ezt a migrációt Orsi futtatja (npx.cmd supabase db push), mert törlő utasítást tartalmaz, és jóváhagyást igényel.
create or replace function public.remove_vehicle(p_vehicle_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_owner_id uuid;
  v_has_active boolean;
begin
  select owner_id into v_owner_id from public.vehicles where id = p_vehicle_id for update;

  if not found or v_owner_id != auth.uid() then
    raise exception 'A jármű nem található, vagy nem a tiéd.';
  end if;

  select exists (
    select 1 from public.listings l
    where l.vehicle_id = p_vehicle_id and l.status = 'active'
      and not public.listing_has_departed(l.ride_date, l.ride_time)
  ) into v_has_active;

  if v_has_active then
    raise exception 'A jármű nem törölhető, mert van hozzá tartozó aktív hirdetés. Előbb töröld vagy zárd le az érintett hirdetést.';
  end if;

  delete from public.vehicles where id = p_vehicle_id;
end;
$function$;

-- CAR-48: a régi, kis/nagybetű-érzékeny egyediség helyett a lower(username) index él
alter table public.profiles drop constraint if exists profiles_username_key;
