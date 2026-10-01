# HIRD — Hirdetés létrehozása, szerkesztése, zárolás, dátum

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 20 · P1: 10 · P2: 9 · P3: 1 · becsült e-mail: 1

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-HIRD-001](#tc-hird-001) | Hirdetés létrehozása — a szabad helyek alapértéke a jármű férőhelye | P1 | Böngésző + Supabase |
| [TC-HIRD-002](#tc-hird-002) | Szabad helyek csökkentése létrehozáskor | P2 | Böngésző |
| [TC-HIRD-003](#tc-hird-003) | A helyek száma nem lépheti túl a jármű férőhelyét (felület) | P1 | Böngésző |
| [TC-HIRD-004](#tc-hird-004) | Szerver: kapacitás feletti hirdetés API-n elutasítva | P1 | Supabase |
| [TC-HIRD-005](#tc-hird-005) | Dátumtartomány határértékei a felületen | P1 | Böngésző |
| [TC-HIRD-006](#tc-hird-006) | Szerver: dátum- és időpont-validáció API-n | P1 | Supabase |
| [TC-HIRD-007](#tc-hird-007) | Szabad helyek 0 vagy negatív | P2 | Böngésző + Supabase |
| [TC-HIRD-008](#tc-hird-008) | Ár érvényessége *(archivált)* | P2 | Böngésző |
| [TC-HIRD-009](#tc-hird-009) | Jármű nélküli felhasználó nem tud hirdetést feladni | P2 | Böngésző |
| [TC-HIRD-010](#tc-hird-010) | A helyek mező felirata „Maximális szabad helyek” | P3 | Böngésző |
| [TC-HIRD-011](#tc-hird-011) | Foglalás nélküli hirdetés minden mezője szerkeszthető | P1 | Böngésző + Supabase |
| [TC-HIRD-012](#tc-hird-012) | Induló és célállomás nem módosítható | P2 | Böngésző + Supabase |
| [TC-HIRD-013](#tc-hird-013) | Foglalás után az ár, dátum és idő zárolt (felület) | P1 | Böngésző |
| [TC-HIRD-014](#tc-hird-014) | Foglalás után a helyek száma a lefoglalt és a férőhely között állítható | P1 | Böngésző + Supabase |
| [TC-HIRD-015](#tc-hird-015) | Szerver: zárolt hirdetés árának / dátumának módosítása API-n | P1 | Supabase |
| [TC-HIRD-016](#tc-hird-016) | Szerver: helyek csökkentése a lefoglalt alá API-n | P1 | Supabase |
| [TC-HIRD-017](#tc-hird-017) | Hirdetés-módosításról nem megy e-mail értesítés | P2 | Supabase |
| [TC-HIRD-018](#tc-hird-018) | Saját hirdetés „Saját hirdetés” jelölést kap a listán | P2 | Böngésző |
| [TC-HIRD-019](#tc-hird-019) | Saját hirdetés részletes nézetén nincs foglalási doboz | P2 | Böngésző |
| [TC-HIRD-020](#tc-hird-020) | Elindult hirdetés nem szerkeszthető | P2 | Böngésző + Supabase |
| [TC-HIRD-021](#tc-hird-021) | Dupla kattintás a mentés gombon nem hoz létre két hirdetést | P2 | Böngésző + Supabase |

### TC-HIRD-001
**Hirdetés létrehozása — a szabad helyek alapértéke a jármű férőhelye**

- **Forrás:** KAN-4; spec 4.2 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve, J-A létezik.
- **Tesztadat:** H-ALAP: QA_Budapest → Debrecen, ma+7 08:00, ár 3000, J-A
- **Lépések:**
  1. Nyisd meg a hirdetés létrehozása oldalt.
  2. Válaszd J-A-t, és nézd meg a helyek mező alapértékét.
  3. Töltsd ki a többi mezőt, mentsd.
- **Elvárt eredmény:**
  - A helyek mező alapértéke 4 (J-A férőhelye).
  - A hirdetés létrejön; a keresőben és a Hirdetéseim-ben megjelenik.
  - DB: listings sor status = active, seats_total = 4, car_plate = QAA-101.

### TC-HIRD-002
**Szabad helyek csökkentése létrehozáskor**

- **Forrás:** KAN-4; spec 4.2 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, J-A.
- **Tesztadat:** H-SZUK: QA_Budapest → Pécs, ma+14 10:00, ár 4000, helyek 1
- **Lépések:**
  1. Hozz létre hirdetést J-A-val, a helyek számát állítsd 1-re.
- **Elvárt eredmény:**
  - A hirdetés 1 szabad hellyel jön létre.

### TC-HIRD-003
**A helyek száma nem lépheti túl a jármű férőhelyét (felület)**

- **Forrás:** KAN-4, KAN-14; spec 4.1, 4.2 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, J-A (4 hely).
- **Tesztadat:** Helyek: 4, 5, 99
- **Lépések:**
  1. A létrehozás űrlapon J-A-val próbáld beírni / léptetni a 4, 5 és 99 értéket, és mentsd.
- **Elvárt eredmény:**
  - A 4 elfogadott; az 5 és 99 nem adható meg vagy mentéskor elutasítva, érthető üzenettel.

### TC-HIRD-004
**Szerver: kapacitás feletti hirdetés API-n elutasítva**

- **Forrás:** KAN-14; spec 4.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S munkamenete.
- **Tesztadat:** create_listing J-A-val, seats_total = 5
- **Lépések:**
  1. S nevében hívd a create_listing RPC-t 5 hellyel.
- **Elvárt eredmény:**
  - Hiba: „nem lehet több, mint a jármű férőhelye”.
  - DB: nem jön létre hirdetés.

### TC-HIRD-005
**Dátumtartomány határértékei a felületen**

- **Forrás:** KAN-19; spec 4.19 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, J-A.
- **Tesztadat:** Dátum: ma−1, ma (most+2 óra), ma+365, ma+366
- **Lépések:**
  1. A létrehozás űrlap dátumválasztójában próbáld kiválasztani / beírni a négy dátumot.
- **Elvárt eredmény:**
  - ma−1 és ma+366 nem választható / nem menthető.
  - ma és ma+365 választható és menthető.
- **Megjegyzés:** A határ Europe/Budapest szerint értendő; futtatás időpontját rögzítsd.

### TC-HIRD-006
**Szerver: dátum- és időpont-validáció API-n**

- **Forrás:** KAN-19; spec 4.19 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 1
- **Előfeltétel:** S munkamenete.
- **Tesztadat:** create_listing: ma−1; ma, most−10 perc; ma+365; ma+366
- **Lépések:**
  1. Hívd a create_listing RPC-t a négy dátum/idő kombinációval.
- **Elvárt eredmény:**
  - ma−1, a mai már elmúlt időpont és ma+366: hiba.
  - ma+365: sikeres (utána töröld).
- **Megjegyzés:** A ma+365-ös hirdetés törlése 1 e-mailt küld S-nek.

### TC-HIRD-007
**Szabad helyek 0 vagy negatív**

- **Forrás:** spec 2.3; séma · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, J-A.
- **Tesztadat:** Helyek: 0, -1
- **Lépések:**
  1. Próbálj hirdetést létrehozni 0, majd -1 hellyel (felületen és API-n).
- **Elvárt eredmény:**
  - Mindkettő elutasítva: „Legalább 1 szabad helyet meg kell hirdetni”.

### TC-HIRD-008 — ARCHIVÁLT
**Ár érvényessége**

- **Forrás:** spec 2.3; séma: ár > 0 · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, J-A.
- **Tesztadat:** Ár: 0, -100, 1, 2500.5, 'abc', 10 000 000
- **Lépések:**
  1. Próbálj hirdetést létrehozni a megadott árakkal.
- **Elvárt eredmény:**
  - 0, negatív, szöveg: elutasítva.
  - 1 elfogadott.
  - Tizedes és irreálisan nagy ár viselkedése dokumentálva.
- **Megjegyzés:** ARCHIVÁLT — SQ-5: a felhasználó döntése szerint erre nem kell teszteset (2026-09-30).

### TC-HIRD-009
**Jármű nélküli felhasználó nem tud hirdetést feladni**

- **Forrás:** KAN-4; spec 1, 3.3 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K bejelentkezve, K-nak nincs járműve.
- **Tesztadat:** —
- **Lépések:**
  1. Próbáld megnyitni a hirdetés létrehozása oldalt / funkciót.
- **Elvárt eredmény:**
  - A hirdetés nem hozható létre; a felület a jármű felvételére irányít vagy ezt jelzi.

### TC-HIRD-010
**A helyek mező felirata „Maximális szabad helyek”**

- **Forrás:** KAN-34 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Hibasejtés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, H-ALAP.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd meg a létrehozás és a szerkesztés űrlapot.
- **Elvárt eredmény:**
  - Mindkét űrlapon a felirat „Maximális szabad helyek”.

### TC-HIRD-011
**Foglalás nélküli hirdetés minden mezője szerkeszthető**

- **Forrás:** KAN-4, KAN-21; spec 4.11 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Döntési tábla
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP-on nincs foglalás.
- **Tesztadat:** Új ár 3500, új dátum ma+8 09:30, helyek 3; utána helyek vissza 4-re
- **Lépések:**
  1. Nyisd meg H-ALAP szerkesztését, módosítsd az árat, dátumot, időt és a helyek számát, mentsd.
  2. Ellenőrizd, majd állítsd vissza a helyek számát 4-re (a későbbi tesztek ezt várják).
- **Elvárt eredmény:**
  - Minden módosítás mentésre kerül és látszik.
  - DB: a listings sor frissült, updated_at új.

### TC-HIRD-012
**Induló és célállomás nem módosítható**

- **Forrás:** spec 4.11 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Döntési tábla
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP (foglalás nélkül).
- **Tesztadat:** —
- **Lépések:**
  1. Nyisd meg a szerkesztő űrlapot, keresd az induló és célállomás mezőt.
  2. API-n próbáld a from_city / to_city mezőt frissíteni (REST update).
- **Elvárt eredmény:**
  - A felületen nem szerkeszthető.
  - API-n elutasítva vagy hatástalan; DB változatlan.

### TC-HIRD-013
**Foglalás után az ár, dátum és idő zárolt (felület)**

- **Forrás:** KAN-21; spec 4.11 (v8) · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT: U1 1 helyet foglalt.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg H-FOGLALT szerkesztését.
- **Elvárt eredmény:**
  - Az ár, dátum és idő mező nem szerkeszthető, a felület jelzi az okot.
  - A helyek száma szerkeszthető.

### TC-HIRD-014
**Foglalás után a helyek száma a lefoglalt és a férőhely között állítható**

- **Forrás:** spec 4.11 (v8); KAN-21 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT aktív foglalásokkal; B = az aktív foglalásokban lefoglalt helyek összege (a futás aktuális állapotából, DB-ből), J-A = 4.
- **Tesztadat:** Helyek: B−1, B, B+1 (ha ≤ 4), 4, 5
- **Lépések:**
  1. Kérdezd le B értékét.
  2. S-ként állítsd a helyek számát egyenként B−1, B, B+1, 4, 5-re, és próbáld menteni.
  3. A végén állítsd vissza 4-re.
- **Elvárt eredmény:**
  - B−1 (a lefoglalt alatt) és 5 (férőhely felett) elutasítva, érthető üzenettel.
  - B, B+1 és 4 elfogadva.
  - DB: seats_total mindig a legutóbbi sikeres értéken.
- **Megjegyzés:** A KAN-4/KAN-21 story még „csak növelhető”-t ír; a v8-as spec szerint csökkenthető is a lefoglalt számig — a spec az orákulum (SQ-11).

### TC-HIRD-015
**Szerver: zárolt hirdetés árának / dátumának módosítása API-n**

- **Forrás:** KAN-21; spec 4.11 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT foglalással.
- **Tesztadat:** update_listing: új ár; új dátum
- **Lépések:**
  1. S nevében hívd az update_listing RPC-t új árral, majd új dátummal.
- **Elvárt eredmény:**
  - Mindkét hívás hibával elutasítva.
  - DB változatlan.

### TC-HIRD-016
**Szerver: helyek csökkentése a lefoglalt alá API-n**

- **Forrás:** spec 4.11 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT 2 lefoglalt hellyel.
- **Tesztadat:** update_listing seats_total = 1
- **Lépések:**
  1. S nevében hívd az update_listing RPC-t 1 hellyel.
- **Elvárt eredmény:**
  - Hiba: „nem csökkenthető a már lefoglalt helyek alá”. DB változatlan.

### TC-HIRD-017
**Hirdetés-módosításról nem megy e-mail értesítés**

- **Forrás:** KAN-4; spec 3.8, 4.11, 4.15 (v11) · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Használati eset
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT, U1 aktív foglalással; egy foglalás nélküli hirdetés (H-ALAP a foglalások előtt).
- **Tesztadat:** Helyek száma +1 (H-FOGLALT); ár módosítása (H-ALAP)
- **Lépések:**
  1. S-ként növeld H-FOGLALT helyeinek számát, mentsd.
  2. S-ként módosítsd H-ALAP árát (még foglalás nélkül), mentsd.
  3. Nézd meg az Edge Function naplót a két művelet időablakára.
- **Elvárt eredmény:**
  - Egyik módosítás sem vált ki értesítést: a naplóban nincs notify-booking hívás, sem a sofőr, sem az utasok nem kapnak levelet.
- **Megjegyzés:** SQ-1 lezárva (v11): hirdetés-módosításról nincs értesítés.

### TC-HIRD-018
**Saját hirdetés „Saját hirdetés” jelölést kap a listán**

- **Forrás:** spec 4.24, 4.8 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve, H-ALAP létezik.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg a főoldali listát.
  2. Jelentkezz be U1-ként, nézd meg ugyanazt a kártyát.
- **Elvárt eredmény:**
  - S-nél a saját kártyán jól látható „Saját hirdetés” jelölés van.
  - U1-nél ez a jelölés nincs.

### TC-HIRD-019
**Saját hirdetés részletes nézetén nincs foglalási doboz**

- **Forrás:** spec 4.24, 4.4 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve, H-ALAP.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg H-ALAP részletes nézetét.
- **Elvárt eredmény:**
  - A helyszám-választó és a „Hely foglalása” gomb nem jelenik meg.

### TC-HIRD-020
**Elindult hirdetés nem szerkeszthető**

- **Forrás:** migráció: prevent_actions_on_departed_listings; spec 4.19 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-LEJAR indulási ideje elmúlt.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként próbáld szerkeszteni H-LEJAR-t a felületen és update_listing hívással.
- **Elvárt eredmény:**
  - A szerkesztés nem lehetséges; API: hiba. DB változatlan.

### TC-HIRD-021
**Dupla kattintás a mentés gombon nem hoz létre két hirdetést**

- **Forrás:** Hibasejtés · **Prioritás:** P2 · **Típus:** Hibasejtés · **Technika:** Hibasejtés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, J-A.
- **Tesztadat:** QA_Budapest → Eger, ma+21
- **Lépések:**
  1. Töltsd ki a létrehozás űrlapot, és kattints kétszer gyorsan a mentés gombra.
- **Elvárt eredmény:**
  - Pontosan egy hirdetés jön létre (DB-ben is).
