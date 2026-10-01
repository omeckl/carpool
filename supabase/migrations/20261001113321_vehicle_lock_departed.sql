-- CAR-45: a jármű csak aktív ÉS még el nem indult hirdetés esetén zárolt
create or replace view public.my_vehicles as
 select id,
    owner_id,
    type,
    plate,
    seats,
    color,
    created_at,
    (exists ( select 1
           from listings l
          where ((l.vehicle_id = v.id) and (l.status = 'active'::text)
                 and not public.listing_has_departed(l.ride_date, l.ride_time)))) as has_active_listing
   from vehicles v
  where (owner_id = auth.uid());

create or replace function public.update_vehicle(p_vehicle_id uuid, p_type text, p_plate text, p_seats integer, p_color text)
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
    raise exception 'A jármű nem szerkeszthető, mert van hozzá tartozó aktív hirdetés. Előbb töröld vagy zárd le az érintett hirdetést.';
  end if;

  if p_seats < 1 or p_seats > 8 then
    raise exception 'A max férőhely 1 és 8 közé kell essen.';
  end if;

  if p_type is null or length(btrim(p_type)) < 2 then
    raise exception 'A jármű típusa legalább 2 karakter legyen.';
  end if;

  if p_plate is null or length(btrim(p_plate)) = 0 then
    raise exception 'A rendszám nem lehet üres.';
  end if;

  update public.vehicles
  set type = p_type, plate = p_plate, seats = p_seats, color = p_color
  where id = p_vehicle_id;
end;
$function$;
