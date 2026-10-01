# JARMU — Járművek kezelése

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 10 · P1: 5 · P2: 5 · P3: 0 · becsült e-mail: 1

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-JARMU-001](#tc-jarmu-001) | Jármű hozzáadása | P1 | Böngésző + Supabase |
| [TC-JARMU-002](#tc-jarmu-002) | Második jármű hozzáadása — mindkettő elérhető marad | P2 | Böngésző |
| [TC-JARMU-003](#tc-jarmu-003) | Férőhely határértékei | P2 | Böngésző + Supabase |
| [TC-JARMU-004](#tc-jarmu-004) | Kötelező mezők (típus, rendszám) üresen | P2 | Böngésző |
| [TC-JARMU-005](#tc-jarmu-005) | Jármű szerkesztése, amikor nincs aktív hirdetése | P1 | Böngésző + Supabase |
| [TC-JARMU-006](#tc-jarmu-006) | Jármű törlése, amikor nincs aktív hirdetése — megerősítéssel | P2 | Böngésző + Supabase |
| [TC-JARMU-007](#tc-jarmu-007) | Aktív hirdetéssel rendelkező jármű nem szerkeszthető a felületen | P1 | Böngésző |
| [TC-JARMU-008](#tc-jarmu-008) | Aktív hirdetéssel rendelkező jármű nem törölhető a felületen | P1 | Böngésző |
| [TC-JARMU-009](#tc-jarmu-009) | Szerver: aktív hirdetéses jármű módosítása és törlése API-n elutasítva | P1 | Supabase |
| [TC-JARMU-010](#tc-jarmu-010) | Jármű, amelynek csak törölt hirdetése van, újra szerkeszthető és törölhető | P2 | Böngésző |

### TC-JARMU-001
**Jármű hozzáadása**

- **Forrás:** KAN-3; spec 2.2 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve. S meglévő járműveinek leltára elkészült.
- **Tesztadat:** J-A: típus 'QA_Skoda Octavia', férőhely 4, rendszám 'QAA-101'
- **Lépések:**
  1. Nyisd meg a Járműveim oldalt.
  2. Add hozzá a J-A járművet.
  3. Frissítsd az oldalt.
- **Elvárt eredmény:**
  - A jármű megjelenik a Járműveim listában a megadott adatokkal (frissítés után is).
  - DB: vehicles sor S tulajdonában, seats = 4.

### TC-JARMU-002
**Második jármű hozzáadása — mindkettő elérhető marad**

- **Forrás:** KAN-3 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** TC-JARMU-001 kész.
- **Tesztadat:** J-B: 'QA_Suzuki Swift', férőhely 2, 'QAA-102'
- **Lépések:**
  1. Add hozzá a J-B járművet.
- **Elvárt eredmény:**
  - J-A és J-B is látszik a listában; S korábbi járművei is változatlanul megvannak.
  - A hirdetés-létrehozásnál mindkettő választható.

### TC-JARMU-003
**Férőhely határértékei**

- **Forrás:** KAN-3; séma: seats 1–8 · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve.
- **Tesztadat:** Férőhely: 0, 1, 8, 9, -1, 2.5, üres
- **Lépések:**
  1. Próbálj járművet felvenni egyenként a megadott férőhely-értékekkel.
- **Elvárt eredmény:**
  - 1 és 8 elfogadott; 0, 9, -1, 2.5, üres elutasítva érthető üzenettel.
  - DB: érvénytelen értékkel nem jön létre sor.
- **Megjegyzés:** Az elfogadott 1 és 8 férőhelyes QA járműveket a teszt után töröld.

### TC-JARMU-004
**Kötelező mezők (típus, rendszám) üresen**

- **Forrás:** KAN-3 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve.
- **Tesztadat:** Üres típus; üres rendszám; csak szóköz
- **Lépések:**
  1. Próbálj járművet felvenni hiányzó típussal, majd hiányzó rendszámmal.
- **Elvárt eredmény:**
  - Nem jön létre jármű, a hiányzó mező jelölve van.

### TC-JARMU-005
**Jármű szerkesztése, amikor nincs aktív hirdetése**

- **Forrás:** KAN-3, KAN-28; spec 4.13 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Döntési tábla
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** J-B-nek nincs aktív hirdetése.
- **Tesztadat:** J-B új adatok: 'QA_Suzuki Swift Sport', férőhely 3, 'QAA-103'
- **Lépések:**
  1. Nyisd meg J-B szerkesztését.
  2. Módosítsd mindhárom mezőt, mentsd.
- **Elvárt eredmény:**
  - A módosítás mentésre kerül és a listában látszik.
  - DB: a vehicles sor frissült.

### TC-JARMU-006
**Jármű törlése, amikor nincs aktív hirdetése — megerősítéssel**

- **Forrás:** KAN-28; spec 4.13, 4.18 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** J-B-nek nincs aktív hirdetése.
- **Tesztadat:** J-B
- **Lépések:**
  1. Kattints J-B törlésére.
  2. A megerősítő ablakban nyomd a Mégse gombot.
  3. Ellenőrizd, hogy J-B megvan.
  4. Töröld újra, most erősítsd meg.
- **Elvárt eredmény:**
  - Mégse után J-B változatlanul megvan.
  - Megerősítés után J-B eltűnik; DB: a sor törölve.
  - Natív böngésző-dialógus nem jelenik meg (saját megerősítő ablak).

### TC-JARMU-007
**Aktív hirdetéssel rendelkező jármű nem szerkeszthető a felületen**

- **Forrás:** KAN-28; spec 4.13 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** J-A-hoz tartozik aktív hirdetés (H-ALAP).
- **Tesztadat:** J-A
- **Lépések:**
  1. Nyisd meg a Járműveim oldalt, próbáld szerkeszteni J-A-t.
- **Elvárt eredmény:**
  - A szerkesztés nem érhető el (gomb letiltva/elrejtve), és a felület jelzi az okot (aktív hirdetés).

### TC-JARMU-008
**Aktív hirdetéssel rendelkező jármű nem törölhető a felületen**

- **Forrás:** KAN-28; spec 4.13 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** J-A-hoz tartozik aktív hirdetés.
- **Tesztadat:** J-A
- **Lépések:**
  1. Próbáld törölni J-A-t.
- **Elvárt eredmény:**
  - A törlés nem érhető el, és a felület jelzi az okot.

### TC-JARMU-009
**Szerver: aktív hirdetéses jármű módosítása és törlése API-n elutasítva**

- **Forrás:** KAN-28 (4. krit.); spec 4.13 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** J-A-hoz aktív hirdetés tartozik. S munkamenete (anon kulcs + S tokenje).
- **Tesztadat:** J-A azonosító
- **Lépések:**
  1. S nevében hívd meg a jármű-módosítást (RPC vagy REST update) J-A-ra új férőhellyel.
  2. S nevében próbáld törölni J-A-t REST-en.
- **Elvárt eredmény:**
  - Mindkét kérés hibával elutasítva.
  - DB: J-A adatai változatlanok, a sor megvan.

### TC-JARMU-010
**Jármű, amelynek csak törölt hirdetése van, újra szerkeszthető és törölhető**

- **Forrás:** KAN-28 (3. krit.); spec 4.13 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 1
- **Előfeltétel:** Egy QA járműhöz (pl. J-C, 1 férőhely) csak törölt (cancelled) hirdetés tartozik.
- **Tesztadat:** J-C: 'QA_Fiat 500', 1, 'QAA-104'
- **Lépések:**
  1. Hozz létre J-C-t, adj fel rá hirdetést, töröld a hirdetést.
  2. Szerkeszd J-C-t, majd töröld.
- **Elvárt eredmény:**
  - A szerkesztés és a törlés is sikeres.
  - A törölt hirdetés a Hirdetéseim korábbi blokkjában továbbra is látszik.
- **Megjegyzés:** A hirdetés-törlés 1 e-mailt küld S-nek. A lejárt-hirdetéses ág a H-LEJAR után ellenőrizhető ugyanígy.
