# KERES — Keresés, szűrés, hirdetéslista

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 10 · P1: 2 · P2: 7 · P3: 1 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-KERES-001](#tc-keres-001) | Alap lista: csak jövőbeli utak, időpont szerint növekvő sorrendben | P1 | Böngésző + Supabase |
| [TC-KERES-002](#tc-keres-002) | Ma induló, de már elindult hirdetés nem jelenik meg | P2 | Böngésző |
| [TC-KERES-003](#tc-keres-003) | Szűrés induló helyre | P2 | Böngésző |
| [TC-KERES-004](#tc-keres-004) | Szűrés célállomásra és kombinált szűrés | P2 | Böngésző |
| [TC-KERES-005](#tc-keres-005) | Időszak szűrő határértékei | P2 | Böngésző |
| [TC-KERES-006](#tc-keres-006) | Szabad helyek minimuma szűrő | P2 | Böngésző |
| [TC-KERES-007](#tc-keres-007) | Törölt hirdetés nem jelenik meg a listában | P1 | Böngésző |
| [TC-KERES-008](#tc-keres-008) | Betelt hirdetés nem jelenik meg a listában | P2 | Böngésző |
| [TC-KERES-009](#tc-keres-009) | Keresés kis/nagybetű, ékezet és részleges egyezés | P3 | Böngésző |
| [TC-KERES-010](#tc-keres-010) | Vendég böngészhet és szűrhet a hirdetések között | P2 | Böngésző |

### TC-KERES-001
**Alap lista: csak jövőbeli utak, időpont szerint növekvő sorrendben**

- **Forrás:** KAN-5; spec 4.8 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP, H-FOGLALT, H-SZUK létezik.
- **Tesztadat:** —
- **Lépések:**
  1. Nyisd meg a hirdetéslistát szűrés nélkül.
- **Elvárt eredmény:**
  - A hirdetések utazási időpont szerint növekvő sorrendben jelennek meg (a QA hirdetések egymáshoz képest is).
  - Nincs múltbeli indulású hirdetés.

### TC-KERES-002
**Ma induló, de már elindult hirdetés nem jelenik meg**

- **Forrás:** KAN-5; spec 4.8 (v11) · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Részben · **E-mail (db):** 0
- **Előfeltétel:** H-LEJAR: ma, most+20 perc.
- **Tesztadat:** —
- **Lépések:**
  1. Indulás előtt ellenőrizd, hogy H-LEJAR a listában van.
  2. Az indulási idő után 1-2 perccel frissítsd a listát.
- **Elvárt eredmény:**
  - Indulás előtt látszik, utána nem.
- **Megjegyzés:** SQ-2 lezárva (v11): az indulási időpont (dátum + idő) számít.

### TC-KERES-003
**Szűrés induló helyre**

- **Forrás:** KAN-5; spec 4.8 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** QA hirdetések QA_Budapest indulással.
- **Tesztadat:** Induló: QA_Budapest
- **Lépések:**
  1. Szűrj az induló helyre.
- **Elvárt eredmény:**
  - Csak QA_Budapest indulású hirdetések jelennek meg.

### TC-KERES-004
**Szűrés célállomásra és kombinált szűrés**

- **Forrás:** KAN-5; spec 4.8 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP (Debrecen), H-SZUK (Pécs).
- **Tesztadat:** Cél: Pécs; majd induló QA_Budapest + cél Pécs; majd induló QA_Budapest + cél Nincsilyen
- **Lépések:**
  1. Szűrj célállomásra, majd a kombinációkra.
- **Elvárt eredmény:**
  - Csak az illeszkedő hirdetések jelennek meg; a nem illeszkedő kombinációnál érthető „nincs találat” üzenet.

### TC-KERES-005
**Időszak szűrő határértékei**

- **Forrás:** KAN-5; spec 4.8 · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-SZUK: ma+14.
- **Tesztadat:** Időszak: [ma+14, ma+14]; [ma+13, ma+13]; [ma+15, ma+20]; kezdő > vég
- **Lépések:**
  1. Szűrj a megadott időszakokra (induló: QA_Budapest).
- **Elvárt eredmény:**
  - [ma+14, ma+14]: H-SZUK megjelenik (a határnap bezárólag számít).
  - [ma+13, ma+13] és [ma+15, ma+20]: nem jelenik meg.
  - Kezdő > vég: érthető hibajelzés vagy üres lista, nem hiba az oldalon.

### TC-KERES-006
**Szabad helyek minimuma szűrő**

- **Forrás:** KAN-5; spec 4.8 (v11) · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT: 4 hely, ebből 1 foglalt (3 maradt).
- **Tesztadat:** Min. hely: 3, 4
- **Lépések:**
  1. Szűrj QA_Budapest indulásra és min. 3, majd min. 4 szabad helyre.
- **Elvárt eredmény:**
  - Min. 3: H-FOGLALT megjelenik; min. 4: nem jelenik meg (a szűrő a még foglalható helyeket nézi).
- **Megjegyzés:** SQ-3 lezárva (v11): a szűrő a még foglalható helyeket nézi.

### TC-KERES-007
**Törölt hirdetés nem jelenik meg a listában**

- **Forrás:** spec 4.12, 4.8 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-TOROL törölve (TC-LEMOND-004 után).
- **Tesztadat:** —
- **Lépések:**
  1. Keress rá H-TOROL-ra (QA_Budapest → Eger).
- **Elvárt eredmény:**
  - Nem jelenik meg a listában; közvetlen URL-en nem foglalható.

### TC-KERES-008
**Betelt hirdetés nem jelenik meg a listában**

- **Forrás:** KAN-5; spec 4.8 (v11) · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-SZUK betelt (1/1 foglalt) — a TC-FOGL-016 egyik köre után, a lemondás előtt.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd meg a listában H-SZUK-ot, majd a részletes nézetét.
- **Elvárt eredmény:**
  - A betelt hirdetés nem jelenik meg a hirdetéslistában (szűrés nélkül és szűréssel sem).
  - Közvetlen URL-en megnyitva nem foglalható (a foglalási doboz tiltott vagy „nincs szabad hely” üzenet).
- **Megjegyzés:** SQ-4 lezárva (v11): a betelt hirdetés rejtve.

### TC-KERES-009
**Keresés kis/nagybetű, ékezet és részleges egyezés**

- **Forrás:** spec 4.8 · **Prioritás:** P3 · **Típus:** Hibasejtés · **Technika:** Hibasejtés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-SZUK (Pécs), H-ALAP (Debrecen).
- **Tesztadat:** 'pécs', 'PÉCS', 'Pecs', 'debr', ' Debrecen '
- **Lépések:**
  1. Szűrj célállomásra a megadott változatokkal.
- **Elvárt eredmény:**
  - A kis/nagybetű és a szóközök nem befolyásolják a találatot; az ékezet nélküli és részleges keresés viselkedése dokumentálva.

### TC-KERES-010
**Vendég böngészhet és szűrhet a hirdetések között**

- **Forrás:** KAN-5; spec 3.4, 4.8 (v11) · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Jogosultsági mátrix
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V (kijelentkezve).
- **Tesztadat:** Szűrés: induló QA_Budapest
- **Lépések:**
  1. Kijelentkezve nyisd meg a főoldali listát.
  2. Szűrj induló helyre.
  3. Nyisd meg egy hirdetés részleteit.
- **Elvárt eredmény:**
  - A lista bejelentkezés nélkül megjelenik, a szűrés működik.
  - A részletek oldal megnyílik, a nyilvános adatok (útvonal, dátum/idő, ár, még foglalható helyek) láthatók.
  - Rendszám, sofőr telefon és e-mail nem látszik (a hálózati válaszokban sem).
  - Foglalásra kattintva a rendszer bejelentkezést kér (lásd TC-FOGL-019).
- **Megjegyzés:** SQ-8 lezárva (v11): a vendég böngészhet.
