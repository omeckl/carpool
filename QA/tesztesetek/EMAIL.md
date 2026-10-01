# EMAIL — E-mail értesítések és sablonok

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 5 · P1: 1 · P2: 4 · P3: 0 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-EMAIL-001](#tc-email-001) | Sablon-mátrix: minden művelet a helyes e-mail sablont váltja ki | P1 | Supabase + postafiók |
| [TC-EMAIL-002](#tc-email-002) | Minden megkapott levél magyar nyelvű és Telekocsi-azonosítású | P2 | Böngésző (postafiók) |
| [TC-EMAIL-003](#tc-email-003) | A regisztráció-megerősítő levél magyar és Telekocsi-azonosítású | P2 | Böngésző (postafiók) |
| [TC-EMAIL-004](#tc-email-004) | A kívülálló semmilyen művelet során nem kap levelet | P2 | Supabase |
| [TC-EMAIL-005](#tc-email-005) | Az e-mail-küldés hibája nem akadályozza a műveletet | P2 | Supabase |

### TC-EMAIL-001
**Sablon-mátrix: minden művelet a helyes e-mail sablont váltja ki**

- **Forrás:** KAN-15, KAN-16, KAN-31; spec 4.15, 4.23 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Döntési tábla
- **Mód:** Supabase + postafiók · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás FOGL/LEMOND tesztjei lefutottak.
- **Tesztadat:** Edge Function napló (notify-booking) a futás időablakára
- **Lépések:**
  1. Gyűjtsd össze a naplóból a futás összes eseményét (event, target, ok).
  2. Párosítsd a kiváltó tesztesettel.
- **Elvárt eredmény:**
  - Új foglalás → booking_created; ismételt foglalás és helyszám-módosítás → booking_updated; utas lemondása és 0-ra csökkentés → booking_cancelled; hirdetés törlése → egyetlen listing_cancelled.
  - Váratlan vagy hiányzó esemény nincs.

### TC-EMAIL-002
**Minden megkapott levél magyar nyelvű és Telekocsi-azonosítású**

- **Forrás:** KAN-16; spec 4.15 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Ellenőrzőlista
- **Mód:** Böngésző (postafiók) · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** A futás levelei megérkeztek S, U1, U2 postafiókjába.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd végig a futás összes levelét (a felhasználó osztja meg a postafiókokból).
- **Elvárt eredmény:**
  - Minden levél magyar, a tárgy és a feladó egyértelműen Telekocsi; nincs angol sablonszöveg vagy kitöltetlen változó.

### TC-EMAIL-003
**A regisztráció-megerősítő levél magyar és Telekocsi-azonosítású**

- **Forrás:** KAN-16; spec 4.15 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Ellenőrzőlista
- **Mód:** Böngésző (postafiók) · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** TC-AUTH-001 megerősítő levele.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd meg a megerősítő levél tárgyát, feladóját és szövegét.
- **Elvárt eredmény:**
  - Magyar nyelvű, Telekocsi-azonosítású.

### TC-EMAIL-004
**A kívülálló semmilyen művelet során nem kap levelet**

- **Forrás:** spec 4.6 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás lefutott; K nem foglalt S hirdetéseire (TC-FOGL-018 kivételével).
- **Tesztadat:** Napló
- **Lépések:**
  1. Szűrd a naplót K címére / azonosítójára.
- **Elvárt eredmény:**
  - K csak a saját foglalásával kapcsolatos levelet kapta (TC-FOGL-018); más szereplők műveleteiről nem kap levelet.

### TC-EMAIL-005
**Az e-mail-küldés hibája nem akadályozza a műveletet**

- **Forrás:** e-mail infrastruktúra: a hiba lenyelése · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Hibasejtés
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** TC-FOGL-018 (K-nak nem jóváhagyott Mailgun-cím).
- **Tesztadat:** Napló
- **Lépések:**
  1. Nézd meg a naplóban K levelének hibáját és a foglalás állapotát.
- **Elvárt eredmény:**
  - A Mailgun elutasította K levelét (403), de a foglalás létrejött és aktív.
