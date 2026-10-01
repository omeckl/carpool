export type Page =
  | "home"
  | "login"
  | "register"
  | "email-confirm"
  | "ride-detail"
  | "create-listing"
  | "profile"
  | "change-password"
  | "vehicles"
  | "my-listings"
  | "my-bookings"
  | "edit-listing"
  | "my-passengers"
  | "forgot-password"
  | "reset-password";

// Kontextusérzékeny "Vissza" gombok felirata: az adott oldalra mutató felirat,
// amit akkor jelenítünk meg, amikor egy másik oldalról ide navigáltunk vissza.
export const PAGE_LABELS: Record<Page, string> = {
  home: "Vissza a főoldalra",
  login: "Vissza a bejelentkezéshez",
  register: "Vissza a regisztrációhoz",
  "email-confirm": "Vissza",
  "ride-detail": "Vissza a hirdetéshez",
  "create-listing": "Vissza a hirdetés feladásához",
  profile: "Vissza a profilhoz",
  "change-password": "Vissza a jelszó módosításához",
  vehicles: "Vissza a járműveimhez",
  "my-listings": "Vissza a hirdetéseimhez",
  "my-bookings": "Vissza a foglalásaimhoz",
  "edit-listing": "Vissza a hirdetés szerkesztéséhez",
  "my-passengers": "Vissza az utasaimhoz",
  "forgot-password": "Vissza",
  "reset-password": "Vissza",
};

// A böngészőfül címe oldalanként (CAR-61).
export const PAGE_TITLES: Record<Page, string> = {
  home: "Telekocsi",
  login: "Bejelentkezés · Telekocsi",
  register: "Regisztráció · Telekocsi",
  "email-confirm": "E-mail megerősítés · Telekocsi",
  "ride-detail": "Hirdetés · Telekocsi",
  "create-listing": "Hirdetés feladása · Telekocsi",
  profile: "Profilom · Telekocsi",
  "change-password": "Jelszó módosítása · Telekocsi",
  vehicles: "Járműveim · Telekocsi",
  "my-listings": "Hirdetéseim · Telekocsi",
  "my-bookings": "Foglalásaim · Telekocsi",
  "edit-listing": "Hirdetés szerkesztése · Telekocsi",
  "my-passengers": "Utasaim · Telekocsi",
  "forgot-password": "Elfelejtett jelszó · Telekocsi",
  "reset-password": "Új jelszó · Telekocsi",
};

export interface AppState {
  currentPage: Page;
  isLoggedIn: boolean;
  navigate: (page: Page) => void;
  goBack: () => void;
  login: () => void;
  logout: () => void;
}
