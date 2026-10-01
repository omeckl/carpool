# Futásnapló — RUN-20260930-1303

- Környezet: https://carpool-tawny.vercel.app/ (éles) + Supabase yctezzkwrzncgsvzhbjk
- Kezdés: 2026-09-30 13:03 (Europe/Budapest)
- Eszköz: Claude beépített böngésző + Supabase MCP
- E-mail-számláló (végleges): 42 Mailgun-levél elküldve + 1 elutasítva (K, 403) / 80; Supabase Auth levelek külön

## Leltár (13:04) — ADAT-006 alapja
- profiles: 3 (jkovesi, omeckl, orsime) — hash kiszámítva utasaim_last_viewed_at nélkül
- vehicles: 5, listings: 25, bookings: 26 (a szereplőkhöz kötődő sorok)
- Aggregált hash: vehicles 02470a6b48bf10aa837b29ec5ac68cd0, listings 8a0fd06e65b0054672b089665acc6877, bookings 12fdd84f175b79826c4eb4a0a48e0b47

## Megfigyelések

## S blokk (15:33–15:52)
- BUG-02 megerősítve (jármű-zárolás lejárt, status='active' hirdetésekkel).
- BUG-10 (alacsony): nincs „friss” jelölés az Utasaim listán; a szűrt nézet aktív soraiból hiányzik a dátum/idő; az adatlapon nincs Utasaim link.
- BUG-11 (közepes), visszagörgetett tranzakcióban igazolva a H-TOROL-on: törölt hirdetés után (a) az utas cancel_booking-ja a listing_cancelled foglalást „cancelled”-re (Lemondva) állítja és új értesítést sorol be; (b) a cancel_listing újra hívható, a pillanatképet 0-ra írja; (c) update_listing törölt hirdetésen is sikeres. update_booking / book_ride helyesen elutasítva.
- E-mail: +2 (LISTA-006 foglalás), +3 (LEMOND-004) → kb. 41/80.

## K fiók újra-létrehozása (16:00–16:10)
- A felhasználó elfelejtette K jelszavát; a jelszó-visszaállító és az újraregisztráció a Supabase beépített levélküldőjének óránkénti korlátjába ütközött („email rate limit exceeded”).
- A felhasználó törölte a régi K fiókot (558675d9…), ideiglenesen kikapcsolta a „Confirm email” beállítást, újraregisztrált, majd visszakapcsolta. Közben rövid ideig az e-mailes regisztráció ki volt kapcsolva („Email signups are disabled” / „Signups not allowed for this instance”) — helyreállítva.
- Új K: 8daf0163-beed-40d7-9812-3f5564899c99, username Janos, full_name Kovács János, consent_accepted_at kitöltve, nincs árva sor.
- Megfigyelések: nincs „Elfelejtett jelszó” funkció a bejelentkező oldalon; a Supabase-hibaüzenetek angolul, nyersen jelennek meg a regisztrációs űrlapon.

## K blokk (16:11–16:14)
- BUG-12 (alacsony): foglalás után a részletoldal nem mutat telefonszámot/e-mailt, holott a lakat-szöveg és a sikerüzenet ezt ígéri.
- E-mail: FOGL-018 → 1 elküldött (sofőr) + 1 elutasított (K, 403). Összesen kb. 42 elküldött / 80.

## Takarítás (16:25, a felhasználó jóváhagyásával, SQL, e-mail nélkül)
- Törölve egy tranzakcióban: 12 QA foglalás (U1, U2, K), 7 QA_ hirdetés (S), 1 QA jármű (QA_Skoda Octavia / QAA-101). A DELETE-hez nincs értesítő trigger; a pg_net sor üres maradt.
- Ellenőrzés: 0 QA_ hirdetés/jármű maradt; a szereplők nem QA_ adatainak hash-e továbbra is egyezik a leltárral. A K fiók megmaradt.
- Megmaradt: destination_photo_cache 'sopron' sor (ártalmatlan cache).

## AUTH blokk (17:05–)
- A felhasználó egy kitalált jelszót írt a regisztrációs űrlapra; a többi mezőt én töltöttem és küldtem.
- AUTH-005 kis/nagybetűs változata (JKovesi) váratlanul LÉTREHOZOTT egy megerősítetlen fiókot: 35993ffe-73ea-40cf-8f27-b4be696f4e67, jfkovesi+qaneg005b@gmail.com. A futás megállítva a további, fiókot esetleg létrehozó negatív esetek előtt.
- 17:12 A véletlen fiók törölve (a felhasználó jóváhagyásával): auth.users 35993ffe… → profil (cascade) és identitás is 0 sor.
- AUTH-007/008 a felhasználó döntése szerint beküldés nélkül: csak a böngésző validációját és a regisztrációs kódot vizsgáltam (onSubmit nem validál; hibaüzenet-leképezés Oo(): csak 'username'+'duplicate/unique' és 'already registered' szövegre ad magyar üzenetet, egyéb Supabase-hiba nyersen jelenik meg).
- 17:59 AUTH-006: U1 e-mail címével beküldve (a felhasználó kitalált jelszavával) → álcázott siker, fiók nem jött létre, U1 változatlan (BUG-16).

## Zárás (18:10)
- Postafiók-ellenőrzés a felhasználó képernyőképeiből (bizonyitekok/EMAIL_*.png): KONT-001/002, EMAIL-002 sikeres; EMAIL-003 sikertelen (BUG-17).
- Végeredmény: 129 aktív teszteset, 128 futtatva, 107 sikeres, 21 sikertelen, 1 nem futtatott; 18 hiba (1 Kritikus, 3 Magas, 7 Közepes, 7 Alacsony). Javaslat: NO-GO.
- A rendszerben maradt tesztadat: K fiók (Janos), destination_photo_cache 'sopron' sor. A Supabase Auth „Confirm email” beállítást a felhasználó visszakapcsolta.
