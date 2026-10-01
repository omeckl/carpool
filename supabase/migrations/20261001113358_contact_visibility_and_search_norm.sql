-- CAR-43 / CAR-56 / CAR-54
create or replace view public.ride_details as
 select l.id,
    l.driver_id,
    dp.username as driver_username,
        case
            when ((auth.uid() = l.driver_id) or (exists ( select 1
               from bookings b
              where ((b.listing_id = l.id) and (b.passenger_id = auth.uid()))))) then dp.full_name
            else null::text
        end as driver_full_name,
    l.from_city,
    l.to_city,
    l.ride_date,
    l.ride_time,
    l.price_huf,
    l.seats_total,
    l.car_type,
    l.car_color,
        case
            when ((auth.uid() = l.driver_id) or (exists ( select 1
               from bookings b
              where ((b.listing_id = l.id) and (b.passenger_id = auth.uid()) and (b.status = 'active'::text))))) then l.car_plate
            else null::text
        end as car_plate,
    l.status,
    coalesce(( select sum(b2.seats_booked) as sum
           from bookings b2
          where ((b2.listing_id = l.id) and (b2.status = 'active'::text))), (0)::bigint) as seats_booked,
    (l.seats_total - coalesce(( select sum(b2.seats_booked) as sum
           from bookings b2
          where ((b2.listing_id = l.id) and (b2.status = 'active'::text))), (0)::bigint)) as seats_available,
    l.created_at,
    ((l.ride_date + l.ride_time) at time zone 'Europe/Budapest'::text) as departs_at,
    l.cancelled_seats_snapshot,
    dpc.image_url as destination_photo_url,
    dpc.status as destination_photo_status,
        case
            when (exists ( select 1
               from bookings b
              where ((b.listing_id = l.id) and (b.passenger_id = auth.uid()) and (b.status = 'active'::text)))) then dp.phone
            else null::text
        end as driver_phone,
        case
            when (exists ( select 1
               from bookings b
              where ((b.listing_id = l.id) and (b.passenger_id = auth.uid()) and (b.status = 'active'::text)))) then (select au.email::text from auth.users au where au.id = l.driver_id)
            else null::text
        end as driver_email,
    lower(extensions.unaccent('extensions.unaccent'::regdictionary, btrim(l.from_city))) as from_city_norm,
    lower(extensions.unaccent('extensions.unaccent'::regdictionary, btrim(l.to_city))) as to_city_norm
   from ((listings l
     join profiles dp on ((dp.id = l.driver_id)))
     left join destination_photo_cache dpc on ((dpc.destination = normalize_destination(l.to_city))));

create or replace view public.my_bookings as
 select b.id as booking_id,
    b.seats_booked,
    b.status as booking_status,
        case
            when (b.status = 'listing_cancelled'::text) then 'removed'::text
            when (b.status = 'cancelled'::text) then 'cancelled'::text
            when (((r.ride_date + r.ride_time) at time zone 'Europe/Budapest'::text) < now()) then 'expired'::text
            else 'active'::text
        end as display_status,
    r.id as listing_id,
    r.from_city,
    r.to_city,
    r.ride_date,
    r.ride_time,
    r.price_huf,
    r.car_type,
    r.car_color,
    r.car_plate,
    r.driver_id,
    r.driver_username,
    r.driver_full_name,
    b.created_at,
    case when b.status = 'active'::text then dp.phone else null::text end as driver_phone,
    (case when b.status = 'active'::text then au.email end)::character varying(255) as driver_email,
    r.seats_total,
    r.seats_available
   from (((bookings b
     join ride_details r on ((r.id = b.listing_id)))
     join profiles dp on ((dp.id = r.driver_id)))
     join auth.users au on ((au.id = r.driver_id)))
  where (b.passenger_id = auth.uid());

create or replace view public.my_passengers as
 select b.id as booking_id,
    b.listing_id,
    b.seats_booked,
    b.status as booking_status,
    b.created_at,
    l.from_city,
    l.to_city,
    l.ride_date,
    l.ride_time,
    pp.id as passenger_id,
    pp.username as passenger_username,
    pp.full_name as passenger_full_name,
    case when b.status = 'active'::text then pp.phone else null::text end as passenger_phone,
    (b.created_at > dp.utasaim_last_viewed_at) as is_new,
    (case when b.status = 'active'::text then au.email end)::character varying(255) as passenger_email,
        case
            when (b.status = 'listing_cancelled'::text) then 'removed'::text
            when (b.status = 'cancelled'::text) then 'cancelled'::text
            when (((l.ride_date + l.ride_time) at time zone 'Europe/Budapest'::text) < now()) then 'expired'::text
            else 'active'::text
        end as display_status
   from ((((bookings b
     join listings l on ((l.id = b.listing_id)))
     join profiles pp on ((pp.id = b.passenger_id)))
     join profiles dp on ((dp.id = l.driver_id)))
     join auth.users au on ((au.id = pp.id)))
  where (l.driver_id = auth.uid())
  order by b.created_at desc;
