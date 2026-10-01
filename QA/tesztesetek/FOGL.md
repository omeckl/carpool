# FOGL — Foglalás, módosítás, ismételt foglalás, párhuzamosság

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 19 · P1: 11 · P2: 8 · P3: 0 · becsült e-mail: 32

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-FOGL-001](#tc-fogl-001) | Sikeres foglalás 1 helyre — azonnal, jóváhagyás nélkül | P1 | Böngésző + Supabase |
| [TC-FOGL-002](#tc-fogl-002) | Foglalás több helyre egyszerre | P2 | Böngésző + Supabase |
| [TC-FOGL-003](#tc-fogl-003) | Kapacitás feletti foglalás elutasítása (felület) | P1 | Böngésző |
| [TC-FOGL-004](#tc-fogl-004) | Szerver: kapacitás feletti foglalás API-n elutasítva | P1 | Supabase |
| [TC-FOGL-005](#tc-fogl-005) | Szerver: sofőr nem foglalhat a saját hirdetésére | P1 | Supabase |
| [TC-FOGL-006](#tc-fogl-006) | Szerver: 0 vagy negatív helyre nem lehet foglalni | P2 | Supabase |
| [TC-FOGL-007](#tc-fogl-007) | Ismételt foglalás ugyanarra a hirdetésre a meglévő foglalást módosítja | P1 | Böngésző + Supabase |
| [TC-FOGL-008](#tc-fogl-008) | Ismételt foglalás, amely túllépné a kapacitást, elutasítva | P1 | Böngésző + Supabase |
| [TC-FOGL-009](#tc-fogl-009) | Foglalás növelése a Foglalásaim oldalon a szabad helyek erejéig | P1 | Böngésző + Supabase |
| [TC-FOGL-010](#tc-fogl-010) | Szerver: foglalás-módosítás a kapacitás felett API-n | P1 | Supabase |
| [TC-FOGL-011](#tc-fogl-011) | Foglalás csökkentése felszabadítja a helyeket | P2 | Böngésző + Supabase |
| [TC-FOGL-012](#tc-fogl-012) | Foglalás nullára csökkentése = lemondás, célzott megerősítő kérdéssel | P1 | Böngésző + Supabase |
| [TC-FOGL-013](#tc-fogl-013) | Lemondott foglalás nem módosítható | P2 | Supabase |
| [TC-FOGL-014](#tc-fogl-014) | Elindult hirdetésre nem lehet foglalni | P2 | Böngésző + Supabase |
| [TC-FOGL-015](#tc-fogl-015) | Törölt hirdetésre nem lehet foglalni | P2 | Supabase |
| [TC-FOGL-016](#tc-fogl-016) | Párhuzamos foglalás az utolsó helyre — nincs túlfoglalás | P1 | Supabase |
| [TC-FOGL-017](#tc-fogl-017) | Párhuzamos ismételt foglalás ugyanattól az utastól — egy aktív foglalás marad | P1 | Supabase |
| [TC-FOGL-018](#tc-fogl-018) | Dupla kattintás a Foglalás gombon | P2 | Böngésző + Supabase |
| [TC-FOGL-019](#tc-fogl-019) | Vendég nem tud foglalni | P2 | Böngésző |

### TC-FOGL-001
**Sikeres foglalás 1 helyre — azonnal, jóváhagyás nélkül**

- **Forrás:** KAN-6; spec 3.5, 4.3 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** H-FOGLALT (4 hely, foglalás nélkül). U1 bejelentkezve.
- **Tesztadat:** H-FOGLALT: QA_Budapest → Szeged, ma+10 09:00; 1 hely
- **Lépések:**
  1. U1-ként nyisd meg H-FOGLALT részleteit.
  2. Foglalj 1 helyet.
- **Elvárt eredmény:**
  - A foglalás azonnal létrejön, visszajelzés jelenik meg.
  - A szabad helyek száma 4-ről 3-ra csökken.
  - U1 Foglalásaim oldalán Aktív foglalásként látszik.
  - DB: egy bookings sor, status = active, seats_booked = 1.
  - Mindkét fél megkapja a booking_created e-mailt (naplóban ok:true).

### TC-FOGL-002
**Foglalás több helyre egyszerre**

- **Forrás:** KAN-6; spec 2.4 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** H-FOGLALT 3 szabad hellyel. U2 bejelentkezve.
- **Tesztadat:** 2 hely
- **Lépések:**
  1. U2-ként foglalj 2 helyet H-FOGLALT-ra.
- **Elvárt eredmény:**
  - A foglalás 2 hellyel jön létre; a szabad helyek 3-ról 1-re csökkennek.
  - A végösszeg (ha megjelenik) = 2 × ár.

### TC-FOGL-003
**Kapacitás feletti foglalás elutasítása (felület)**

- **Forrás:** KAN-6; spec 4.1 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT 1 szabad hellyel. U1 bejelentkezve (van már foglalása).
- **Tesztadat:** Kért helyek: 2
- **Lépések:**
  1. Próbálj 2 helyet foglalni (vagy a helyválasztóban 2-t kiválasztani).
- **Elvárt eredmény:**
  - A 2 hely nem választható / a foglalás elutasítva, érthető üzenettel.
  - DB változatlan.

### TC-FOGL-004
**Szerver: kapacitás feletti foglalás API-n elutasítva**

- **Forrás:** KAN-6; spec 4.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-SZUK (1 hely, szabad). K munkamenete.
- **Tesztadat:** book_ride(H-SZUK, 2)
- **Lépések:**
  1. K nevében hívd a book_ride RPC-t 2 hellyel.
- **Elvárt eredmény:**
  - Hiba: „Nincs elég szabad hely”. Nem jön létre foglalás, nincs e-mail.

### TC-FOGL-005
**Szerver: sofőr nem foglalhat a saját hirdetésére**

- **Forrás:** KAN-6; spec 4.4 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP. S munkamenete.
- **Tesztadat:** book_ride(H-ALAP, 1)
- **Lépések:**
  1. S nevében hívd a book_ride RPC-t a saját hirdetésére.
- **Elvárt eredmény:**
  - Hiba: „Saját hirdetésedre nem foglalhatsz helyet.” Nincs foglalás, nincs e-mail.

### TC-FOGL-006
**Szerver: 0 vagy negatív helyre nem lehet foglalni**

- **Forrás:** spec 2.4; séma · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP. U1 munkamenete.
- **Tesztadat:** book_ride p_seats = 0, -1
- **Lépések:**
  1. Hívd a book_ride RPC-t 0, majd -1 hellyel.
- **Elvárt eredmény:**
  - Mindkettő hibával elutasítva.

### TC-FOGL-007
**Ismételt foglalás ugyanarra a hirdetésre a meglévő foglalást módosítja**

- **Forrás:** KAN-31; spec 4.23 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 4
- **Előfeltétel:** U1-nek 1 helyes aktív foglalása van H-ALAP-on (4 hely). Az első foglalás időpontja rögzítve.
- **Tesztadat:** +2 hely
- **Lépések:**
  1. U1-ként nyisd meg újra H-ALAP-ot, és foglalj még 2 helyet.
- **Elvárt eredmény:**
  - U1 Foglalásaim oldalán EGY aktív foglalás látszik 3 hellyel.
  - DB: U1-nek pontosan egy aktív bookings sora van H-ALAP-on, seats_booked = 3; created_at a módosítás ideje.
  - S a „módosítás” sablont kapja (booking_updated), NEM az „új foglalás” sablont.
- **Megjegyzés:** E-mail: 2 a kiinduló foglalás + 2 a módosítás.

### TC-FOGL-008
**Ismételt foglalás, amely túllépné a kapacitást, elutasítva**

- **Forrás:** KAN-31; spec 4.23 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1-nek 3 helyes foglalása van H-ALAP-on (4 hely, 1 szabad).
- **Tesztadat:** +2 hely
- **Lépések:**
  1. U1-ként próbálj még 2 helyet foglalni H-ALAP-ra.
- **Elvárt eredmény:**
  - Elutasítva, érthető üzenettel.
  - DB: a meglévő foglalás változatlanul 3 hely, nincs új sor, nincs e-mail.

### TC-FOGL-009
**Foglalás növelése a Foglalásaim oldalon a szabad helyek erejéig**

- **Forrás:** KAN-17; spec 4.17 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** U2-nek 2 helyes foglalása van H-FOGLALT-on; 1 szabad hely maradt.
- **Tesztadat:** Új érték: 3, majd 4
- **Lépések:**
  1. U2-ként a Foglalásaim oldalon szerkeszd a foglalást 3 helyre, mentsd.
  2. Próbáld 4-re növelni.
- **Elvárt eredmény:**
  - 3: sikeres, a szabad helyek 0-ra csökkennek, S módosítás-e-mailt kap.
  - 4: nem választható / elutasítva.

### TC-FOGL-010
**Szerver: foglalás-módosítás a kapacitás felett API-n**

- **Forrás:** KAN-17; spec 4.17 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Szerver oldali validáció
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U2 foglalása H-FOGLALT-on, 0 szabad hely.
- **Tesztadat:** update_booking(+1 a jelenleginél)
- **Lépések:**
  1. U2 nevében hívd az update_booking RPC-t a jelenleginél 1-gyel nagyobb értékkel.
- **Elvárt eredmény:**
  - Hiba; DB változatlan; nincs e-mail.

### TC-FOGL-011
**Foglalás csökkentése felszabadítja a helyeket**

- **Forrás:** KAN-17; spec 4.17 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** U2-nek 3 helyes foglalása van H-FOGLALT-on.
- **Tesztadat:** Új érték: 1
- **Lépések:**
  1. U2-ként csökkentsd a foglalást 1 helyre.
- **Elvárt eredmény:**
  - A foglalás 1 helyes; a hirdetésen 2 hely felszabadul.
  - S módosítás-e-mailt kap (régi/új helyszámmal).

### TC-FOGL-012
**Foglalás nullára csökkentése = lemondás, célzott megerősítő kérdéssel**

- **Forrás:** KAN-17, KAN-18; spec 4.17, 4.18 · **Prioritás:** P1 · **Típus:** Határérték · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** U2-nek 1 helyes aktív foglalása van H-FOGLALT-on.
- **Tesztadat:** Új érték: 0
- **Lépések:**
  1. U2-ként állítsd a foglalást 0-ra.
  2. A megjelenő ablakban nyomd a Mégse gombot, ellenőrizd az állapotot.
  3. Ismételd meg, most erősítsd meg.
- **Elvárt eredmény:**
  - A kérdés szövege: „Törölni akarod a foglalásodat?”.
  - Mégse után a foglalás változatlan.
  - Megerősítés után a foglalás „Lemondva” állapotú, a hely felszabadul, lemondás-e-mail megy (booking_cancelled, nem booking_updated).

### TC-FOGL-013
**Lemondott foglalás nem módosítható**

- **Forrás:** spec 2.4 (állapotok) · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U2-nek van Lemondva állapotú foglalása.
- **Tesztadat:** update_booking(lemondott, 1)
- **Lépések:**
  1. U2 nevében hívd az update_booking RPC-t a lemondott foglalásra.
- **Elvárt eredmény:**
  - Hiba; a foglalás Lemondva marad; nincs e-mail.

### TC-FOGL-014
**Elindult hirdetésre nem lehet foglalni**

- **Forrás:** migráció: prevent_actions_on_departed_listings · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Határérték-elemzés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-LEJAR indulási ideje elmúlt. U2 bejelentkezve.
- **Tesztadat:** book_ride(H-LEJAR, 1)
- **Lépések:**
  1. Próbáld közvetlen URL-lel megnyitni és foglalni a felületen.
  2. Hívd a book_ride RPC-t is.
- **Elvárt eredmény:**
  - A felület nem enged foglalni.
  - API: „Ez a hirdetés már lejárt, nem lehet rá foglalni.”

### TC-FOGL-015
**Törölt hirdetésre nem lehet foglalni**

- **Forrás:** spec 4.12 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-TOROL törölve.
- **Tesztadat:** book_ride(H-TOROL, 1) K nevében
- **Lépések:**
  1. K nevében hívd a book_ride RPC-t a törölt hirdetésre.
- **Elvárt eredmény:**
  - Hiba: „Ez a hirdetés már nem aktív.”

### TC-FOGL-016
**Párhuzamos foglalás az utolsó helyre — nincs túlfoglalás**

- **Forrás:** spec 4.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Párhuzamosság
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 12
- **Előfeltétel:** H-SZUK: 1 szabad hely. U1 és U2 munkamenete.
- **Tesztadat:** U1 és U2 egyszerre book_ride(H-SZUK, 1)
- **Lépések:**
  1. Indítsd el a két foglalást egyszerre (Promise.allSettled).
  2. Ellenőrizd az eredményt és a DB-t.
  3. Szabadítsd fel a helyet (a sikeres foglalás lemondása), és ismételd meg összesen 3×.
- **Elvárt eredmény:**
  - Minden körben pontosan egy foglalás sikeres, a másik hibával elutasítva.
  - A foglalt helyek összege soha nem haladja meg a hirdetés helyeit (invariáns).
- **Megjegyzés:** Minden kör: 2 (foglalás) + 2 (lemondás). 3 kör = 12 e-mail. E-mail-keret miatt legfeljebb 3 kör.

### TC-FOGL-017
**Párhuzamos ismételt foglalás ugyanattól az utastól — egy aktív foglalás marad**

- **Forrás:** spec 4.23 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Párhuzamosság
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 4
- **Előfeltétel:** H-PAR: QA_Budapest → Nyíregyháza, ma+12 11:00, J-A, 4 hely, foglalás nélkül.
- **Tesztadat:** U2 kétszer egyszerre book_ride(H-PAR, 1)
- **Lépések:**
  1. Indítsd a két kérést egyszerre.
- **Elvárt eredmény:**
  - U2-nek pontosan egy aktív foglalása van H-PAR-on, 2 hellyel (vagy 1, ha az egyik kérés elbukott) — két külön aktív sor nem jöhet létre.

### TC-FOGL-018
**Dupla kattintás a Foglalás gombon**

- **Forrás:** Hibasejtés · **Prioritás:** P2 · **Típus:** Hibasejtés · **Technika:** Hibasejtés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Nem · **E-mail (db):** 2
- **Előfeltétel:** H-FOGLALT legalább 2 szabad hellyel, K bejelentkezve.
- **Tesztadat:** 1 hely, dupla kattintás
- **Lépések:**
  1. K-ként válassz 1 helyet és kattints kétszer gyorsan a foglalás gombra.
- **Elvárt eredmény:**
  - Egy foglalás jön létre. Ha 2 hely lett belőle (összevonás miatt), az Megfigyelés/hiba: a felhasználó 1-et kért.
- **Megjegyzés:** K-nak nincs jóváhagyott Mailgun-címe: az utasnak szóló levél elbukik (várt), S levele megérkezik.

### TC-FOGL-019
**Vendég nem tud foglalni**

- **Forrás:** spec 1 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V (kijelentkezve).
- **Tesztadat:** H-ALAP
- **Lépések:**
  1. Kijelentkezve nyisd meg H-ALAP-ot, próbálj foglalni.
- **Elvárt eredmény:**
  - A foglalás nem jön létre; a rendszer bejelentkezésre irányít vagy ezt kéri.
