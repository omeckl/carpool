// Közös kliensoldali ellenőrzések (CAR-49, CAR-52, CAR-62). Ugyanezeket a
// szabályokat az adatbázis is kikényszeríti (CHECK constraint-ek, trigger),
// a kliens csak olvasható, magyar hibaüzenetet ad előbb.

export const USERNAME_RULE = "3–20 karakter: betű, szám, pont, kötőjel vagy aláhúzás.";
export const PASSWORD_RULE = "Legalább 8 karakter, legyen benne betű és szám is.";

export function validateUsername(value: string): string | null {
  const v = value.trim();
  if (!/^[A-Za-z0-9_.-]{3,20}$/.test(v)) return `Érvénytelen felhasználónév. ${USERNAME_RULE}`;
  return null;
}

export function validateFullName(value: string): string | null {
  if (value.trim().length < 2) return "A teljes név legalább 2 karakter legyen.";
  return null;
}

export function validatePhone(value: string): string | null {
  const v = value.trim();
  if (!/^[0-9 +()-]+$/.test(v) || v.replace(/\D/g, "").length < 9) {
    return "Érvénytelen telefonszám. Csak számjegyet, szóközt, +, (, ) és - jelet tartalmazhat, legalább 9 számjeggyel.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 8 || !/[A-Za-zÀ-ž]/.test(value) || !/[0-9]/.test(value)) {
    return `A jelszó nem megfelelő. ${PASSWORD_RULE}`;
  }
  return null;
}

export function validateVehicle(v: { type: string; plate: string; color?: string }): string | null {
  if (v.type.trim().length < 2) return "A jármű típusa legalább 2 karakter legyen.";
  const plate = v.plate.trim().toUpperCase();
  if (plate.length === 0) return "A rendszám nem lehet üres.";
  if (!/^[A-Z0-9 -]{1,10}$/.test(plate)) {
    return "A rendszám legfeljebb 10 karakter lehet, és csak betűt, számot, szóközt vagy kötőjelet tartalmazhat (ékezet nélkül).";
  }
  return null;
}

// CAR-54: ékezet- és kisbetű-független keresés — a szerveren a ride_details
// from_city_norm / to_city_norm oszlopai ugyanígy normalizáltak.
export function normalizeSearch(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Supabase Auth / adatbázis hibák magyarítása.
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("username") && (m.includes("duplicate") || m.includes("unique"))) {
    return "Ez a felhasználónév már foglalt.";
  }
  if (m.includes("already registered") || (m.includes("email") && m.includes("exists"))) {
    return "Ezzel az e-mail címmel már létezik fiók. Jelentkezz be.";
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("at least") || m.includes("should contain") || m.includes("characters"))) {
    return `A jelszó nem megfelelő. ${PASSWORD_RULE}`;
  }
  if (m.includes("same password") || m.includes("different from the old")) {
    return "Az új jelszó nem egyezhet a korábbival.";
  }
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
    return "Túl sok próbálkozás. Kérjük, várj néhány percet, majd próbáld újra.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "Érvénytelen e-mail cím.";
  }
  if (m.includes("profiles_phone_format")) return "Érvénytelen telefonszám.";
  if (m.includes("profiles_username_format")) return `Érvénytelen felhasználónév. ${USERNAME_RULE}`;
  if (m.includes("profiles_full_name_len")) return "A teljes név legalább 2 karakter legyen.";
  // Minden egyéb, nem várt hibára általános magyar üzenet (CAR-48).
  return "Váratlan hiba történt. Kérjük, próbáld újra később.";
}
