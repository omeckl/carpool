-- A pg_net extension a public sémában volt (Supabase Advisor: extension_in_public).
-- A pg_net nem relokálható (ALTER EXTENSION ... SET SCHEMA nem működik), ezért
-- újra létrehozzuk az extensions sémában. A függvényei (net.http_post stb.)
-- továbbra is a "net" sémában lesznek, így a triggereinkben lévő
-- net.http_post(...) hívások változatlanul működnek.
drop extension if exists pg_net;
create extension if not exists pg_net with schema extensions;
