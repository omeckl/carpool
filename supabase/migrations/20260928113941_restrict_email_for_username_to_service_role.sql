-- Adatvédelmi javítás: az email_for_username() RPC-vel korábban bárki
-- (bejelentkezés nélkül is) lekérdezhette egy felhasználónév e-mail-címét.
-- A felhasználóneves bejelentkezés mostantól a sign-in-with-username Edge
-- Function-ön keresztül megy, amely service role-lal hívja ezt a függvényt,
-- így a kliensnek (anon / authenticated) már nincs rá szüksége.
revoke execute on function public.email_for_username(text) from public, anon, authenticated;
grant execute on function public.email_for_username(text) to service_role;
