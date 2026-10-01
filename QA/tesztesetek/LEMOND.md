# LEMOND — Lemondás, hirdetés törlése, megerősítő ablakok

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 7 · P1: 4 · P2: 3 · P3: 0 · becsült e-mail: 9

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-LEMOND-001](#tc-lemond-001) | Utas lemondása — a Mégse nem változtat semmit | P1 | Böngésző + Supabase |
| [TC-LEMOND-002](#tc-lemond-002) | Utas lemondása megerősítéssel | P1 | Böngésző + Supabase |
| [TC-LEMOND-003](#tc-lemond-003) | Hirdetés törlése — a Mégse nem változtat semmit | P1 | Böngésző + Supabase |
| [TC-LEMOND-004](#tc-lemond-004) | Hirdetés törlése foglalásokkal — a foglalások „Törölt” állapotba kerülnek | P1 | Böngésző + Supabase |
| [TC-LEMOND-005](#tc-lemond-005) | Törölt hirdetés foglaltság-pillanatképe | P2 | Böngésző + Supabase |
| [TC-LEMOND-006](#tc-lemond-006) | Elindult út foglalása nem mondható le, hirdetése nem törölhető | P2 | Böngésző + Supabase |
| [TC-LEMOND-007](#tc-lemond-007) | Már lemondott foglalás ismételt lemondása | P2 | Supabase |

### TC-LEMOND-001
**Utas lemondása — a Mégse nem változtat semmit**

- **Forrás:** KAN-18; spec 4.18 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1 aktív foglalással H-FOGLALT-on.
- **Tesztadat:** —
- **Lépések:**
  1. U1-ként kattints a Lemondás gombra.
  2. A megerősítő ablakban nyomd a Mégse gombot.
- **Elvárt eredmény:**
  - Saját (nem natív) megerősítő ablak jelenik meg.
  - Mégse után a foglalás aktív, a helyek száma változatlan, nincs e-mail.

### TC-LEMOND-002
**Utas lemondása megerősítéssel**

- **Forrás:** KAN-8; spec 4.5, 4.21 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** U1 aktív foglalással H-FOGLALT-on.
- **Tesztadat:** —
- **Lépések:**
  1. U1-ként mondd le a foglalást, erősítsd meg.
- **Elvárt eredmény:**
  - A foglalás „Lemondva” állapotú, a Foglalásaim korábbi blokkjában látszik (nem tűnik el).
  - A hely felszabadul a hirdetésen.
  - S értesítést kap; U1 visszaigazolást kap (booking_cancelled).

### TC-LEMOND-003
**Hirdetés törlése — a Mégse nem változtat semmit**

- **Forrás:** KAN-18; spec 4.18 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-TOROL aktív, U1 és U2 foglalással.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként kattints H-TOROL törlésére, a megerősítő ablakban nyomd a Mégse gombot.
- **Elvárt eredmény:**
  - A hirdetés és a foglalások változatlanul aktívak; nincs e-mail.

### TC-LEMOND-004
**Hirdetés törlése foglalásokkal — a foglalások „Törölt” állapotba kerülnek**

- **Forrás:** KAN-8, KAN-29; spec 4.12, 4.21 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 7
- **Előfeltétel:** H-TOROL: QA_Budapest → Eger, ma+20, J-A, U1 1 hely + U2 1 hely.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként töröld H-TOROL-t, erősítsd meg.
  2. Nézd meg U1 és U2 Foglalásaim oldalát, S Utasaim és Hirdetéseim oldalát.
  3. Nézd meg az Edge Function naplót.
- **Elvárt eredmény:**
  - A hirdetés törölt; U1 és U2 foglalása „Törölt” címkével látszik (NEM „Lemondva”, és nem tűnik el).
  - Pontosan EGY listing_cancelled esemény fut; booking_cancelled esemény NEM fut.
  - S „Hirdetésed törölve”, U1 és U2 „A sofőr törölte az utat” levelet kap.
- **Megjegyzés:** E-mail: 4 a két beállító foglalás + 3 a törlés.

### TC-LEMOND-005
**Törölt hirdetés foglaltság-pillanatképe**

- **Forrás:** spec 4.25 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Adat-ellenőrzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** TC-LEMOND-004 lefutott (2 hely volt foglalva).
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nézd meg a Hirdetéseim korábbi blokkjában H-TOROL kártyáját.
  2. Kérdezd le a listings sor pillanatkép-mezőjét.
- **Elvárt eredmény:**
  - A kártyán „· 2 foglalás volt” (vagy a Lejárt kártyákkal azonos formátum, 2-es értékkel).
  - DB: a pillanatkép-mező = 2.
- **Megjegyzés:** A KAN-20/KAN-30 story még azt írja, hogy törölt kártyán nincs foglalás-szám — a v9-es spec (4.25) felülírja (SQ-10).

### TC-LEMOND-006
**Elindult út foglalása nem mondható le, hirdetése nem törölhető**

- **Forrás:** KAN-8; spec 4.5, 4.12 (v11) · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-LEJAR elindult, U1 aktív (most már Lejárt) foglalással.
- **Tesztadat:** —
- **Lépések:**
  1. U1-ként próbáld lemondani a foglalást (felületen és cancel_booking hívással).
  2. S-ként próbáld törölni H-LEJAR-t.
- **Elvárt eredmény:**
  - Mindkét művelet tiltott; DB változatlan; nincs e-mail.
- **Megjegyzés:** SQ-9 lezárva (v11): elindult hirdetés a sofőr által sem törölhető.

### TC-LEMOND-007
**Már lemondott foglalás ismételt lemondása**

- **Forrás:** spec 2.4 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1-nek Lemondva állapotú foglalása van.
- **Tesztadat:** cancel_booking(lemondott)
- **Lépések:**
  1. U1 nevében hívd a cancel_booking RPC-t a már lemondott foglalásra.
- **Elvárt eredmény:**
  - Hiba vagy hatástalan hívás; nem megy újabb e-mail; a felszabadult helyek száma nem nő még egyszer.
