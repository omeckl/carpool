# Telekocsi — tesztterv és tesztesetek áttekintése

*Készült: 2026-09-30, frissítve a spec v11 után · A `funkcionalis-teszteles` skill alapján · Állapot: Tervezett (még nem futott)*

## 1. Cél és hatókör

A Telekocsi MVP funkcionális tesztelése az éles rendszeren (`https://carpool-tawny.vercel.app/` + éles Supabase), a KAN story-k és a rendszerelemzési specifikáció alapján, böngészős, Supabase/API és — később — Playwright végrehajtással.

**Hatókörben:** KAN-2 … KAN-9, KAN-13 … KAN-35, a spec 2–4. fejezete (v10), az e-mail értesítések, a jogosultság (RLS) és az adatintegritás.

**Hatókörön kívül:** KAN-10 (rate limiting — nincs megvalósítva), KAN-11 és KAN-12 (2. fázis), teljesítmény- és terheléses teszt, akadálymentességi audit, böngésző-kompatibilitás (csak Chromium asztali + mobil nézet).

## 2. Tesztbázis és tesztorákulum

| Forrás | Verzió / dátum | Szerep |
|---|---|---|
| Rendszerelemzési specifikáció (Confluence + `claude/telekocsi-rendszerelemzesi-spec.md`) | v11, 2026-09-30 | **Elsődleges orákulum** |
| User story-k (Jira KAN — ez az irányadó; a `claude/telekocsi-user-stories.md` csak v7-ig követi) | 2026-09-30 (v11) | Elfogadási kritériumok |
| E-mail infrastruktúra (`claude/telekocsi-email-infra.md`) | 2026-09-21 | Esemény → sablon megfeleltetés |
| Adatbázis-migrációk (`supabase/migrations/`) | 2026-09-28-ig | Szerver oldali szabályok felderítése |

**Ahol a story és a spec eltér, a spec (v11) az orákulum.** A Jira story-k 2026-09-30-án a v11 szerint frissültek (KAN-2, KAN-3, KAN-4, KAN-5, KAN-7, KAN-8, KAN-20, KAN-22); a KAN-21 és KAN-30 már korábban a v8/v9-et követte. A projektben lévő `telekocsi-user-stories.md` összefoglaló csak v7-ig naprakész — a Jira az irányadó.

## 3. Környezet és szereplők

| Szerep | Fiók | Mailgun-jóváhagyott | Megjegyzés |
|---|---|---|---|
| **S** — QA_Sofor | jfkovesi@gmail.com | Igen | Valódi fiók — meglévő adatai védettek |
| **U1** — QA_Utas1 | omeckl@yahoo.com | Igen | Valódi fiók — meglévő adatai védettek |
| **U2** — QA_Utas2 | orsime@yahoo.com | Igen | Valódi fiók — meglévő adatai védettek |
| **K** — QA_Kivulallo | jfkovesi+qa@gmail.com | Nem (nem is kell) | A TC-AUTH-001 hozza létre |
| **V** — vendég | — | — | Kijelentkezett állapot |

Időzóna: Europe/Budapest. Minden dátum relatív („ma+N”), a futás pontos idejét rögzíteni kell.

## 4. Tesztadatok (fixture-ök)

Minden teszt által létrehozott adat `QA_` jelölésű: a járművek típusa `QA_…`, rendszáma `QAA-1xx`, a hirdetések induló állomása **`QA_Budapest`** (a célállomás valódi város, hogy ne induljon fölösleges fotókeresés).

| Azonosító | Tartalom | Létrehozza | Használja |
|---|---|---|---|
| **J-A** | S járműve: QA_Skoda Octavia, 4 hely, QAA-101 | TC-JARMU-001 | minden hirdetés |
| **J-B** | S járműve: QA_Suzuki Swift, 2 hely, QAA-102 (hirdetés nélkül) | TC-JARMU-002 | JARMU-005/006 |
| **J-C** | S járműve: QA_Fiat 500, 1 hely, QAA-104 | TC-JARMU-010 | JARMU-010 |
| **H-ALAP** | QA_Budapest → Debrecen, ma+7 08:00, 3000 Ft, J-A, 4 hely | TC-HIRD-001 | HIRD-011…012, 018…019, FOGL-005, 007, 008 |
| **H-FOGLALT** | QA_Budapest → Szeged, ma+10 09:00, J-A, 4 hely | előkészítés | FOGL-001…003, 009…012, 018, HIRD-013…017, KONT, LEMOND-001/002, LISTA |
| **H-SZUK** | QA_Budapest → Pécs, ma+14 10:00, 4000 Ft, J-A, 1 hely | TC-HIRD-002 | FOGL-004, 016, KERES-005, 008 |
| **H-PAR** | QA_Budapest → Nyíregyháza, ma+12 11:00, J-A, 4 hely | előkészítés | FOGL-017 |
| **H-LEJAR** | QA_Budapest → Győr, **ma, most+20 perc**, J-A, 3 hely; U1 1 helyet foglal indulás előtt | előkészítés | KERES-002, FOGL-014, HIRD-020, LEMOND-006, LISTA-008 |
| **H-TOROL** | QA_Budapest → Eger, ma+20, J-A; U1 1 + U2 1 hely | előkészítés | LEMOND-003…005, KERES-007, FOGL-015 |

Az időfüggő tesztek (H-LEJAR) miatt a H-LEJAR-t a futás elején kell létrehozni, és az indulási idő után kell rá visszatérni.

## 5. Kockázatelemzés

| Terület | Hatás | Valószínűség | Kockázat | Prioritás | Indoklás |
|---|---|---|---|---|---|
| Foglalás, kapacitás, párhuzamosság (FOGL) | 3 | 3 | 9 | P1 | Túlfoglalás = fő üzleti hiba; v7-ben változott (összevonás) |
| Kontaktadat / rendszám láthatósága (KONT, JOG) | 3 | 2 | 6 | P1 | Személyes adat szivárgása; nézetek `auth.users` JOIN-nal |
| Hirdetés-zárolás, dátum (HIRD) | 3 | 3 | 9 | P1 | v6–v8 között háromszor változott; időzóna-logika |
| Lemondás / törlés állapotai (LEMOND) | 3 | 2 | 6 | P1 | Kaszkád + e-mail-elnyomó flag, összetett |
| Regisztráció / bejelentkezés (AUTH) | 3 | 1 | 3 | P1 (kivételesen) | Blokkolja az összes többi folyamatot |
| Jármű-zárolás (JARMU) | 2 | 2 | 4 | P2 (a zárolás P1) | v7-es új szabály |
| Listák, rendezés, badge (LISTA) | 2 | 3 | 6 | P2 | v6–v9 között többször változott |
| E-mailek (EMAIL) | 2 | 2 | 4 | P2 | Aszinkron, hiba lenyelve — csendben hibázhat |
| Keresés (KERES) | 2 | 1 | 2 | P2 | Stabil, régóta változatlan |
| Felület, navigáció (UI) | 1 | 2 | 2 | P3 | Kozmetikai |

## 6. Összesítés

| Modul | Tesztesetek | P1 | P2 | P3 | Automatizálható (Igen/Részben) | Becsült e-mail |
|---|---|---|---|---|---|---|
| [AUTH](AUTH.md) | 16 | 9 | 4 | 3 | 14 | 0 |
| [JARMU](JARMU.md) | 10 | 5 | 5 | 0 | 10 | 1 |
| [HIRD](HIRD.md) | 20 | 10 | 9 | 1 | 20 | 1 |
| [KERES](KERES.md) | 10 | 2 | 7 | 1 | 10 | 0 |
| [FOGL](FOGL.md) | 19 | 11 | 8 | 0 | 18 | 32 |
| [KONT](KONT.md) | 8 | 7 | 1 | 0 | 6 | 0 |
| [LEMOND](LEMOND.md) | 7 | 4 | 3 | 0 | 7 | 9 |
| [LISTA](LISTA.md) | 9 | 2 | 5 | 2 | 9 | 2 |
| [EMAIL](EMAIL.md) | 5 | 1 | 4 | 0 | 3 | 0 |
| [UI](UI.md) | 9 | 0 | 2 | 7 | 7 | 0 |
| [JOG](JOG.md) | 10 | 6 | 3 | 1 | 9 | 0 |
| [ADAT](ADAT.md) | 6 | 6 | 0 | 0 | 6 | 0 |
| **Összesen** | **129** | **63** | **51** | **15** | **119** | **45** |

Archivált (nem futtatandó) tesztesetek: TC-AUTH-009, TC-HIRD-008.

Végrehajtási mód szerint: Böngésző: 93, Supabase/API: 71, Postafiók-ellenőrzés: 5 (egy teszteset több módot is használhat). Playwright-jelölt (Automatizálható = Igen): 113.

## 7. E-mail-keret és futásterv

A Mailgun napi keret 100 levél (az éles használattal közös); a tesztelő futásonkénti keretét a felhasználó **80 levélre** emelte (2026-09-30), hogy minden teszt egy futásban lefusson. A tesztesetek becsült fogyasztása **45 levél**, ehhez jön az előkészítés (H-LEJAR foglalás: 2) és a takarítás (hirdetés-törlések: kb. 6) — összesen kb. **53 levél**, a keret alatt. A tesztelés **egy futásban** történik; a párhuzamossági tesztek (TC-FOGL-016, TC-FOGL-017) és a JOG, UI blokk a végére kerül.

Aznap más, e-mailt küldő tevékenység (pl. valódi foglalások) is a 100-as napi Mailgun-keretből fogy — nagy forgalmú napon a futást érdemes elhalasztani.

### Végrehajtási sorrend

A tesztesetek állapotot építenek egymásra, ezért a sorrend kötött:

1. **Előkészítés:** smoke (oldal betölt, S be tud jelentkezni); leltár S, U1, U2 meglévő adatairól (TC-ADAT-006 alapja); e-mail-számláló nullázása.
2. **AUTH:** 001 → 002 → (a felhasználó rákattint a linkre) → 003, majd a többi (a 009 archivált).
3. **JARMU:** 001 → 002 → 003 … 006 (J-B-n); J-A-ra hirdetés után: 007 … 009; végül 010.
4. **HIRD foglalás nélkül:** 001 (H-ALAP), 002 (H-SZUK), 003 … 012 (a 008 archivált), 018, 019, 021; majd a **H-LEJAR, H-FOGLALT, H-TOROL** létrehozása (a H-TOROL-ra U1 és U2 1-1 helyet foglal).
5. **FOGL:** 001 → 002 → 003 → 009 → 010 → 011 → 012 → 018; 004 … 008; 013, 015, 019. (A TC-FOGL-014 a H-LEJAR indulása után.)
6. **HIRD foglalás után:** 013 → 014 → 015 → 016 → 017; a H-LEJAR indulása után: 020.
7. **KONT:** 001 … 008.
8. **LISTA:** 004 … 007 (a LISTA-006 új foglalást tesz), majd a H-LEJAR indulása után 008.
9. **LEMOND:** 001 → 002 → 003 → 004 → 005 → 006 → 007.
10. **LISTA:** 001 … 003, 009 (most már minden állapot létezik).
11. **KERES:** 001 … 007, 009, 010.
12. **EMAIL:** 001 … 005 (a futás naplói és postafiókjai alapján).
13. **FOGL párhuzamosság:** 016 (a KERES-008 az egyik kör után, a lemondás előtt), 017.
14. **JOG:** 001 … 010. **UI:** 001 … 009.
15. **ADAT:** 001 … 006.
16. **Takarítás** (lásd 8. pont).

## 8. Takarítás

- A `QA_` hirdetések törlése (`cancel_listing`) e-mailt küld (1 + az aktív foglalók száma) — a futás végén, a keretbe beszámítva.
- Az elindult hirdetés (H-LEJAR) már nem törölhető; „Lejárt” állapotban marad — ez elfogadható, a `QA_Budapest` jelölés alapján szűrhető.
- A `QA_` járművek aktív hirdetés nélkül törölhetők.
- A K fiók (jfkovesi+qa@gmail.com) megmarad a következő futásokhoz.
- Alternatíva: SQL-lel történő törlés (nem vált ki e-mailt), de csak a felhasználó kifejezett jóváhagyásával.

## 9. Spec-kérdések és elemzés során talált kockázatok

Minden spec-kérdés lezárult (2026-09-30); a döntések a Confluence-specifikáció v11-es Változásnaplójában és a Jira story-kban szerepelnek.

| ID | Kérdés / kockázat | Állapot | Érintett tesztek |
|---|---|---|---|
| **SQ-1** | Hirdetés-módosításkor kapnak-e e-mailt az aktív foglalók? | **Lezárva (v11):** nincs értesítés; a megvalósítás megfelel. KAN-4 frissítve. | HIRD-017 |
| **SQ-2** | „Lejárt”: dátum vagy indulási időpont? | **Lezárva (v11):** az indulási időpont (dátum + idő). KAN-5, KAN-20, KAN-22 frissítve. | KERES-002, LISTA-008 |
| **SQ-3** | A keresés szabad helyek szűrője mit néz? | **Lezárva (v11):** a még foglalható helyeket. KAN-5 frissítve. | KERES-006 |
| **SQ-4** | Megjelenik-e a betelt hirdetés a keresőben? | **Lezárva (v11):** nem jelenik meg. KAN-5 frissítve. | KERES-008 |
| **SQ-5** | Az ár felső korlátja és a tizedes érték kezelése. | **Lezárva (v11):** szándékosan nem specifikált, nem kell rá teszteset. | HIRD-008 (archivált) |
| **SQ-6** | Jelszó-szabály (hossz, összetettség). | **Lezárva (v11):** szándékosan nem specifikált, nem kell rá teszteset. | AUTH-009 (archivált) |
| **SQ-7** | Lemondás/törlés után látja-e az egykori utas a rendszámot és a kontaktot? | **Lezárva (v11):** nem látja. KAN-3, KAN-7 frissítve. | KONT-008 |
| **SQ-8** | Böngészhet-e a vendég a hirdetések között? | **Lezárva (v11):** igen, böngészhet és szűrhet; rendszámot/kontaktot nem lát, foglalni nem tud. KAN-5 frissítve. | KERES-010 |
| **SQ-9** | Törölheti-e a sofőr az elindult hirdetést? | **Lezárva (v11):** nem. KAN-8 frissítve. | LEMOND-006 |
| **SQ-10** | KAN-20/30 vs. spec 4.25 (törölt kártya foglalás-száma). | **Lezárva:** a Jira már a v9-et követi. | LEMOND-005, LISTA-002 |
| **SQ-11** | KAN-4/21 vs. spec 4.11 v8 (helyek csökkentése foglalás után). | **Lezárva:** a Jira már a v8-at követi. | HIRD-014 |
| **SQ-12** | Meglévő e-mail címmel történő regisztráció visszajelzése (hibaüzenet vs. látszólagos siker). | **Lezárva (v11):** egyértelmű hibaüzenet, hogy a címmel már létezik regisztráció. KAN-2 frissítve. Kockázat: a Supabase alapértelmezése ezt nem teljesíti. | AUTH-006 |
| **R-1** | Az éles projekt URL-je be van égetve a trigger-függvényekbe (egy esetleges új környezetet érint, a tesztet nem). | Tudomásul véve — élesen tesztelünk. | — |

## 10. Nyomonkövethetőség (követelmény → teszteset)

| Követelmény | Tesztesetek |
|---|---|
| KAN-2 | TC-AUTH-001, TC-AUTH-002, TC-AUTH-003, TC-AUTH-004, TC-AUTH-005, TC-AUTH-006, TC-AUTH-007, TC-AUTH-008, TC-AUTH-010, TC-AUTH-011, TC-AUTH-012, TC-AUTH-014 |
| KAN-3 | TC-JARMU-001, TC-JARMU-002, TC-JARMU-003, TC-JARMU-004, TC-JARMU-005, TC-KONT-003, TC-KONT-004, TC-KONT-008 |
| KAN-4 | TC-HIRD-001, TC-HIRD-002, TC-HIRD-003, TC-HIRD-009, TC-HIRD-011, TC-HIRD-017 |
| KAN-5 | TC-KERES-001, TC-KERES-002, TC-KERES-003, TC-KERES-004, TC-KERES-005, TC-KERES-006, TC-KERES-008, TC-KERES-010 |
| KAN-6 | TC-FOGL-001, TC-FOGL-002, TC-FOGL-003, TC-FOGL-004, TC-FOGL-005 |
| KAN-7 | TC-KONT-001, TC-KONT-002, TC-KONT-003, TC-KONT-008 |
| KAN-8 | TC-LEMOND-002, TC-LEMOND-004, TC-LEMOND-006 |
| KAN-9 | TC-AUTH-016 |
| KAN-13 | TC-KONT-007, TC-LISTA-003, TC-LISTA-004, TC-LISTA-005, TC-LISTA-006, TC-LISTA-007 |
| KAN-14 | TC-HIRD-003, TC-HIRD-004 |
| KAN-15 | TC-EMAIL-001 |
| KAN-16 | TC-EMAIL-001, TC-EMAIL-002, TC-EMAIL-003 |
| KAN-17 | TC-FOGL-009, TC-FOGL-010, TC-FOGL-011, TC-FOGL-012 |
| KAN-18 | TC-FOGL-012, TC-LEMOND-001, TC-LEMOND-003 |
| KAN-19 | TC-HIRD-005, TC-HIRD-006 |
| KAN-20 | TC-LISTA-002 |
| KAN-21 | TC-HIRD-011, TC-HIRD-013, TC-HIRD-014, TC-HIRD-015 |
| KAN-22 | TC-LISTA-003, TC-LISTA-008 |
| KAN-23 | TC-KONT-001, TC-KONT-002, TC-KONT-007 |
| KAN-24 | TC-UI-002 |
| KAN-25 | TC-UI-003, TC-UI-004 |
| KAN-26 | TC-UI-005 |
| KAN-27 | TC-AUTH-015 |
| KAN-28 | TC-JARMU-005, TC-JARMU-006, TC-JARMU-007, TC-JARMU-008, TC-JARMU-009, TC-JARMU-010 |
| KAN-29 | TC-LEMOND-004 |
| KAN-30 | TC-LISTA-001, TC-LISTA-002, TC-LISTA-003 |
| KAN-31 | TC-EMAIL-001, TC-FOGL-007, TC-FOGL-008 |
| KAN-32 | TC-UI-001 |
| KAN-33 | TC-UI-005 |
| KAN-34 | TC-HIRD-010 |
| KAN-35 | TC-UI-006 |
| spec 1 | TC-FOGL-019, TC-HIRD-009 |
| spec 2.1 | TC-AUTH-002, TC-AUTH-005, TC-AUTH-006, TC-AUTH-017, TC-JOG-005, TC-JOG-006, TC-KONT-004, TC-KONT-006, TC-LISTA-007 |
| spec 2.2 | TC-JARMU-001, TC-JOG-004 |
| spec 2.3 | TC-HIRD-007 |
| spec 2.4 | TC-FOGL-002, TC-FOGL-006, TC-FOGL-013, TC-JOG-003, TC-LEMOND-007 |
| spec 2.5 | TC-UI-009 |
| spec 3.1 | TC-AUTH-001, TC-AUTH-006 |
| spec 3.3 | TC-HIRD-009 |
| spec 3.4 | TC-KERES-010 |
| spec 3.5 | TC-FOGL-001 |
| spec 3.6 | TC-KONT-001 |
| spec 3.8 | TC-HIRD-017 |
| spec 4.1 | TC-ADAT-001, TC-ADAT-002, TC-FOGL-003, TC-FOGL-004, TC-FOGL-016, TC-HIRD-003, TC-HIRD-004 |
| spec 4.2 | TC-ADAT-002, TC-HIRD-001, TC-HIRD-002, TC-HIRD-003 |
| spec 4.3 | TC-FOGL-001 |
| spec 4.4 | TC-ADAT-004, TC-FOGL-005, TC-HIRD-019 |
| spec 4.5 | TC-JOG-002, TC-LEMOND-002, TC-LEMOND-006 |
| spec 4.6 | TC-AUTH-001, TC-AUTH-004, TC-AUTH-017, TC-EMAIL-004, TC-KONT-001, TC-KONT-002, TC-KONT-008 |
| spec 4.7 | TC-JOG-006, TC-KONT-003, TC-KONT-004, TC-KONT-005, TC-KONT-006, TC-KONT-008 |
| spec 4.8 | TC-HIRD-018, TC-KERES-001, TC-KERES-002, TC-KERES-003, TC-KERES-004, TC-KERES-005, TC-KERES-006, TC-KERES-007, TC-KERES-008, TC-KERES-009, TC-KERES-010 |
| spec 4.10 | TC-AUTH-010, TC-AUTH-011, TC-AUTH-013 |
| spec 4.11 | TC-HIRD-011, TC-HIRD-012, TC-HIRD-013, TC-HIRD-014, TC-HIRD-015, TC-HIRD-016, TC-HIRD-017, TC-JOG-001, TC-JOG-007 |
| spec 4.12 | TC-ADAT-005, TC-FOGL-015, TC-JOG-001, TC-KERES-007, TC-LEMOND-004, TC-LEMOND-006 |
| spec 4.13 | TC-JARMU-005, TC-JARMU-006, TC-JARMU-007, TC-JARMU-008, TC-JARMU-009, TC-JARMU-010 |
| spec 4.14 | TC-AUTH-003 |
| spec 4.15 | TC-EMAIL-001, TC-EMAIL-002, TC-EMAIL-003, TC-HIRD-017, TC-KONT-001 |
| spec 4.16 | TC-KONT-007, TC-LISTA-004, TC-LISTA-005, TC-LISTA-006, TC-LISTA-007 |
| spec 4.17 | TC-FOGL-009, TC-FOGL-010, TC-FOGL-011, TC-FOGL-012, TC-JOG-002 |
| spec 4.18 | TC-FOGL-012, TC-JARMU-006, TC-LEMOND-001, TC-LEMOND-003 |
| spec 4.19 | TC-HIRD-005, TC-HIRD-006, TC-HIRD-020 |
| spec 4.20 | TC-LISTA-002 |
| spec 4.21 | TC-ADAT-005, TC-LEMOND-002, TC-LEMOND-004 |
| spec 4.22 | TC-LISTA-001, TC-LISTA-002, TC-LISTA-003, TC-LISTA-004, TC-LISTA-008 |
| spec 4.23 | TC-ADAT-003, TC-EMAIL-001, TC-FOGL-007, TC-FOGL-008, TC-FOGL-017 |
| spec 4.24 | TC-HIRD-018, TC-HIRD-019 |
| spec 4.25 | TC-LEMOND-005 |
| spec 4.26 | TC-UI-002, TC-UI-009 |
| spec 5 | TC-AUTH-016 |

## 11. Fájlok

- [`tesztesetek.csv`](tesztesetek.csv) — a teljes tesztesettár (UTF-8 BOM, pontosvessző, Excelben közvetlenül megnyitható)
- Modulonként: [AUTH](AUTH.md) · [JARMU](JARMU.md) · [HIRD](HIRD.md) · [KERES](KERES.md) · [FOGL](FOGL.md) · [KONT](KONT.md) · [LEMOND](LEMOND.md) · [LISTA](LISTA.md) · [EMAIL](EMAIL.md) · [UI](UI.md) · [JOG](JOG.md) · [ADAT](ADAT.md)
