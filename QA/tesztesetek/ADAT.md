# ADAT — Adatintegritási invariánsok, valódi fiókok védelme

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 6 · P1: 6 · P2: 0 · P3: 0 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-ADAT-001](#tc-adat-001) | Invariáns: a foglalt helyek összege nem haladja meg a hirdetés helyeit | P1 | Supabase |
| [TC-ADAT-002](#tc-adat-002) | Invariáns: a hirdetés helyei nem haladják meg a jármű férőhelyét | P1 | Supabase |
| [TC-ADAT-003](#tc-adat-003) | Invariáns: egy utasnak egy hirdetésen legfeljebb egy aktív foglalása van | P1 | Supabase |
| [TC-ADAT-004](#tc-adat-004) | Invariáns: nincs saját hirdetésre szóló foglalás | P1 | Supabase |
| [TC-ADAT-005](#tc-adat-005) | Invariáns: törölt hirdetésen nincs aktív foglalás | P1 | Supabase |
| [TC-ADAT-006](#tc-adat-006) | A szereplők teszt előtti adatai változatlanok | P1 | Supabase |

### TC-ADAT-001
**Invariáns: a foglalt helyek összege nem haladja meg a hirdetés helyeit**

- **Forrás:** spec 4.1 · **Prioritás:** P1 · **Típus:** Regresszió · **Technika:** Invariáns
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás végén.
- **Tesztadat:** Összes hirdetés (csak olvasás)
- **Lépések:**
  1. Futtasd a qa/db/invariansok.sql megfelelő lekérdezését.
- **Elvárt eredmény:**
  - Üres eredmény.

### TC-ADAT-002
**Invariáns: a hirdetés helyei nem haladják meg a jármű férőhelyét**

- **Forrás:** spec 4.1, 4.2 · **Prioritás:** P1 · **Típus:** Regresszió · **Technika:** Invariáns
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás végén.
- **Tesztadat:** Aktív hirdetések
- **Lépések:**
  1. Futtasd a lekérdezést.
- **Elvárt eredmény:**
  - Üres eredmény.

### TC-ADAT-003
**Invariáns: egy utasnak egy hirdetésen legfeljebb egy aktív foglalása van**

- **Forrás:** spec 4.23 · **Prioritás:** P1 · **Típus:** Regresszió · **Technika:** Invariáns
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás végén.
- **Tesztadat:** Aktív foglalások
- **Lépések:**
  1. Futtasd a lekérdezést.
- **Elvárt eredmény:**
  - Üres eredmény (a v7 előtti, migrálatlan régi adatok külön jelölve, nem hibaként).

### TC-ADAT-004
**Invariáns: nincs saját hirdetésre szóló foglalás**

- **Forrás:** spec 4.4 · **Prioritás:** P1 · **Típus:** Regresszió · **Technika:** Invariáns
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás végén.
- **Tesztadat:** —
- **Lépések:**
  1. Futtasd a lekérdezést.
- **Elvárt eredmény:**
  - Üres eredmény.

### TC-ADAT-005
**Invariáns: törölt hirdetésen nincs aktív foglalás**

- **Forrás:** spec 4.12, 4.21 · **Prioritás:** P1 · **Típus:** Regresszió · **Technika:** Invariáns
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás végén.
- **Tesztadat:** —
- **Lépések:**
  1. Futtasd a lekérdezést.
- **Elvárt eredmény:**
  - Üres eredmény.

### TC-ADAT-006
**A szereplők teszt előtti adatai változatlanok**

- **Forrás:** SKILL.md 2.6 (valódi fiókok védelme) · **Prioritás:** P1 · **Típus:** Regresszió · **Technika:** Adat-ellenőrzés
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** A futás elején elkészült leltár S, U1, U2 meglévő adatairól.
- **Tesztadat:** Leltár-összevetés
- **Lépések:**
  1. A futás végén ismételd meg a leltárt, és hasonlítsd össze a kezdetivel (a QA_ adatok kivételével).
- **Elvárt eredmény:**
  - A profilok, a nem QA_ járművek, hirdetések és foglalások változatlanok.
