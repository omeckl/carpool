import { supabase } from "./supabase";
import { friendlyAuthError, normalizeSearch } from "./validation";

// ============================================================
// Típusok — a Supabase séma (profiles / vehicles / ride_details /
// my_bookings / my_listings) leképezései.
// ============================================================

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  type: string;
  plate: string;
  seats: number;
  color: string | null;
  // Csak a my_vehicles nézetben elérhető: van-e a járműhöz tartozó AKTÍV
  // hirdetés — ha igen, a jármű se nem szerkeszthető, se nem törölhető.
  has_active_listing?: boolean;
}

export interface RideDetails {
  id: string;
  driver_id: string;
  driver_username: string;
  driver_full_name: string | null;
  from_city: string;
  to_city: string;
  ride_date: string;
  ride_time: string;
  price_huf: number;
  seats_total: number;
  car_type: string;
  car_color: string | null;
  car_plate: string | null;
  status: "active" | "cancelled";
  seats_booked: number;
  seats_available: number;
  created_at: string;
  // Csak aktív foglalással rendelkező utasnak töltődik ki (CAR-56).
  driver_phone?: string | null;
  driver_email?: string | null;
  // Az indulás pontos időpontja (ride_date + ride_time), a szerveren
  // Europe/Budapest időzóna szerint (nyári/téli időszámítást is helyesen
  // kezelve) UTC időbélyeggé alakítva — erre kell szűrni/hasonlítani, nem a
  // ride_date-re önmagában.
  departs_at: string;
  // Csak a my_listings nézetben elérhető (saját hirdetés esetén) — a jármű
  // tényleges férőhely-kapacitásának lekéréséhez (KAN-14).
  vehicle_id?: string;
  // Csak a my_listings nézetben elérhető: active / cancelled / expired
  // (a hirdetés indulási ideje a múltban van).
  display_status?: "active" | "cancelled" | "expired";
  // Csak törölt hirdetéseknél töltődik ki: a törlés pillanatában aktív
  // foglalásokban lefoglalt helyek összesített száma — mivel törléskor az
  // érintett foglalások "listing_cancelled" állapotba kerülnek, és emiatt a
  // seats_booked (csak aktív foglalásokból számított) mező ezután 0-t
  // mutatna. A funkció bevezetése előtt törölt hirdetéseknél null (KAN-37).
  cancelled_seats_snapshot?: number | null;
  // A célállomáshoz (to_city) tartozó, AI-kereséssel talált és cache-elt
  // fotó — célállomásonként közös, nem hirdetésenkénti adat (KAN-39, spec
  // 2.5/4.26). Amíg nincs "ready" állapotú, kész találat, a kliens a
  // statikus src/assets/ride-placeholder.jpg-t jeleníti meg helyette.
  destination_photo_url?: string | null;
  destination_photo_status?: "pending" | "ready" | "failed" | null;
}

export interface Passenger {
  booking_id: string;
  listing_id: string;
  seats_booked: number;
  booking_status: "active" | "cancelled" | "listing_cancelled";
  // "removed" = a sofőr törölte a teljes hirdetést ("Törölt"), szemben a
  // "cancelled"-del, amikor maga az utas mondta le a foglalását ("Lemondva").
  display_status: "active" | "cancelled" | "expired" | "removed";
  created_at: string;
  from_city: string;
  to_city: string;
  ride_date: string;
  ride_time: string;
  passenger_id: string;
  passenger_username: string;
  passenger_full_name: string | null;
  passenger_phone: string | null;
  passenger_email: string | null;
  is_new: boolean;
}

export interface MyBooking {
  booking_id: string;
  seats_booked: number;
  booking_status: "active" | "cancelled" | "listing_cancelled";
  // "removed" = a sofőr törölte a teljes hirdetést ("Törölt"), szemben a
  // "cancelled"-del, amikor maga az utas mondta le a foglalását ("Lemondva").
  display_status: "active" | "cancelled" | "expired" | "removed";
  listing_id: string;
  from_city: string;
  to_city: string;
  ride_date: string;
  ride_time: string;
  price_huf: number;
  car_type: string;
  car_color: string | null;
  car_plate: string | null;
  driver_id: string;
  driver_username: string;
  driver_full_name: string | null;
  driver_phone: string | null;
  driver_email: string | null;
  seats_total: number;
  seats_available: number;
  created_at: string;
}

function friendlyError(error: { message: string } | null): never | void {
  if (!error) return;
  const m = error.message;
  if (m.includes("vehicles_plate_format")) {
    throw new Error("A rendszám legfeljebb 10 karakter lehet, és csak betűt, számot, szóközt vagy kötőjelet tartalmazhat (ékezet nélkül).");
  }
  if (m.includes("vehicles_type_len")) throw new Error("A jármű típusa legalább 2 karakter legyen.");
  if (m.includes("violates check constraint") || m.includes("duplicate key")) {
    throw new Error("Érvénytelen adat. Ellenőrizd a megadott mezőket.");
  }
  throw new Error(m);
}

// ============================================================
// Auth (KAN-2)
// ============================================================

export async function signUp(params: {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone: string;
}) {
  const email = params.email.trim();
  const { password } = params;
  const username = params.username.trim();
  const fullName = params.fullName.trim();
  const phone = params.phone.trim();

  // CAR-48: foglalt felhasználónév (kis/nagybetűtől függetlenül) — olvasható
  // hibaüzenet a regisztráció elküldése előtt.
  const { data: available, error: availError } = await supabase.rpc("username_available", { p_username: username });
  if (availError) throw new Error("Váratlan hiba történt. Kérjük, próbáld újra később.");
  if (available === false) throw new Error("Ez a felhasználónév már foglalt.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName, phone },
      // A megerősítő e-mail mindig a tényleges böngésző-címre irányítson
      // vissza (helyi fejlesztés, Vercel preview vagy éles URL), ne a
      // Supabase Auth statikus "Site URL" beállítására.
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  // CAR-44: már regisztrált e-mail címnél a Supabase (felhasználó-felderítés
  // elleni védelemként) nem ad hibát, csak üres identities listát ad vissza.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error("Ezzel az e-mail címmel már létezik fiók. Jelentkezz be.");
  }
  return data;
}

// CAR-58: elfelejtett jelszó — a válasz szándékosan semleges, nem árulja el,
// létezik-e fiók az adott címmel.
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("rate limit") || m.includes("security purposes") || m.includes("too many")) {
      throw new Error(friendlyAuthError(error.message));
    }
  }
}

// CAR-58: új jelszó beállítása a helyreállító linkről érkezve (a munkamenetet
// az App.tsx állítja be a link tokenjeiből), majd kijelentkeztetés.
export async function setNewPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(friendlyAuthError(error.message));
  await supabase.auth.signOut().catch(() => {});
}

export async function usernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("username_available", { p_username: username.trim() });
  if (error) throw new Error("Váratlan hiba történt. Kérjük, próbáld újra később.");
  return data !== false;
}

// Bejelentkezés felhasználónévvel VAGY e-mail címmel.
// Felhasználónév esetén a feloldás és a bejelentkezés szerver oldalon, a
// sign-in-with-username Edge Function-ben történik, így a felhasználónévhez
// tartozó e-mail-cím soha nem jut el a böngészőbe.
export async function signInWithIdentifier(rawIdentifier: string, password: string) {
  const identifier = rawIdentifier.trim();
  if (identifier.includes("@")) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password });
    if (error) throw new Error("Hibás felhasználónév/e-mail vagy jelszó.");
    return data;
  }

  const { data: tokens, error: fnError } = await supabase.functions.invoke("sign-in-with-username", {
    body: { username: identifier, password },
  });
  if (fnError) {
    let message = "Hibás felhasználónév/e-mail vagy jelszó.";
    const ctx = (fnError as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      const payload = await ctx.json().catch(() => null);
      if (payload?.error) message = payload.error;
    }
    throw new Error(message);
  }
  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
  if (error) throw new Error("Hibás felhasználónév/e-mail vagy jelszó.");
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  friendlyError(error);
}

export async function resendConfirmationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  friendlyError(error);
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, phone")
    .eq("id", userData.user.id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMyProfile(patch: { full_name?: string; username?: string; phone?: string }) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Nincs bejelentkezve.");
  const trimmed = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
  );
  if (trimmed.username) {
    const { data: own } = await supabase.from("profiles").select("username").eq("id", userData.user.id).single();
    if (!own || own.username.toLowerCase() !== String(trimmed.username).toLowerCase()) {
      if (!(await usernameAvailable(String(trimmed.username)))) throw new Error("Ez a felhasználónév már foglalt.");
    }
  }
  const { error } = await supabase.from("profiles").update(trimmed).eq("id", userData.user.id);
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email;
  if (!email) throw new Error("Nincs bejelentkezve.");

  // A jelenlegi jelszó ellenőrzése újra-bejelentkezéssel.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (verifyError) throw new Error("A jelenlegi jelszó nem megfelelő.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  friendlyError(error);
}

// ============================================================
// Járművek (KAN-3)
// ============================================================

export async function listMyVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("my_vehicles")
    .select("id, type, plate, seats, color, has_active_listing")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addVehicle(v: { type: string; plate: string; seats: number; color?: string }) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Nincs bejelentkezve.");
  const { error } = await supabase.from("vehicles").insert({
    owner_id: userData.user.id,
    type: v.type.trim(),
    plate: v.plate.trim().toUpperCase(),
    seats: v.seats,
    color: v.color?.trim() || null,
  });
  friendlyError(error);
}

// Jármű törlése — aktív hirdetés esetén a szerveroldali RPC elutasítja
// (item 5, 2. kör).
export async function removeVehicle(id: string) {
  const { error } = await supabase.rpc("remove_vehicle", { p_vehicle_id: id });
  friendlyError(error);
}

export async function updateVehicle(v: { id: string; type: string; plate: string; seats: number; color?: string }) {
  const { error } = await supabase.rpc("update_vehicle", {
    p_vehicle_id: v.id,
    p_type: v.type.trim(),
    p_plate: v.plate.trim().toUpperCase(),
    p_seats: v.seats,
    p_color: v.color?.trim() || null,
  });
  friendlyError(error);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const { data, error } = await supabase.from("vehicles").select("id, type, plate, seats, color").eq("id", id).single();
  if (error) return null;
  return data;
}

// ============================================================
// Hirdetések keresése / részletek (KAN-4, KAN-5)
// ============================================================

export async function listAvailableRides(filters: {
  from?: string;
  to?: string;
  // CAR-46: "-tól" / "-ig" (YYYY-MM-DD, budapesti naptári nap, mindkét vég
  // zárt: -tól 0:00-tól, -ig 23:59:59-ig). Az elindult utak mindig rejtve.
  dateFrom?: string;
  dateTo?: string;
  minSeats?: number;
}): Promise<RideDetails[]> {
  let query = supabase
    .from("ride_details")
    .select("*")
    .eq("status", "active")
    // A departs_at a szerveren, Europe/Budapest időzóna szerint (DST-t is
    // helyesen kezelve) számolt UTC időbélyeg — ezért közvetlenül
    // hasonlítható a kliens "most" időpontjával, dátum-only hiba nélkül,
    // és nem számít, milyen időzónában fut a böngésző.
    .gte("departs_at", new Date().toISOString())
    .order("ride_date", { ascending: true });

  // CAR-54: szóközvágás + ékezet- és kisbetű-független keresés a
  // normalizált oszlopokon. A % és _ joker karaktereket kiszűrjük.
  const from = filters.from ? normalizeSearch(filters.from).replace(/[%_]/g, "") : "";
  const to = filters.to ? normalizeSearch(filters.to).replace(/[%_]/g, "") : "";
  if (from) query = query.ilike("from_city_norm", `%${from}%`);
  if (to) query = query.ilike("to_city_norm", `%${to}%`);
  if (filters.dateFrom) query = query.gte("ride_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("ride_date", filters.dateTo);
  if (filters.minSeats) query = query.gte("seats_available", filters.minSeats);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).filter((r) => r.seats_available > 0);
}

export async function getRideDetails(id: string): Promise<RideDetails | null> {
  const { data, error } = await supabase.from("ride_details").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createListing(params: {
  vehicleId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seats: number;
}) {
  const { error } = await supabase.rpc("create_listing", {
    p_vehicle_id: params.vehicleId,
    p_from_city: params.from,
    p_to_city: params.to,
    p_ride_date: params.date,
    p_ride_time: params.time,
    p_price_huf: params.price,
    p_seats_total: params.seats,
  });
  friendlyError(error);
}

export async function updateListing(params: {
  listingId: string;
  price: number;
  seats: number;
  date: string;
  time: string;
}) {
  const { error } = await supabase.rpc("update_listing", {
    p_listing_id: params.listingId,
    p_price_huf: params.price,
    p_seats_total: params.seats,
    p_ride_date: params.date,
    p_ride_time: params.time,
  });
  friendlyError(error);
}

export async function cancelListing(listingId: string) {
  const { error } = await supabase.rpc("cancel_listing", { p_listing_id: listingId });
  friendlyError(error);
}

export async function listMyListings(): Promise<RideDetails[]> {
  const { data, error } = await supabase.from("my_listings").select("*").order("ride_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ============================================================
// Foglalások (KAN-6, KAN-7, KAN-8)
// ============================================================

export async function bookRide(listingId: string, seats: number): Promise<string> {
  const { data, error } = await supabase.rpc("book_ride", { p_listing_id: listingId, p_seats: seats });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
  friendlyError(error);
}

// Utas módosítja a saját foglalásának helyszámát (a hirdetés aktuális
// szabad kapacitásáig). 0-ra vagy az alá csökkenteni nem lehet ezzel —
// ahhoz a cancelBooking() használandó.
export async function updateBooking(bookingId: string, seats: number) {
  const { error } = await supabase.rpc("update_booking", { p_booking_id: bookingId, p_seats: seats });
  friendlyError(error);
}

export async function listMyBookings(): Promise<MyBooking[]> {
  const { data, error } = await supabase.from("my_bookings").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ============================================================
// Utasaim (KAN-13)
// ============================================================

export async function listMyPassengers(listingId?: string): Promise<Passenger[]> {
  // Legfrissebb foglalás legfelül (kategóriánként a frontend csoportosít).
  let query = supabase.from("my_passengers").select("*").order("created_at", { ascending: false });
  if (listingId) query = query.eq("listing_id", listingId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markPassengersViewed() {
  const { error } = await supabase.rpc("mark_passengers_viewed");
  friendlyError(error);
}

export async function countNewPassengers(): Promise<number> {
  const { data, error } = await supabase.rpc("count_new_passengers");
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}

// Célállomás-fotó önjavítás (KAN-39, spec 4.26): a RidePhoto komponens ezt
// hívja, ha egy már cache-elt kép linkje törötten töltődik be. Szándékosan
// "fire-and-forget" — a hívó nem vár rá és nem blokkol miatta, a tényleges
// újrakeresés a háttérben, a felület megjelenítését nem lassítva fut le (a
// kliens időközben a statikus ride-placeholder.jpg-t mutatja).
export function requestDestinationPhotoReheal(destination: string) {
  supabase.rpc("request_destination_photo_reheal", { p_destination: destination }).then(({ error }) => {
    if (error) console.error("Célállomás-fotó önjavítás sikertelen:", error.message);
  });
}
