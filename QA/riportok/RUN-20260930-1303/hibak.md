# Hibajegyzék — RUN-20260930-1303

Környezet: https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)

Összesen 18 hiba: Kritikus 1, Magas 3, Közepes 7, Alacsony 7. Jira-jegy még nem készült (jóváhagyásra vár).

| ID | Cím | Súlyosság | Prioritás | Modul | Teszteset | Állapot |
|---|---|---|---|---|---|---|
| BUG-01 | Bejelentkezés nélkül bármely felhasználó e-mail címe lekérdezhető (email_for_username + ride_details) | Kritikus | P1 | JOG | JOG-006, JOG-009 | Nyitott |
| BUG-07 | Elindult út után is lemondható a foglalás, törölhető és módosítható a hirdetés | Magas | P1 | LEMOND | LEMOND-006, HIRD-020 | Nyitott |
| BUG-09 | Mobilon (érintőképernyő) a felhasználói menü nem nyitható — Foglalásaim, Járműveim, Kijelentkezés elérhetetlen | Magas | P1 | UI | UI-007 | Nyitott |
| BUG-08 | Lemondott/törölt foglalás után az API továbbra is kiadja a sofőr telefonszámát és e-mail címét | Magas | P2 | KONT | KONT-008 | Nyitott |
| BUG-16 | Már regisztrált e-mail címmel a regisztráció hibaüzenet helyett látszólagos sikert mutat | Közepes | P1 | AUTH | AUTH-006 | Nyitott |
| BUG-02 | A jármű zárolva marad, ha csak már elindult (lejárt) hirdetései vannak | Közepes | P2 | JARMU | JARMU-010 | Nyitott |
| BUG-05 | A kereső csak egy napra szűr, időszakra (kezdő–végső nap) nem | Közepes | P2 | KERES | KERES-005 | Nyitott |
| BUG-11 | Törölt hirdetésen további állapotváltások lehetségesek (Törölt→Lemondva, ismételt törlés, szerkesztés) | Közepes | P2 | LEMOND | felderítő (LEMOND-004 kapcsán) | Nyitott |
| BUG-13 | A felhasználónév egyedisége kis/nagybetű-érzékeny; foglalt névre nyers angol 500-as hiba | Közepes | P2 | AUTH | AUTH-005 | Nyitott |
| BUG-14 | Regisztráció és bejelentkezés: nincs trimmelés és formátum-ellenőrzés | Közepes | P2 | AUTH | AUTH-007, AUTH-008, AUTH-013 | Nyitott |
| BUG-15 | A bejelentkezési hibaüzenet elárulja, hogy a felhasználónév létezik-e | Közepes | P2 | AUTH | AUTH-012 | Nyitott |
| BUG-17 | A regisztráció-megerősítő levél angol, Supabase-arculatú | Alacsony | P2 | EMAIL | EMAIL-003 | Nyitott |
| BUG-03 | Csak szóközből álló járműtípus elfogadva; API-n üres típus és rendszám is beszúrható | Alacsony | P3 | JARMU | JARMU-004 | Nyitott |
| BUG-04 | Hirdetés létrehozásakor a helyek száma nincs előtöltve a jármű férőhelyével | Alacsony | P3 | HIRD | HIRD-001 | Nyitott |
| BUG-06 | A kereső nem vágja le a vezető/záró szóközt | Alacsony | P3 | KERES | KERES-009 | Nyitott |
| BUG-10 | Utasaim: nincs „friss” jelölés; a szűrt nézet aktív soraiból hiányzik a dátum/idő; az adatlapon nincs Utasaim link | Alacsony | P3 | LISTA | LISTA-006, LISTA-004 | Nyitott |
| BUG-12 | Foglalás után a részletoldal nem mutatja a sofőr telefonszámát és e-mail címét, holott a szöveg ezt ígéri | Alacsony | P3 | KONT | felderítő (FOGL-018 kapcsán) | Nyitott |
| BUG-18 | Régi adat: hirdetés helyszáma nagyobb a jármű férőhelyénél; nincs adatbázis-szintű védelem | Alacsony | P3 | ADAT | ADAT-002 | Nyitott |

## BUG-01 — [JOG] Bejelentkezés nélkül bármely felhasználó e-mail címe lekérdezhető (email_for_username + ride_details)
- **Súlyosság:** Kritikus · **Prioritás:** P1 · **Teszteset:** TC-JOG-006, TC-JOG-009 · **Forrás:** spec 4.6/4.7 (kontaktadatok csak foglalás után), KAN-7
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** anonim (publishable kulccsal), nincs bejelentkezés
- **Lépések a reprodukáláshoz:**
  1. Anonim munkamenettel hívd: POST /rest/v1/rpc/email_for_username {"p_username":"jkovesi"}.
  2. Anonim munkamenettel kérdezd le: GET /rest/v1/ride_details?select=driver_username.
  3. Az így kapott összes felhasználónévre ismételd az 1. lépést.
- **Elvárt eredmény:** Anonim (és nem érintett) felhasználó semmilyen módon nem kaphatja meg más e-mail címét; a kontaktadat csak aktív foglalási kapcsolatban látható.
- **Tényleges eredmény:** Az RPC HTTP 200-zal visszaadja a felhasználó e-mail címét (jfkovesi@gmail.com); a ride_details anonim módon is listázza az összes hirdetés sofőrjének felhasználónevét. A kettő együtt tömeges e-mail-cím-gyűjtést tesz lehetővé. A Supabase security advisor is jelzi (anon_security_definer_function_executable).
- **Reprodukálhatóság:** 3/3
- **Bizonyíték:** HTTP-válasz (JOG-006), get_advisors kimenet (JOG-009)
- **Megjegyzés / feltételezett ok:** Feltehetően a bejelentkezés felhasználónév→e-mail feloldásához készült SECURITY DEFINER függvény, anon EXECUTE joggal. Javaslat: a bejelentkezést szerveroldalon (Edge Function) oldani fel úgy, hogy az e-mail ne kerüljön vissza a kliensre; az anon EXECUTE jogot visszavonni.
- **Gyökérok-kategória (feltételezett):** Jogosultság (RLS)

## BUG-07 — [LEMOND] Elindult út után is lemondható a foglalás, törölhető és módosítható a hirdetés
- **Súlyosság:** Magas · **Prioritás:** P1 · **Teszteset:** TC-LEMOND-006, TC-HIRD-020 · **Forrás:** SQ-7/9 (szigorú), spec 4.5, 4.11, 4.12
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S (sofőr), U1 (utas) — H-LEJAR (indulás 2026-09-30 14:10)
- **Lépések a reprodukáláshoz:**
  1. Az indulás időpontja után U1 nevében hívd a cancel_booking-ot a H-LEJAR foglalására.
  2. S nevében hívd a cancel_listing-et H-LEJAR-ra.
  3. S nevében hívd az update_listing-et más helyszámmal (3→2).
  4. Ugyanazon a napon, indulás után U1 nevében hívd az update_booking-ot.
- **Elvárt eredmény:** Az indulás időpontja (dátum + idő, Europe/Budapest) után a foglalás és a hirdetés nem mondható le, nem törölhető és nem módosítható (SQ-7/9 szigorú döntés).
- **Tényleges eredmény:** Mind a négy hívás sikeres (visszagörgetett tranzakcióban igazolva). Az update_booking csak a dátumot vizsgálja, az időt nem.
- **Reprodukálhatóság:** 2/2
- **Bizonyíték:** SQL-harness eredmények (LEMOND-006, HIRD-020)
- **Megjegyzés / feltételezett ok:** Az RPC-k a status='active' állapotot és/vagy csak a ride_date-et ellenőrzik, a ride_date+ride_time indulási időpontot nem.
- **Gyökérok-kategória (feltételezett):** Implementációs hiba

## BUG-09 — [UI] Mobilon (érintőképernyő) a felhasználói menü nem nyitható — Foglalásaim, Járműveim, Kijelentkezés elérhetetlen
- **Súlyosság:** Magas · **Prioritás:** P1 · **Teszteset:** TC-UI-007 · **Forrás:** spec (reszponzív felület), KAN-27
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** bármely bejelentkezett felhasználó, 390×844 mobil nézet
- **Lépések a reprodukáláshoz:**
  1. Nyisd meg az oldalt telefonon (vagy érintéses emulációval), jelentkezz be.
  2. Koppints a jobb felső hamburger/profil ikonra.
- **Elvárt eredmény:** Megnyílik a menü (Profilom, Járműveim, Foglalásaim, Hirdetéseim, Utasaim, Kijelentkezés).
- **Tényleges eredmény:** Nem nyílik meg semmi; a menüpontok mobilon semmilyen módon nem érhetők el, kijelentkezni sem lehet.
- **Reprodukálhatóság:** 3/3
- **Bizonyíték:** CSS-szabály: .group-hover\:block @media (hover:hover) alatt; matchMedia('(hover:hover)')=false
- **Megjegyzés / feltételezett ok:** A menü kizárólag CSS group-hoverrel nyílik; Tailwind v4 ezt (hover:hover) média-lekérdezésbe teszi, így érintőképernyőn soha nem aktiválódik. Javaslat: kattintásra nyíló (állapotvezérelt) menü.
- **Gyökérok-kategória (feltételezett):** Implementációs hiba (UI)

## BUG-08 — [KONT] Lemondott/törölt foglalás után az API továbbra is kiadja a sofőr telefonszámát és e-mail címét
- **Súlyosság:** Magas · **Prioritás:** P2 · **Teszteset:** TC-KONT-008 · **Forrás:** SQ-7 (szigorú), spec 4.6
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** U1, lemondott foglalással
- **Lépések a reprodukáláshoz:**
  1. U1 lemond egy foglalást.
  2. U1 munkamenetével kérdezd le a my_bookings nézetet.
- **Elvárt eredmény:** Lemondás vagy törlés után a volt utas nem látja a rendszámot és a kontaktadatokat — a felületen és az API-ban sem.
- **Tényleges eredmény:** A felület helyesen elrejti, de a my_bookings nézet a lemondott és törölt foglalásoknál is visszaadja a driver_phone és driver_email mezőt.
- **Reprodukálhatóság:** 2/2
- **Bizonyíték:** my_bookings lekérdezés (KONT-008)
- **Megjegyzés / feltételezett ok:** A nézet nem szűri a kontaktmezőket a foglalás állapota szerint; a rejtés csak kliensoldali.
- **Gyökérok-kategória (feltételezett):** Jogosultság (RLS) / csak kliensoldali rejtés

## BUG-16 — [AUTH] Már regisztrált e-mail címmel a regisztráció hibaüzenet helyett látszólagos sikert mutat
- **Súlyosság:** Közepes · **Prioritás:** P1 · **Teszteset:** TC-AUTH-006 · **Forrás:** SQ-12 (felhasználói döntés), spec 4.1
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** vendég; U1 e-mail címe (omeckl@yahoo.com)
- **Lépések a reprodukáláshoz:**
  1. Regisztrálj U1 e-mail címével, új felhasználónévvel, minden más mező érvényes, hozzájárulással.
- **Elvárt eredmény:** Egyértelmű hibaüzenet: ezzel az e-mail címmel már létezik regisztráció.
- **Tényleges eredmény:** „Erősítsd meg az e-mail címed! Elküldtük a megerősítő linket…” — valójában nem jön létre fiók és nem megy levél. U1 fiókja változatlan.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** signup-válasz: 200, identities: [] (AUTH-006)
- **Megjegyzés / feltételezett ok:** Bekapcsolt e-mail-megerősítésnél a Supabase felsorolás-védelem miatt álcázott választ ad; a kód nem vizsgálja az üres identities tömböt. Megjegyzés: a javítás ütközik a felsorolás elleni védelemmel (lásd BUG-15) — tudatos döntés kell.
- **Gyökérok-kategória (feltételezett):** Implementációs hiba / spec-döntés

## BUG-02 — [JARMU] A jármű zárolva marad, ha csak már elindult (lejárt) hirdetései vannak
- **Súlyosság:** Közepes · **Prioritás:** P2 · **Teszteset:** TC-JARMU-010 · **Forrás:** KAN-28, spec 4.13
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S; Toyota Prius Plus és Opel Corsa (csak lejárt hirdetésekkel)
- **Lépések a reprodukáláshoz:**
  1. S-ként nyisd meg a Járműveim oldalt.
- **Elvárt eredmény:** Zárolás csak akkor, ha a járműhöz aktív, még el nem indult hirdetés tartozik.
- **Tényleges eredmény:** Mindkét jármű „aktív hirdetésen szerepel, nem szerkeszthető és nem törölhető”, pedig minden hirdetésük elindult.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** SQL: 10 lejárt, status='active' hirdetés a két járművön
- **Megjegyzés / feltételezett ok:** A zárolás a listings.status='active' mezőt nézi, nem az indulási időpontot (a lejárat nem állít státuszt).
- **Gyökérok-kategória (feltételezett):** Implementációs hiba

## BUG-05 — [KERES] A kereső csak egy napra szűr, időszakra (kezdő–végső nap) nem
- **Súlyosság:** Közepes · **Prioritás:** P2 · **Teszteset:** TC-KERES-005 · **Forrás:** spec 4.8
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** bármely felhasználó
- **Lépések a reprodukáláshoz:**
  1. A főoldali keresőben próbálj dátumtartományt megadni.
- **Elvárt eredmény:** Szűrés időszakra (spec 4.8).
- **Tényleges eredmény:** Csak egyetlen „MIKOR” dátum adható meg; az napra pontosan szűr.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** KERES-005
- **Megjegyzés / feltételezett ok:** Nem implementált funkció vagy elavult spec.
- **Gyökérok-kategória (feltételezett):** Spec-eltérés

## BUG-11 — [LEMOND] Törölt hirdetésen további állapotváltások lehetségesek (Törölt→Lemondva, ismételt törlés, szerkesztés)
- **Súlyosság:** Közepes · **Prioritás:** P2 · **Teszteset:** felderítő (TC-LEMOND-004 kapcsán) · **Forrás:** spec 4.12, 4.21, 4.25
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S, U1 — H-TOROL (visszagörgetett tranzakcióban)
- **Lépések a reprodukáláshoz:**
  1. S törli a hirdetést (cancel_listing).
  2. U1 hívja a cancel_booking-ot a már „Törölt” foglalására.
  3. S ismét hívja a cancel_listing-et.
  4. S hívja az update_listing-et a törölt hirdetésre.
- **Elvárt eredmény:** Törölt hirdetés és „Törölt” foglalás végállapot: minden további módosítás elutasítva, új értesítés nem megy.
- **Tényleges eredmény:** (2) sikeres: a foglalás „Lemondva” lesz és új booking_cancelled értesítés kerül sorba; (3) sikeres, a foglaltság-pillanatképet 0-ra írja; (4) sikeres. (update_booking és book_ride helyesen elutasítva.)
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** SQL-harness (naplo.md, S blokk)
- **Megjegyzés / feltételezett ok:** Az RPC-k nem ellenőrzik a végállapotot.
- **Gyökérok-kategória (feltételezett):** Implementációs hiba (állapotgép)

## BUG-13 — [AUTH] A felhasználónév egyedisége kis/nagybetű-érzékeny; foglalt névre nyers angol 500-as hiba
- **Súlyosság:** Közepes · **Prioritás:** P2 · **Teszteset:** TC-AUTH-005 · **Forrás:** spec 4.1
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** vendég
- **Lépések a reprodukáláshoz:**
  1. Regisztrálj „jkovesi” felhasználónévvel.
  2. Regisztrálj „JKovesi” felhasználónévvel.
- **Elvárt eredmény:** Mindkét esetben magyar hibaüzenet: a felhasználónév foglalt.
- **Tényleges eredmény:** (1) „Database error saving new user” (HTTP 500, angol); (2) a regisztráció sikerült, megtévesztően hasonló nevű fiók jött létre (a futás során törölve).
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** signup-válaszok, profiles_username_key btree(username)
- **Megjegyzés / feltételezett ok:** Case-sensitive UNIQUE index; a hibaüzenet-leképezés csak 'username'+'duplicate/unique' szövegre ad magyar üzenetet. Javaslat: UNIQUE index lower(username)-re, citext; a bejelentkezés is kisbetűsítve keressen.
- **Gyökérok-kategória (feltételezett):** Adatintegritás / szöveg

## BUG-14 — [AUTH] Regisztráció és bejelentkezés: nincs trimmelés és formátum-ellenőrzés
- **Súlyosság:** Közepes · **Prioritás:** P2 · **Teszteset:** TC-AUTH-007, TC-AUTH-008, TC-AUTH-013 · **Forrás:** spec 4.1
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** vendég
- **Lépések a reprodukáláshoz:**
  1. Regisztrációs űrlap: Teljes név / Felhasználónév / Telefonszám = csak szóközök.
  2. Telefonszám: „abc”, „123”.
  3. Bejelentkezés: vezető/záró szóközös e-mail cím, jó jelszóval.
- **Elvárt eredmény:** Csak szóközös és formátumhibás érték elutasítva, érthető üzenettel; a vezető/záró szóköz levágva.
- **Tényleges eredmény:** A csak szóközös név/felhasználónév/telefon és bármilyen telefonszám átmegy (sem kliens, sem adatbázis nem ellenőriz); szóközös e-maillel a bejelentkezés sikertelen.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** validity-vizsgálat + regisztrációs kód (AUTH-007/008), hálózati napló (AUTH-013)
- **Megjegyzés / feltételezett ok:** Csak böngészős required/type=email validáció; nincs trim, pattern, CHECK constraint.
- **Gyökérok-kategória (feltételezett):** Csak kliensoldali validáció

## BUG-15 — [AUTH] A bejelentkezési hibaüzenet elárulja, hogy a felhasználónév létezik-e
- **Súlyosság:** Közepes · **Prioritás:** P2 · **Teszteset:** TC-AUTH-012 · **Forrás:** biztonsági alapelvárás (OWASP felhasználó-felsorolás)
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** vendég
- **Lépések a reprodukáláshoz:**
  1. Bejelentkezés létező névvel és rossz jelszóval.
  2. Bejelentkezés nem létező névvel.
- **Elvárt eredmény:** Mindkét esetben azonos üzenet.
- **Tényleges eredmény:** „Hibás felhasználónév/e-mail vagy jelszó.” vs. „Nincs ilyen felhasználónévvel regisztrált fiók.”
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** hálózati napló (AUTH-012)
- **Megjegyzés / feltételezett ok:** A kliens az email_for_username null válaszára külön üzenetet ad. Összefügg BUG-01-gyel.
- **Gyökérok-kategória (feltételezett):** Jogosultság / szöveg

## BUG-17 — [EMAIL] A regisztráció-megerősítő levél angol, Supabase-arculatú
- **Súlyosság:** Alacsony · **Prioritás:** P2 · **Teszteset:** TC-EMAIL-003 · **Forrás:** spec 4.15
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** vendég (regisztráció)
- **Lépések a reprodukáláshoz:**
  1. Regisztrálj, nyisd meg a megerősítő levelet.
- **Elvárt eredmény:** Magyar, Telekocsi-azonosítású levél.
- **Tényleges eredmény:** Feladó „Supabase Auth <noreply@mail.app.supabase.io>”, angol szöveg, „powered by Supabase” lábléc.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** bizonyitekok/EMAIL_supabase_regisztracio_megerosito.png
- **Megjegyzés / feltételezett ok:** A Supabase Auth e-mail-sablonjai és a feladó (egyéni SMTP) nincsenek beállítva. Ez a beépített levélküldő óránkénti korlátját is megszüntetné.
- **Gyökérok-kategória (feltételezett):** Környezet / konfiguráció

## BUG-03 — [JARMU] Csak szóközből álló járműtípus elfogadva; API-n üres típus és rendszám is beszúrható
- **Súlyosság:** Alacsony · **Prioritás:** P3 · **Teszteset:** TC-JARMU-004 · **Forrás:** spec 4.2
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S
- **Lépések a reprodukáláshoz:**
  1. Jármű felvétele típusként '   ' értékkel.
- **Elvárt eredmény:** Elutasítás érthető üzenettel.
- **Tényleges eredmény:** A jármű létrejön, a listában név nélkül jelenik meg.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** JARMU-004
- **Megjegyzés / feltételezett ok:** Nincs trim és CHECK constraint.
- **Gyökérok-kategória (feltételezett):** Csak kliensoldali validáció

## BUG-04 — [HIRD] Hirdetés létrehozásakor a helyek száma nincs előtöltve a jármű férőhelyével
- **Súlyosság:** Alacsony · **Prioritás:** P3 · **Teszteset:** TC-HIRD-001 · **Forrás:** spec 4.2
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S
- **Lépések a reprodukáláshoz:**
  1. Új hirdetés, jármű kiválasztása.
- **Elvárt eredmény:** A „Maximális szabad helyek” mező a jármű férőhelyével előtöltve.
- **Tényleges eredmény:** A mező üres (csak placeholder), kitöltés nélkül a mentés megáll.
- **Reprodukálhatóság:** 2/2
- **Bizonyíték:** HIRD-001
- **Megjegyzés / feltételezett ok:** —
- **Gyökérok-kategória (feltételezett):** Implementációs hiba (UI)

## BUG-06 — [KERES] A kereső nem vágja le a vezető/záró szóközt
- **Súlyosság:** Alacsony · **Prioritás:** P3 · **Teszteset:** TC-KERES-009 · **Forrás:** spec 4.8
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** bármely
- **Lépések a reprodukáláshoz:**
  1. Keresés ' Debrecen ' értékkel.
- **Elvárt eredmény:** Találat, mint 'Debrecen'-re.
- **Tényleges eredmény:** 0 találat.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** KERES-009
- **Megjegyzés / feltételezett ok:** ilike szűrés trim nélkül.
- **Gyökérok-kategória (feltételezett):** Implementációs hiba

## BUG-10 — [LISTA] Utasaim: nincs „friss” jelölés; a szűrt nézet aktív soraiból hiányzik a dátum/idő; az adatlapon nincs Utasaim link
- **Súlyosság:** Alacsony · **Prioritás:** P3 · **Teszteset:** TC-LISTA-006, TC-LISTA-004 · **Forrás:** KAN-13, spec 4.16, 4.22
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S
- **Lépések a reprodukáláshoz:**
  1. Új foglalás után nyisd meg az Utasaim oldalt.
  2. Nyisd meg egy hirdetés szűrt Utasaim nézetét.
  3. Nyisd meg egy foglalt hirdetés adatlapját.
- **Elvárt eredmény:** Friss jelölés az új foglaláson; minden sorban dátum+idő; „Utasaim” link az adatlapon.
- **Tényleges eredmény:** Friss jelölés nincs (a badge viszont működik); a szűrt nézet aktív soraiban nincs dátum/idő; a link csak a Hirdetéseim kártyán van.
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** LISTA-004, LISTA-006
- **Megjegyzés / feltételezett ok:** A megtekintés időpontja feltehetően a lista lekérése előtt frissül, így is_new mindig hamis.
- **Gyökérok-kategória (feltételezett):** Implementációs hiba (UI)

## BUG-12 — [KONT] Foglalás után a részletoldal nem mutatja a sofőr telefonszámát és e-mail címét, holott a szöveg ezt ígéri
- **Súlyosság:** Alacsony · **Prioritás:** P3 · **Teszteset:** felderítő (TC-FOGL-018 kapcsán) · **Forrás:** spec 4.6
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** K
- **Lépések a reprodukáláshoz:**
  1. Foglalj helyet egy hirdetésre, maradj a részletoldalon.
- **Elvárt eredmény:** A „sofőr elérhetőségét fent látod” szöveg mellett a telefonszám és az e-mail cím látható.
- **Tényleges eredmény:** Csak a teljes név és a rendszám jelenik meg; a ride_details nézetben nincs telefon/e-mail mező (a Foglalásaim oldalon megjelennek).
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** FOGL-018 hálózati válasz
- **Megjegyzés / feltételezett ok:** —
- **Gyökérok-kategória (feltételezett):** Szöveg/UI

## BUG-18 — [ADAT] Régi adat: hirdetés helyszáma nagyobb a jármű férőhelyénél; nincs adatbázis-szintű védelem
- **Súlyosság:** Alacsony · **Prioritás:** P3 · **Teszteset:** TC-ADAT-002 · **Forrás:** spec 4.2, 4.13
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest)
- **Szereplő / tesztadat:** S (régi, 09-22-i, törölt hirdetés)
- **Lépések a reprodukáláshoz:**
  1. Futtasd az ADAT-002 invariáns-lekérdezést.
- **Elvárt eredmény:** Üres eredmény.
- **Tényleges eredmény:** 1 sor: seats_total=2, a jármű férőhelye 1 (a jármű kapacitását a v7-es zárolás előtt csökkentették).
- **Reprodukálhatóság:** 1/1
- **Bizonyíték:** ADAT-002 lekérdezés
- **Megjegyzés / feltételezett ok:** Nincs trigger/CHECK, amely a jármű kapacitását a hirdetésekhez kötné.
- **Gyökérok-kategória (feltételezett):** Adatintegritás

## Megfigyelések (nem hibajegy)

- Nincs „Elfelejtett jelszó” funkció a bejelentkező oldalon — a jelszó csak a Supabase dashboardról állítható vissza (a futás során K fiókot emiatt újra kellett létrehozni).
- A Supabase-hibák nyersen, angolul jelennek meg a regisztrációs űrlapon („email rate limit exceeded”, „Signups not allowed for this instance”, „Database error saving new user”).
- A Supabase beépített levélküldője óránként ~2 levelet enged — éles használatra egyéni SMTP szükséges (lásd BUG-17).
- A Mailgun sandbox-domain miatt csak jóváhagyott címzettek kapnak levelet (K: 403), és a kézbesített levelek egy része Spambe kerül.
- Security advisor: ERROR security_definer_view (ride_details, my_bookings, my_passengers — a my_* jóváhagyott, a ride_details nyilvános célú, dokumentálandó); WARN pg_net a public sémában; WARN szivárgott jelszó elleni védelem kikapcsolva.
- Az alkalmazás egyoldalas, minden nézet a „/” URL-en: nincs mélylink és böngészős előzmény-navigáció (JOG-007, AUTH-014 ezért API-n ellenőrizve).
- Hirdetéseim, törölt kártya: „· 2 foglalás volt” — az érték helyszám, a felirat foglalást ír.
- Egy régi, érvénytelen évszámú (221231) hirdetés a Hirdetéseim korábbi blokkjának élén áll.
- A szegedi célállomás-fotó egy műrepülőgép, nem a városra jellemző kép; a kártyaképek alt szövege üres (akadálymentesség).
- Ékezet nélküli keresés („Pecs”) nem talál „Pécs”-re.
