# KONT — Kontaktadatok és rendszám láthatósága

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 8 · P1: 7 · P2: 1 · P3: 0 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-KONT-001](#tc-kont-001) | Foglalás-visszaigazoló e-mail tartalma az utasnak | P1 | Böngésző (postafiók) |
| [TC-KONT-002](#tc-kont-002) | Új foglalás e-mail tartalma a sofőrnek | P1 | Böngésző (postafiók) |
| [TC-KONT-003](#tc-kont-003) | A foglaló utas látja a rendszámot és a sofőr elérhetőségét | P1 | Böngésző |
| [TC-KONT-004](#tc-kont-004) | Nem foglaló felhasználó nem látja a rendszámot és a kontaktadatokat | P1 | Böngésző |
| [TC-KONT-005](#tc-kont-005) | Vendég nem látja a rendszámot és a kontaktadatokat | P1 | Böngésző |
| [TC-KONT-006](#tc-kont-006) | Szerver: rendszám és telefon nem kérdezhető le jogosulatlanul API-n | P1 | Supabase |
| [TC-KONT-007](#tc-kont-007) | Utasaim listán az utas telefonszáma és e-mail címe látszik | P2 | Böngésző |
| [TC-KONT-008](#tc-kont-008) | Lemondás / törlés után az egykori utas már nem látja a rendszámot és a kontaktadatokat | P1 | Böngésző + Supabase |

### TC-KONT-001
**Foglalás-visszaigazoló e-mail tartalma az utasnak**

- **Forrás:** KAN-7, KAN-23; spec 3.6, 4.6, 4.15 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző (postafiók) · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** TC-FOGL-001 lefutott (U1 levele).
- **Tesztadat:** U1 postafiók (omeckl@yahoo.com) — a felhasználó osztja meg
- **Lépések:**
  1. Nyisd meg U1 foglalás-visszaigazoló levelét.
- **Elvárt eredmény:**
  - Magyar nyelvű, a tárgy/feladó egyértelműen Telekocsi.
  - Tartalmazza: sofőr neve, útvonal, dátum/idő, jármű, rendszám (QAA-101), végösszeg, sofőr telefonszáma ÉS e-mail címe.

### TC-KONT-002
**Új foglalás e-mail tartalma a sofőrnek**

- **Forrás:** KAN-7, KAN-23; spec 4.6 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző (postafiók) · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** TC-FOGL-001 lefutott (S levele).
- **Tesztadat:** jfkovesi@gmail.com postafiók
- **Lépések:**
  1. Nyisd meg S új utas értesítőjét.
- **Elvárt eredmény:**
  - Magyar, Telekocsi-branding.
  - Tartalmazza: utas neve, foglalt helyek, útvonal/dátum, utas telefonszáma ÉS e-mail címe.

### TC-KONT-003
**A foglaló utas látja a rendszámot és a sofőr elérhetőségét**

- **Forrás:** KAN-3, KAN-7; spec 4.7 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1 aktív foglalással H-FOGLALT-on.
- **Tesztadat:** —
- **Lépések:**
  1. U1-ként nézd meg a Foglalásaim oldalt és a hirdetés részleteit.
- **Elvárt eredmény:**
  - A rendszám (QAA-101), a sofőr telefonszáma és e-mail címe látszik.

### TC-KONT-004
**Nem foglaló felhasználó nem látja a rendszámot és a kontaktadatokat**

- **Forrás:** KAN-3; spec 4.7, 2.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Részben · **E-mail (db):** 0
- **Előfeltétel:** K bejelentkezve, nincs foglalása H-FOGLALT-on.
- **Tesztadat:** —
- **Lépések:**
  1. K-ként nyisd meg H-FOGLALT részleteit.
  2. Nézd meg az oldal forrását / hálózati válaszait is.
- **Elvárt eredmény:**
  - Rendszám, sofőr telefon és e-mail nem látszik a felületen.
  - A hálózati válaszokban sem szerepel (nem csak elrejtve).

### TC-KONT-005
**Vendég nem látja a rendszámot és a kontaktadatokat**

- **Forrás:** spec 4.7 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Részben · **E-mail (db):** 0
- **Előfeltétel:** V (kijelentkezve).
- **Tesztadat:** H-FOGLALT
- **Lépések:**
  1. Kijelentkezve nyisd meg a hirdetést (ha elérhető), nézd a hálózati válaszokat is.
- **Elvárt eredmény:**
  - Rendszám, telefon, e-mail sem a felületen, sem a hálózati válaszokban nem jelenik meg.

### TC-KONT-006
**Szerver: rendszám és telefon nem kérdezhető le jogosulatlanul API-n**

- **Forrás:** spec 4.7, 2.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K munkamenete (nincs foglalása H-FOGLALT-on) és anon munkamenet.
- **Tesztadat:** REST: listings (car_plate), vehicles, profiles (phone), my_* nézetek, ride details RPC/nézet
- **Lépések:**
  1. K nevében és anonim módon kérdezd le a listings tábla car_plate mezőjét H-FOGLALT-ra.
  2. Kérdezd le S profiles sorát (phone).
  3. Kérdezd le a vehicles táblát J-A-ra.
  4. Hívd a hirdetés-részletező RPC-t / nézetet H-FOGLALT-ra.
- **Elvárt eredmény:**
  - Egyik lekérdezés sem ad vissza rendszámot, telefonszámot vagy e-mail címet K-nak vagy anon felhasználónak.
- **Megjegyzés:** Kritikus súlyosságú, ha bármelyik adatot visszaadja.

### TC-KONT-007
**Utasaim listán az utas telefonszáma és e-mail címe látszik**

- **Forrás:** KAN-13, KAN-23; spec 4.16 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S hirdetésein U1 és U2 aktív foglalással.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg az Utasaim oldalt.
- **Elvárt eredmény:**
  - Minden foglalásnál látszik az utas neve, telefonszáma és e-mail címe.

### TC-KONT-008
**Lemondás / törlés után az egykori utas már nem látja a rendszámot és a kontaktadatokat**

- **Forrás:** KAN-3, KAN-7; spec 4.6, 4.7 (v11) · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U2-nek Lemondva állapotú foglalása van H-FOGLALT-on, más aktív foglalása nincs rajta.
- **Tesztadat:** —
- **Lépések:**
  1. U2-ként nézd meg a Foglalásaim korábbi blokkját és a hirdetés részleteit.
- **Elvárt eredmény:**
  - U2 a felületen (Foglalásaim korábbi blokk, hirdetés részletei) nem látja a rendszámot, a sofőr telefonszámát és e-mail címét.
  - A hálózati válaszokban és U2 munkamenetével API-n (my_bookings, részletező RPC) sem kapja meg ezeket.
  - Ugyanez igaz a „Törölt” foglalásra (U1/U2 a TC-LEMOND-004 után).
- **Megjegyzés:** SQ-7 lezárva (v11): csak aktív foglalásnál látható. Személyes adat → eltérés esetén legalább Magas súlyosság.
