# Tesztriport — Telekocsi, teljes funkcionális regresszió — RUN-20260930-1303

## 1. Vezetői összefoglaló
Az éles Telekocsi-rendszeren (demó) 129 tesztesetből 128-t futtattunk: 107 sikeres, 21 sikertelen (84% sikerességi arány). A foglalási mag — foglalás, összevonás, párhuzamos foglalás, túlfoglalás elleni védelem, lemondás, hirdetéstörlés, jogosultságok és e-mail-értesítések — megbízhatóan működik, a valódi felhasználók adatai sértetlenek maradtak.
**Javaslat: NO-GO.** Egy kritikus biztonsági hiba (BUG-01: bejelentkezés nélkül bárki e-mail címe lekérdezhető) és három magas súlyosságú hiba nyitott: indulás után is lemondható/módosítható út (BUG-07), lemondás után az API még kiadja a sofőr kontaktadatait (BUG-08), és mobilon elérhetetlen a felhasználói menü (BUG-09). BUG-01 és BUG-09 javítása a kiadás feltétele; a többi Magas hiba javítása vagy tudatos elfogadása szükséges.

## 2. Hatókör és környezet
- **Hatókör:** KAN-2…KAN-38 story-k és a rendszerelemzési specifikáció v11 (Confluence 622593) összes MVP-szabálya; 129 aktív teszteset 12 modulban (2 archivált: HIRD-008, AUTH-009 — SQ-5/6 döntés).
- **Nem volt hatókörben:** 2. fázisú story-k (értékelés, adminisztráció), terheléses és biztonsági penetrációs teszt, böngésző-kompatibilitás (csak Chromium).
- **Környezet:** https://carpool-tawny.vercel.app/ + Supabase yctezzkwrzncgsvzhbjk · Claude beépített böngésző (Chromium) · 2026-09-30 (Europe/Budapest). A futás 13:03-tól 18:10-ig tartott.
- **Végrehajtási módok:** böngészős (Claude beépített böngésző), Supabase/API (SQL, a szerepkör imitálásával; negatív esetek visszagörgetett tranzakcióban), a felhasználó által kézzel végzett bejelentkezések és postafiók-ellenőrzés.
- **Tesztfelhasználók:** S = jkovesi (sofőr), U1 = omeckl, U2 = orsime (valódi fiókok, csak QA_ adatok módosultak), K = Janos (jfkovesi+qa, kívülálló; a futás közben újra létre kellett hozni).
- **Feltételezések és korlátok:**
  - A jelszavas lépéseket a felhasználó végezte.
  - Az AUTH-007/008 esetek a felhasználó döntése szerint beküldés nélkül futottak (böngésző-validáció + kódvizsgálat).
  - Az e-mail-tartalmat 3 levél képernyőképe alapján ellenőriztük.
  - E-mail-felhasználás: 42 Mailgun-levél elküldve + 1 elutasítva (keret: 80), valamint néhány Supabase Auth levél.

## 3. Eredmények összesítése
| Modul | Tervezett | Futtatott | Sikeres | Sikertelen | Blokkolt | Nem futtatott |
|---|---|---|---|---|---|---|
| AUTH | 16 | 15 | 9 | 6 | 0 | 1 |
| JARMU | 10 | 10 | 8 | 2 | 0 | 0 |
| HIRD | 20 | 20 | 18 | 2 | 0 | 0 |
| KERES | 10 | 10 | 8 | 2 | 0 | 0 |
| FOGL | 19 | 19 | 19 | 0 | 0 | 0 |
| KONT | 8 | 8 | 7 | 1 | 0 | 0 |
| LEMOND | 7 | 7 | 6 | 1 | 0 | 0 |
| LISTA | 9 | 9 | 7 | 2 | 0 | 0 |
| EMAIL | 5 | 5 | 4 | 1 | 0 | 0 |
| UI | 9 | 9 | 8 | 1 | 0 | 0 |
| JOG | 10 | 10 | 8 | 2 | 0 | 0 |
| ADAT | 6 | 6 | 5 | 1 | 0 | 0 |
| **Összesen** | **129** | **128** | **107** | **21** | **0** | **1** |

- Sikerességi arány (sikeres / futtatott): **83.6%**
- P1-lefedettség: 63/63 P1 teszteset futott (100%), ebből 7 sikertelen: AUTH-005, AUTH-006, AUTH-012, HIRD-001, KONT-008, JOG-006, ADAT-002.
- Nem futtatott: TC-AUTH-002 — a K fiók a futás előtt már meg volt erősítve, megerősítetlen állapot nem volt elérhető.

## 4. Talált hibák
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

Részletek, reprodukciós lépések és feltételezett okok: [hibak.md](hibak.md).

## 5. Nyomonkövethetőségi mátrix
| Követelmény | Tesztesetek | Eredmény | Hibák |
|---|---|---|---|
| KAN-2 | AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005, AUTH-006, AUTH-007, AUTH-008, AUTH-010, AUTH-011, AUTH-012, AUTH-014 | ❌ 5 sikertelen, 1 nem futott | BUG-13, BUG-14, BUG-15, BUG-16 |
| KAN-3 | JARMU-001, JARMU-002, JARMU-003, JARMU-004, JARMU-005, KONT-003, KONT-004, KONT-008 | ❌ 2 sikertelen | BUG-03, BUG-08 |
| KAN-4 | HIRD-001, HIRD-002, HIRD-003, HIRD-009, HIRD-011, HIRD-017 | ❌ 1 sikertelen | BUG-04 |
| KAN-5 | KERES-001, KERES-002, KERES-003, KERES-004, KERES-005, KERES-006, KERES-008, KERES-010 | ❌ 1 sikertelen | BUG-05 |
| KAN-6 | FOGL-001, FOGL-002, FOGL-003, FOGL-004, FOGL-005 | ✅ mind sikeres | — |
| KAN-7 | KONT-001, KONT-002, KONT-003, KONT-008 | ❌ 1 sikertelen | BUG-08 |
| KAN-8 | LEMOND-002, LEMOND-004, LEMOND-006 | ❌ 1 sikertelen | BUG-07 |
| KAN-9 | AUTH-016 | ✅ mind sikeres | — |
| KAN-13 | KONT-007, LISTA-003, LISTA-004, LISTA-005, LISTA-006, LISTA-007 | ❌ 2 sikertelen | BUG-10 |
| KAN-14 | HIRD-003, HIRD-004 | ✅ mind sikeres | — |
| KAN-15 | EMAIL-001 | ✅ mind sikeres | — |
| KAN-16 | EMAIL-001, EMAIL-002, EMAIL-003 | ❌ 1 sikertelen | BUG-17 |
| KAN-17 | FOGL-009, FOGL-010, FOGL-011, FOGL-012 | ✅ mind sikeres | — |
| KAN-18 | FOGL-012, LEMOND-001, LEMOND-003 | ✅ mind sikeres | — |
| KAN-19 | HIRD-005, HIRD-006 | ✅ mind sikeres | — |
| KAN-20 | LISTA-002 | ✅ mind sikeres | — |
| KAN-21 | HIRD-011, HIRD-013, HIRD-014, HIRD-015 | ✅ mind sikeres | — |
| KAN-22 | LISTA-003, LISTA-008 | ✅ mind sikeres | — |
| KAN-23 | KONT-001, KONT-002, KONT-007 | ✅ mind sikeres | — |
| KAN-24 | UI-002 | ✅ mind sikeres | — |
| KAN-25 | UI-003, UI-004 | ✅ mind sikeres | — |
| KAN-26 | UI-005 | ✅ mind sikeres | — |
| KAN-27 | AUTH-015 | ✅ mind sikeres | — |
| KAN-28 | JARMU-005, JARMU-006, JARMU-007, JARMU-008, JARMU-009, JARMU-010 | ❌ 1 sikertelen | BUG-02 |
| KAN-29 | LEMOND-004 | ✅ mind sikeres | — |
| KAN-30 | LISTA-001, LISTA-002, LISTA-003 | ✅ mind sikeres | — |
| KAN-31 | EMAIL-001, FOGL-007, FOGL-008 | ✅ mind sikeres | — |
| KAN-32 | UI-001 | ✅ mind sikeres | — |
| KAN-33 | UI-005 | ✅ mind sikeres | — |
| KAN-34 | HIRD-010 | ✅ mind sikeres | — |
| KAN-35 | UI-006 | ✅ mind sikeres | — |
| spec 2.1 | AUTH-002, AUTH-005, AUTH-006, AUTH-017, JOG-005, JOG-006, KONT-004, KONT-006, LISTA-007 | ❌ 3 sikertelen, 1 nem futott | BUG-01, BUG-13, BUG-16 |
| spec 2.2 | JARMU-001, JOG-004 | ✅ mind sikeres | — |
| spec 2.3 | HIRD-007 | ✅ mind sikeres | — |
| spec 2.4 | FOGL-002, FOGL-006, FOGL-013, JOG-003, LEMOND-007 | ✅ mind sikeres | — |
| spec 2.5 | UI-009 | ✅ mind sikeres | — |
| spec 3.1 | AUTH-001, AUTH-006 | ❌ 1 sikertelen | BUG-16 |
| spec 3.3 | HIRD-009 | ✅ mind sikeres | — |
| spec 3.4 | KERES-010 | ✅ mind sikeres | — |
| spec 3.5 | FOGL-001 | ✅ mind sikeres | — |
| spec 3.6 | KONT-001 | ✅ mind sikeres | — |
| spec 3.8 | HIRD-017 | ✅ mind sikeres | — |
| spec 4.1 | ADAT-001, ADAT-002, FOGL-003, FOGL-004, FOGL-016, HIRD-003, HIRD-004 | ❌ 1 sikertelen | BUG-18 |
| spec 4.2 | ADAT-002, HIRD-001, HIRD-002, HIRD-003 | ❌ 2 sikertelen | BUG-04, BUG-18 |
| spec 4.3 | FOGL-001 | ✅ mind sikeres | — |
| spec 4.4 | ADAT-004, FOGL-005, HIRD-019 | ✅ mind sikeres | — |
| spec 4.5 | JOG-002, LEMOND-002, LEMOND-006 | ❌ 1 sikertelen | BUG-07 |
| spec 4.6 | AUTH-001, AUTH-004, AUTH-017, EMAIL-004, KONT-001, KONT-002, KONT-008 | ❌ 1 sikertelen | BUG-08 |
| spec 4.7 | JOG-006, KONT-003, KONT-004, KONT-005, KONT-006, KONT-008 | ❌ 2 sikertelen | BUG-01, BUG-08 |
| spec 4.8 | HIRD-018, KERES-001, KERES-002, KERES-003, KERES-004, KERES-005, KERES-006, KERES-007, KERES-008, KERES-009, KERES-010 | ❌ 2 sikertelen | BUG-05, BUG-06 |
| spec 4.10 | AUTH-010, AUTH-011, AUTH-013 | ❌ 1 sikertelen | BUG-14 |
| spec 4.11 | HIRD-011, HIRD-012, HIRD-013, HIRD-014, HIRD-015, HIRD-016, HIRD-017, JOG-001, JOG-007 | ✅ mind sikeres | — |
| spec 4.12 | ADAT-005, FOGL-015, JOG-001, KERES-007, LEMOND-004, LEMOND-006 | ❌ 1 sikertelen | BUG-07 |
| spec 4.13 | JARMU-005, JARMU-006, JARMU-007, JARMU-008, JARMU-009, JARMU-010 | ❌ 1 sikertelen | BUG-02 |
| spec 4.14 | AUTH-003 | ✅ mind sikeres | — |
| spec 4.15 | EMAIL-001, EMAIL-002, EMAIL-003, HIRD-017, KONT-001 | ❌ 1 sikertelen | BUG-17 |
| spec 4.16 | KONT-007, LISTA-004, LISTA-005, LISTA-006, LISTA-007 | ❌ 2 sikertelen | BUG-10 |
| spec 4.17 | FOGL-009, FOGL-010, FOGL-011, FOGL-012, JOG-002 | ✅ mind sikeres | — |
| spec 4.18 | FOGL-012, JARMU-006, LEMOND-001, LEMOND-003 | ✅ mind sikeres | — |
| spec 4.19 | HIRD-005, HIRD-006, HIRD-020 | ❌ 1 sikertelen | BUG-07 |
| spec 4.20 | LISTA-002 | ✅ mind sikeres | — |
| spec 4.21 | ADAT-005, LEMOND-002, LEMOND-004 | ✅ mind sikeres | — |
| spec 4.22 | LISTA-001, LISTA-002, LISTA-003, LISTA-004, LISTA-008 | ❌ 1 sikertelen | BUG-10 |
| spec 4.23 | ADAT-003, EMAIL-001, FOGL-007, FOGL-008, FOGL-017 | ✅ mind sikeres | — |
| spec 4.24 | HIRD-018, HIRD-019 | ✅ mind sikeres | — |
| spec 4.25 | LEMOND-005 | ✅ mind sikeres | — |
| spec 4.26 | UI-002, UI-009 | ✅ mind sikeres | — |

## 6. Elemzés
**Lefedettség.**
- 22/31 MVP story-hoz tartozó összes teszt sikeres.
- Minden aktív követelménynek van legalább egy futtatott tesztje.
- Nem futott: a megerősítetlen fiók belépési tilalma (AUTH-002).
- Részlegesen lefedett, mert csak 2 értesítő-sablon tartalmát láttuk: booking_updated, booking_cancelled, listing_cancelled.

**Hibák eloszlása.**
- Súlyosság szerint: Kritikus: 1, Magas: 3, Közepes: 7, Alacsony: 7.
- Modul szerint: AUTH 4, LEMOND 2, KONT 2, JARMU 2, KERES 2, JOG 1, UI 1, HIRD 1, LISTA 1, EMAIL 1, ADAT 1.
- Hibacsoportosulás (defect clustering):
  - **AUTH (regisztráció/bejelentkezés)**, 5 hiba (BUG-13…17): itt a legtöbb a szöveg- és validációs hiányosság, és ez a legkevésbé tesztelhető terület (jelszó, levélkorlát).
  - **Állapotgép a hirdetés/foglalás életciklus végén** (BUG-07, BUG-11): az RPC-k a status mezőt nézik, az indulási időpontot és a végállapotot nem.

**Gyökérok-kategóriák (feltételezett).**
- Implementációs hiba: 8, Jogosultság: 3, Adatintegritás: 2, Csak kliensoldali validáció: 2, Spec-eltérés: 1, Szöveg/UI: 1, Környezet: 1.
- Visszatérő minta: **a felület helyesen rejt vagy validál, a szerver nem** (BUG-01, BUG-03, BUG-08, BUG-14). Az API közvetlen hívásával ezek megkerülhetők.

**Ami kifejezetten jól működik.**
- Párhuzamos foglalásnál soha nincs túlfoglalás (3×3 kör).
- Az ismételt foglalás egy foglalássá olvad össze.
- A zárolt hirdetés ára, dátuma és ideje szerveroldalon is védett.
- Az RLS minden táblán és nézeten helyesen szűr (a BUG-01/08 kivételével).
- Hirdetéstörléskor pontosan egy értesítés-esemény fut.
- A valódi fiókok adatai a leltár-hash szerint bitre változatlanok.

**Regresszió / trend.** Ez az első dokumentált futás, nincs korábbi összevetés. A KAN-24…27 (korábban javított UI-hibák) nem tértek vissza: a képek betöltődnek, a Vissza gombok jók, az ikon egységes, a kijelentkezés felirata egységes.

## 7. Kockázatok és nyitott kérdések
- **Adatvédelem:** BUG-01 + BUG-15 + BUG-08 együtt azt jelenti, hogy a felhasználók e-mail címe és telefonszáma a szándékoltnál szélesebb körben elérhető. Az éles adatkezelési tájékoztatóval ütközhet.
- **BUG-16 vs. BUG-15 döntés:** a „létező e-mail” hibaüzenet (SQ-12) elárulja, hogy egy cím regisztrált-e. Döntés kell: felhasználói kényelem vagy felsorolás elleni védelem.
- **E-mail-infrastruktúra:**
  - Mailgun sandbox: csak jóváhagyott címzettek kapnak levelet, és a levelek Spambe kerülnek.
  - A Supabase beépített SMTP-korlátja (~2 levél/óra) éles regisztrációs forgalomnál blokkoló.
- **Tesztelhetőség:** az egyoldalas alkalmazásban nincs URL-alapú navigáció, és nincsenek data-testid attribútumok. Ez nehezíti a Playwright-automatizálást.
- **Nem tesztelt:** AUTH-002; három értesítő-sablon tartalma; Safari/Firefox; valódi mobilkészülék.

## 8. Javaslatok
1. **Kiadás előtt:**
   - javítani BUG-01 és BUG-09;
   - dönteni BUG-07/08-ról (javítás vagy tudatos elfogadás);
   - újrafuttatni: JOG-006, JOG-009, UI-007, LEMOND-006, HIRD-020, KONT-008.
2. **Szerveroldali validáció és állapotgép** egy körben (BUG-03, 07, 11, 13, 14, 18):
   - CHECK constraintek (trim-elt, nem üres mezők, telefonszám-formátum);
   - lower(username) egyedi index;
   - az RPC-k az indulási időpontot (ride_date + ride_time) és a végállapotot is ellenőrizzék.
3. **E-mail:**
   - egyéni SMTP és magyar, Telekocsi-arculatú Supabase Auth sablonok (BUG-17);
   - Mailgun: saját domain, SPF/DKIM beállítás.
4. **Hiányzó funkció:** „Elfelejtett jelszó” (a futás során ez okozta a legnagyobb fennakadást).
5. **Automatizálás:**
   - a Supabase/API negatív tesztek (JOG, HIRD-015/016, LEMOND-006, FOGL-010/016/017, ADAT-*) már most SQL-szkriptként futtathatók CI-ban, visszagörgetett tranzakcióval;
   - a felületi tesztekhez data-testid attribútumok és URL-alapú útvonalak kellenek.
6. **Tesztadat:** a K fiók jelszavát jelszókezelőben tárolni; egy megerősítetlen tesztfiók előkészítése az AUTH-002-höz.
7. **Jira:** a 18 hibára javasolt jegyek (KAN projekt, Bug típus) — létrehozás a jóváhagyás után.
