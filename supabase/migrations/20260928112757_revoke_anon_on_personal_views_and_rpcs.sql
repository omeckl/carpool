-- A "my_*" nézetek és a két "utasaim" RPC csak bejelentkezett felhasználónak
-- értelmes (auth.uid()-re szűrnek), a frontend is csak bejelentkezve hívja őket.
-- Az anon szerepkör jogait visszavonjuk, hogy az auth.users adatai
-- (e-mail) semmilyen módon ne legyenek elérhetők bejelentkezés nélkül.
revoke select on public.my_bookings, public.my_listings, public.my_passengers, public.my_vehicles from anon, public;
grant select on public.my_bookings, public.my_listings, public.my_passengers, public.my_vehicles to authenticated;

revoke execute on function public.count_new_passengers() from public, anon;
revoke execute on function public.mark_passengers_viewed() from public, anon;
grant execute on function public.count_new_passengers() to authenticated;
grant execute on function public.mark_passengers_viewed() to authenticated;
