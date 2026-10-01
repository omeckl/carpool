import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Page, PAGE_LABELS, PAGE_TITLES } from "./types";
import { supabase } from "./lib/supabase";
import { signOut } from "./lib/api";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailConfirm from "./pages/EmailConfirm";
import RideDetail from "./pages/RideDetail";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Vehicles from "./pages/Vehicles";
import MyListings from "./pages/MyListings";
import MyBookings from "./pages/MyBookings";
import EditListing from "./pages/EditListing";
import MyPassengers from "./pages/MyPassengers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

type AuthNotice = { type: "success" | "error"; message: string };

// ============================================================
// URL-alapú navigáció (CAR-61): minden oldalnak saját címe van, a böngésző
// Vissza/Előre gombja és a mélylinkek (pl. /hirdetes/<id>) is működnek.
// ============================================================

interface RouteState {
  page: Page;
  rideId: string | null;
  listingId: string | null;
  passengersListingId: string | null;
  // Az ide vezető oldalak (az alkalmazáson belüli "Vissza" gombhoz).
  stack: Page[];
}

const STATIC_PATHS: Partial<Record<Page, string>> = {
  home: "/",
  login: "/bejelentkezes",
  register: "/regisztracio",
  "email-confirm": "/email-megerosites",
  "create-listing": "/hirdetes-feladasa",
  profile: "/profil",
  "change-password": "/jelszo-modositas",
  vehicles: "/jarmuveim",
  "my-listings": "/hirdeteseim",
  "my-bookings": "/foglalasaim",
  "forgot-password": "/elfelejtett-jelszo",
  "reset-password": "/uj-jelszo",
};

function pathFor(st: RouteState): string {
  switch (st.page) {
    case "ride-detail":
      return st.rideId ? `/hirdetes/${st.rideId}` : "/";
    case "edit-listing":
      return st.listingId ? `/hirdetes/${st.listingId}/szerkesztes` : "/hirdeteseim";
    case "my-passengers":
      return st.passengersListingId ? `/utasaim/${st.passengersListingId}` : "/utasaim";
    default:
      return STATIC_PATHS[st.page] ?? "/";
  }
}

function parsePath(pathname: string): RouteState {
  const base: RouteState = { page: "home", rideId: null, listingId: null, passengersListingId: null, stack: [] };
  const path = decodeURIComponent(pathname).replace(/\/+$/, "") || "/";
  let m = path.match(/^\/hirdetes\/([^/]+)\/szerkesztes$/);
  if (m) return { ...base, page: "edit-listing", listingId: m[1] };
  m = path.match(/^\/hirdetes\/([^/]+)$/);
  if (m) return { ...base, page: "ride-detail", rideId: m[1] };
  m = path.match(/^\/utasaim(?:\/([^/]+))?$/);
  if (m) return { ...base, page: "my-passengers", passengersListingId: m[1] ?? null };
  const found = (Object.entries(STATIC_PATHS) as [Page, string][]).find(([, p]) => p === path);
  return found ? { ...base, page: found[0] } : base;
}

// Ezekre az oldalakra bejelentkezés után nem térünk vissza.
const NO_RETURN_PAGES: Page[] = ["login", "register", "email-confirm", "forgot-password", "reset-password"];

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname));
  const { page: currentPage, stack: pageStack, rideId: selectedRideId, listingId: selectedListingId, passengersListingId } = route;
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [authNotice, setAuthNotice] = useState<AuthNotice | null>(null);

  // Belépési pont: a kezdeti URL állapotát rögzítjük, a böngésző
  // Vissza/Előre gombjára pedig a mentett állapotot állítjuk vissza.
  useEffect(() => {
    window.history.replaceState(route, "", pathFor(route) + window.location.hash);
    const onPop = (e: PopStateEvent) => {
      const st = (e.state as RouteState | null) ?? parsePath(window.location.pathname);
      setRoute(st);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = PAGE_TITLES[currentPage];
  }, [currentPage]);

  const replaceRoute = (st: RouteState) => {
    window.history.replaceState(st, "", pathFor(st));
    setRoute(st);
  };

  // Email-megerősítés / jelszó-visszaállítás utáni visszairányítás kezelése
  // (KAN-2, 4.14, CAR-58): a Supabase a linkről a tokeneket URL hash-ben adja
  // vissza. Mivel a supabase.ts-ben a detectSessionInUrl ki van kapcsolva, a
  // regisztráció megerősítése SOHA nem jelentkezteti be automatikusan a
  // felhasználót. Jelszó-visszaállításnál viszont a linkből kapott
  // munkamenettel engedjük beállítani az új jelszót.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));
    const home: RouteState = { page: "home", rideId: null, listingId: null, passengersListingId: null, stack: [] };
    if (params.get("type") === "recovery") {
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      replaceRoute({ ...home, page: "reset-password" });
      if (access_token && refresh_token) {
        setRecovering(true);
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ error }) => setHasRecoverySession(!error))
          .finally(() => setRecovering(false));
      }
    } else if (hash.includes("type=signup") || hash.includes("type=email_change")) {
      setAuthNotice({ type: "success", message: "Sikeresen megerősítetted az e-mail címedet! Most már bejelentkezhetsz." });
      replaceRoute({ ...home, page: "login" });
    } else if (hash.includes("error=")) {
      const expired = hash.includes("otp_expired");
      setAuthNotice({
        type: "error",
        message: expired
          ? "A link lejárt vagy már felhasználták. Kérj újat (megerősítő levelet a regisztrációnál, jelszó-visszaállítót az „Elfelejtett jelszó?” linkkel)."
          : "Hiba történt a link feldolgozása során. Próbáld meg újra.",
      });
      replaceRoute({ ...home, page: "login" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!session;
  const currentUserId = session?.user?.id ?? null;

  const go = (page: Page, ids: Partial<Pick<RouteState, "rideId" | "listingId" | "passengersListingId">> = {}) => {
    const st: RouteState = {
      page,
      rideId: ids.rideId !== undefined ? ids.rideId : selectedRideId,
      listingId: ids.listingId !== undefined ? ids.listingId : selectedListingId,
      passengersListingId: ids.passengersListingId !== undefined ? ids.passengersListingId : passengersListingId,
      stack: [...pageStack, currentPage],
    };
    window.history.pushState(st, "", pathFor(st));
    setRoute(st);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = (page: Page) => go(page);

  // Kontextusérzékeny "Vissza": mindig oda ugrik, ahonnan a felhasználó az adott
  // oldalra navigált — nem egy rögzített szülő oldalra. Mélylinkről érkezve
  // (nincs előzmény az alkalmazáson belül) a főoldalra visz.
  const goBack = () => {
    if (pageStack.length > 0) {
      window.history.back();
    } else {
      replaceRoute({ page: "home", rideId: null, listingId: null, passengersListingId: null, stack: [] });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // A "Vissza" gomb felirata mindig azt az oldalt nevezi meg, ahová a gomb
  // ténylegesen visszavisz (KAN-1 #2).
  const backLabel = PAGE_LABELS[pageStack[pageStack.length - 1] ?? "home"];

  const selectRide = (id: string) => go("ride-detail", { rideId: id });
  const selectListingToEdit = (id: string) => go("edit-listing", { listingId: id });
  const selectListingToPassengers = (id: string) => go("my-passengers", { passengersListingId: id });
  const openAllPassengers = () => go("my-passengers", { passengersListingId: null });

  const logout = async () => {
    await signOut().catch(() => {});
    const st: RouteState = { page: "home", rideId: null, listingId: null, passengersListingId: null, stack: [] };
    window.history.pushState(st, "", "/");
    setRoute(st);
  };

  // Bejelentkezés oldalról: vissza oda, ahonnan a felhasználó jött (pl. a
  // hirdetésre, amire foglalni akart), különben a főoldalra.
  const afterLoginFromLoginPage = () => {
    const prev = pageStack[pageStack.length - 1];
    if (prev && !NO_RETURN_PAGES.includes(prev)) goBack();
    else replaceRoute({ page: "home", rideId: null, listingId: null, passengersListingId: null, stack: [] });
  };

  const afterPasswordReset = () => {
    setHasRecoverySession(false);
    setAuthNotice({ type: "success", message: "Az új jelszavad beállítva. Most már bejelentkezhetsz vele." });
    replaceRoute({ page: "login", rideId: null, listingId: null, passengersListingId: null, stack: [] });
  };

  // Védett oldal kijelentkezve: a bejelentkezés űrlap ugyanazon a címen
  // jelenik meg, sikeres bejelentkezés után a kért oldal töltődik be.
  const guardLogin = (
    <Login navigate={navigate} goBack={goBack} notice={authNotice} clearNotice={() => setAuthNotice(null)} onSuccess={() => {}} />
  );

  const authPages: Page[] = ["profile", "change-password", "vehicles", "my-listings", "my-bookings", "create-listing", "edit-listing", "my-passengers"];
  const hideNav: Page[] = [];

  if (authLoading || recovering) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#717171] text-sm">
        Betöltés…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {!hideNav.includes(currentPage) && (
        <Navbar
          currentPage={currentPage}
          isLoggedIn={isLoggedIn}
          navigate={navigate}
          logout={logout}
          openPassengers={openAllPassengers}
        />
      )}

      {currentPage === "home" && <Home navigate={navigate} selectRide={selectRide} isLoggedIn={isLoggedIn} currentUserId={currentUserId} />}
      {currentPage === "login" && (
        <Login navigate={navigate} goBack={goBack} notice={authNotice} clearNotice={() => setAuthNotice(null)} onSuccess={afterLoginFromLoginPage} />
      )}
      {currentPage === "forgot-password" && <ForgotPassword navigate={navigate} goBack={goBack} />}
      {currentPage === "reset-password" && (
        <ResetPassword navigate={navigate} hasRecoverySession={hasRecoverySession} onDone={afterPasswordReset} />
      )}
      {currentPage === "register" && <Register navigate={navigate} goBack={goBack} onRegistered={setPendingEmail} />}
      {currentPage === "email-confirm" && <EmailConfirm navigate={navigate} email={pendingEmail} />}
      {currentPage === "ride-detail" && <RideDetail navigate={navigate} goBack={goBack} isLoggedIn={isLoggedIn} rideId={selectedRideId} currentUserId={currentUserId} openPassengers={selectListingToPassengers} />}

      {currentPage === "create-listing" && (
        isLoggedIn
          ? <CreateListing navigate={navigate} goBack={goBack} backLabel={backLabel} />
          : guardLogin
      )}
      {currentPage === "profile" && (
        isLoggedIn
          ? <Profile navigate={navigate} goBack={goBack} />
          : guardLogin
      )}
      {currentPage === "change-password" && (
        isLoggedIn
          ? <ChangePassword navigate={navigate} goBack={goBack} backLabel={backLabel} />
          : guardLogin
      )}
      {currentPage === "vehicles" && (
        isLoggedIn
          ? <Vehicles navigate={navigate} goBack={goBack} backLabel={backLabel} />
          : guardLogin
      )}
      {currentPage === "my-listings" && (
        isLoggedIn
          ? (
            <MyListings
              navigate={navigate}
              goBack={goBack}
              selectListingToEdit={selectListingToEdit}
              selectListingToPassengers={selectListingToPassengers}
            />
          )
          : guardLogin
      )}
      {currentPage === "my-bookings" && (
        isLoggedIn
          ? <MyBookings navigate={navigate} goBack={goBack} backLabel={backLabel} />
          : guardLogin
      )}
      {currentPage === "edit-listing" && (
        isLoggedIn
          ? <EditListing navigate={navigate} goBack={goBack} listingId={selectedListingId} backLabel={backLabel} />
          : guardLogin
      )}
      {currentPage === "my-passengers" && (
        isLoggedIn
          ? <MyPassengers navigate={navigate} goBack={goBack} backLabel={backLabel} listingId={passengersListingId} />
          : guardLogin
      )}
    </div>
  );
}
