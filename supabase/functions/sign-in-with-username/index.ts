// Supabase Edge Function: sign-in-with-username
//
// Felhasználónévvel történő bejelentkezés, úgy, hogy a felhasználónévhez
// tartozó e-mail-cím SOHA ne jusson el a klienshez.
//
// Korábban a kliens a public.email_for_username(p_username) RPC-vel,
// bejelentkezés nélkül (anon) lekérdezhette bármely felhasználónév e-mail-
// címét, és utána azzal hívta a signInWithPassword-öt. Ez adatszivárgás volt:
// bárki, aki ismert egy felhasználónevet, megtudhatta a hozzá tartozó e-mailt.
//
// Most a feloldás és a bejelentkezés is itt, szerver oldalon történik:
//  1. service role-lal feloldjuk a felhasználónevet e-mail-címre,
//  2. az anon kulccsal (a normál Supabase Auth útvonalon, annak saját
//     rate limitjével) bejelentkeztetjük a felhasználót,
//  3. csak a session tokeneket adjuk vissza — az e-mail-címet nem.
// Hibás felhasználónév és hibás jelszó esetén ugyanazt az általános
// hibaüzenetet adjuk, hogy ne lehessen kideríteni, létezik-e egy felhasználónév.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GENERIC_ERROR = "Hibás felhasználónév/e-mail vagy jelszó.";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password) {
      return json({ error: GENERIC_ERROR }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: email, error: lookupError } = await admin.rpc("email_for_username", {
      p_username: username,
    });
    if (lookupError) {
      console.error("sign-in-with-username: lookup error:", lookupError);
      return json({ error: "Szerverhiba, próbáld újra később." }, 500);
    }
    if (!email) {
      return json({ error: GENERIC_ERROR }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await authClient.auth.signInWithPassword({
      email: email as string,
      password,
    });
    if (error || !data.session) {
      // A megerősítetlen e-mail-cím külön üzenetet kap, hogy a felhasználó
      // tudja, mi a teendő (ez nem árulja el magát az e-mail-címet).
      if (error?.code === "email_not_confirmed") {
        return json({ error: "Az e-mail-címed még nincs megerősítve.", code: "email_not_confirmed" }, 401);
      }
      return json({ error: GENERIC_ERROR }, 401);
    }

    return json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    console.error("sign-in-with-username error:", err);
    return json({ error: "Szerverhiba, próbáld újra később." }, 500);
  }
});
