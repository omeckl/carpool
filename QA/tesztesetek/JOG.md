# JOG — Jogosultság / RLS (keresztmetszeti)

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 10 · P1: 6 · P2: 3 · P3: 1 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-JOG-001](#tc-jog-001) | Más felhasználó hirdetése nem módosítható és nem törölhető API-n | P1 | Supabase |
| [TC-JOG-002](#tc-jog-002) | Más utas foglalása nem módosítható és nem mondható le | P1 | Supabase |
| [TC-JOG-003](#tc-jog-003) | Egy utas nem látja más utasok foglalásait | P1 | Supabase |
| [TC-JOG-004](#tc-jog-004) | Más felhasználó járműve nem látható és nem módosítható | P1 | Supabase |
| [TC-JOG-005](#tc-jog-005) | Más felhasználó profilja nem módosítható | P1 | Supabase |
| [TC-JOG-006](#tc-jog-006) | Anonim (vendég) API-hozzáférés személyes adathoz és RPC-khez | P1 | Supabase |
| [TC-JOG-007](#tc-jog-007) | Más hirdetés szerkesztő oldala közvetlen URL-lel | P2 | Böngésző |
| [TC-JOG-008](#tc-jog-008) | A belső trigger-függvények nem hívhatók API-n | P2 | Supabase |
| [TC-JOG-009](#tc-jog-009) | Supabase biztonsági tanácsadó: nincs új figyelmeztetés | P2 | Supabase |
| [TC-JOG-010](#tc-jog-010) | A hibaüzenetek nem szivárogtatnak belső részletet | P3 | Böngésző + Supabase |

### TC-JOG-001
**Más felhasználó hirdetése nem módosítható és nem törölhető API-n**

- **Forrás:** spec 4.11, 4.12 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K és U1 munkamenete. H-ALAP (S hirdetése).
- **Tesztadat:** update_listing, cancel_listing, REST update/delete listings
- **Lépések:**
  1. K és U1 nevében próbáld módosítani és törölni H-ALAP-ot minden elérhető úton.
- **Elvárt eredmény:**
  - Minden kísérlet elutasítva; DB változatlan; nincs e-mail.

### TC-JOG-002
**Más utas foglalása nem módosítható és nem mondható le**

- **Forrás:** spec 4.5, 4.17 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1 aktív foglalással; U2 és S munkamenete.
- **Tesztadat:** update_booking, cancel_booking U1 foglalására
- **Lépések:**
  1. U2 nevében hívd az update_booking és cancel_booking RPC-t U1 foglalására.
  2. S (a sofőr) nevében is próbáld.
- **Elvárt eredmény:**
  - U2 kísérletei elutasítva.
  - S (sofőr) kísérlete: a tényleges viselkedés dokumentálva — a spec szerint csak a hirdetés törlésével szüntetheti meg.

### TC-JOG-003
**Egy utas nem látja más utasok foglalásait**

- **Forrás:** spec 2.4 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1 és U2 is foglalt H-FOGLALT-ra.
- **Tesztadat:** REST: bookings, my_bookings, my_passengers
- **Lépések:**
  1. U2 nevében kérdezd le a bookings táblát és a my_bookings / my_passengers nézetet.
- **Elvárt eredmény:**
  - U2 csak a saját foglalásait látja; U1 foglalása (és adatai) nem jelennek meg.

### TC-JOG-004
**Más felhasználó járműve nem látható és nem módosítható**

- **Forrás:** spec 2.2 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K munkamenete. J-A, J-B (S járművei).
- **Tesztadat:** REST: vehicles select/update/delete
- **Lépések:**
  1. K nevében kérdezd le, módosítsd és töröld S járműveit.
- **Elvárt eredmény:**
  - A lekérdezés nem ad vissza S-hez tartozó sort; a módosítás/törlés hatástalan vagy hibás; DB változatlan.

### TC-JOG-005
**Más felhasználó profilja nem módosítható**

- **Forrás:** spec 2.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K munkamenete.
- **Tesztadat:** REST: profiles update S sorára (phone, full_name)
- **Lépések:**
  1. K nevében próbáld módosítani S profilját.
- **Elvárt eredmény:**
  - Hatástalan vagy hibás; S profilja változatlan.

### TC-JOG-006
**Anonim (vendég) API-hozzáférés személyes adathoz és RPC-khez**

- **Forrás:** spec 2.1, 4.7 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Csak a publikus (anon) kulcs, bejelentkezés nélkül.
- **Tesztadat:** REST: profiles, bookings, vehicles, my_* nézetek; RPC: book_ride, update_booking, cancel_booking, create_listing
- **Lépések:**
  1. Anonim módon kérdezd le a táblákat/nézeteket és hívd az RPC-ket.
- **Elvárt eredmény:**
  - Személyes adat nem jön vissza; a módosító RPC-k elutasítva.

### TC-JOG-007
**Más hirdetés szerkesztő oldala közvetlen URL-lel**

- **Forrás:** spec 4.11 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K bejelentkezve; H-ALAP szerkesztő URL-je ismert (S-ként kimásolva).
- **Tesztadat:** —
- **Lépések:**
  1. K-ként nyisd meg közvetlenül H-ALAP szerkesztő URL-jét, próbálj menteni.
- **Elvárt eredmény:**
  - Nem jelenik meg szerkeszthető űrlap, vagy a mentés elutasítva; érthető üzenet.

### TC-JOG-008
**A belső trigger-függvények nem hívhatók API-n**

- **Forrás:** e-mail infrastruktúra (revoke execute) · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Jogosultsági mátrix
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Anon és K munkamenete.
- **Tesztadat:** RPC: notify_booking_created, notify_booking_cancelled, notify_booking_updated, notify_listing_cancelled
- **Lépések:**
  1. Hívd meg a függvényeket /rest/v1/rpc/ úton anon és K nevében.
- **Elvárt eredmény:**
  - Minden hívás elutasítva (jogosultság hiánya); nem megy ki e-mail.

### TC-JOG-009
**Supabase biztonsági tanácsadó: nincs új figyelmeztetés**

- **Forrás:** 03-supabase-api.md · **Prioritás:** P2 · **Típus:** Regresszió · **Technika:** Ellenőrzőlista
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Supabase MCP hozzáférés.
- **Tesztadat:** get_advisors(security)
- **Lépések:**
  1. Futtasd a biztonsági tanácsadót.
- **Elvárt eredmény:**
  - Nincs új ERROR/WARN figyelmeztetés; az ismert, jóváhagyott auth_users_exposed (my_bookings, my_passengers) dokumentálva.

### TC-JOG-010
**A hibaüzenetek nem szivárogtatnak belső részletet**

- **Forrás:** Hibasejtés · **Prioritás:** P3 · **Típus:** Negatív · **Technika:** Hibasejtés
- **Mód:** Böngésző + Supabase · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** A futás negatív tesztjeinek hibaüzenetei.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd át a felületen és az API-válaszokban megjelent hibaüzeneteket.
- **Elvárt eredmény:**
  - Nincs SQL-töredék, táblanév, stack trace vagy belső azonosító a felhasználónak szóló üzenetekben.
