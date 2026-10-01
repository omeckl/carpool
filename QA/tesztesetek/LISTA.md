# LISTA — Foglalásaim / Hirdetéseim / Utasaim, badge

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 9 · P1: 2 · P2: 5 · P3: 2 · becsült e-mail: 2

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-LISTA-001](#tc-lista-001) | Foglalásaim: Aktív blokk növekvő, korábbi blokk csökkenő, soronkénti címkével | P1 | Böngésző |
| [TC-LISTA-002](#tc-lista-002) | Hirdetéseim: blokkok, rendezés, címkék és ikon | P2 | Böngésző |
| [TC-LISTA-003](#tc-lista-003) | Utasaim globális nézet: rendezés és másodlagos rendezés | P1 | Böngésző |
| [TC-LISTA-004](#tc-lista-004) | Utasaim szűrt nézet egy hirdetésről | P2 | Böngésző |
| [TC-LISTA-005](#tc-lista-005) | Foglalás nélküli hirdetésen nincs „Utasaim” link | P3 | Böngésző |
| [TC-LISTA-006](#tc-lista-006) | Új foglalás jelzése (badge) a menüben | P2 | Böngésző |
| [TC-LISTA-007](#tc-lista-007) | A badge és a „friss” jelölés eltűnik az Utasaim megnyitásakor | P2 | Böngésző + Supabase |
| [TC-LISTA-008](#tc-lista-008) | Elindult út foglalása „Lejárt” címkével a korábbi blokkba kerül | P2 | Böngésző |
| [TC-LISTA-009](#tc-lista-009) | Üres listák érthető üres állapottal | P3 | Böngésző |

### TC-LISTA-001
**Foglalásaim: Aktív blokk növekvő, korábbi blokk csökkenő, soronkénti címkével**

- **Forrás:** KAN-30; spec 4.22 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1-nek van aktív (H-ALAP), Lemondva (H-FOGLALT), Törölt (H-TOROL) és Lejárt (H-LEJAR) foglalása. Ha van több aktív, a sorrend is ellenőrizhető.
- **Tesztadat:** —
- **Lépések:**
  1. U1-ként nyisd meg a Foglalásaim oldalt.
- **Elvárt eredmény:**
  - Felül Aktív blokk, utazási idő szerint növekvő.
  - Alatta egy összevont korábbi blokk, alkategória-fejléc nélkül, utazási idő szerint csökkenő, soronkénti Lemondva / Törölt / Lejárt címkével.
  - Minden sorban látszik az út dátuma és időpontja.

### TC-LISTA-002
**Hirdetéseim: blokkok, rendezés, címkék és ikon**

- **Forrás:** KAN-20, KAN-30; spec 4.20, 4.22 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S-nek vannak aktív, törölt és lejárt QA hirdetései.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg a Hirdetéseim oldalt.
- **Elvárt eredmény:**
  - Aktív blokk növekvő, korábbi blokk (Lejárt / Törölt) csökkenő, soronkénti címkével.
  - A kártyákon egyszerű ikon van, nem célállomás-fotó.
  - Lejárt kártyán „· X foglalás volt”, törölt kártyán a pillanatkép száma (lásd TC-LEMOND-005).

### TC-LISTA-003
**Utasaim globális nézet: rendezés és másodlagos rendezés**

- **Forrás:** KAN-13, KAN-22, KAN-30; spec 4.22 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S egyik hirdetésén (pl. H-FOGLALT) U1 és U2 is foglalt, U2 később; más hirdetésen is van foglalás; van Lemondva/Törölt/Lejárt foglalás is.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg az Utasaim oldalt (menüből, szűrés nélkül).
- **Elvárt eredmény:**
  - Aktív blokk utazási idő szerint növekvő; azonos hirdetésen belül a foglalás/módosítás ideje szerint csökkenő (U2 U1 előtt).
  - Korábbi blokk csökkenő, soronkénti címkével.
  - Minden sorban út dátuma, időpontja és az utas adatai.

### TC-LISTA-004
**Utasaim szűrt nézet egy hirdetésről**

- **Forrás:** KAN-13; spec 4.16, 4.22 (v9) · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-FOGLALT-on van aktív és korábbi (Lemondva) foglalás is.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg H-FOGLALT adatlapját, kattints az „Utasaim” linkre.
- **Elvárt eredmény:**
  - Csak H-FOGLALT foglalásai jelennek meg.
  - A korábbi blokk soraiban is látszik az út dátuma és időpontja (v9).

### TC-LISTA-005
**Foglalás nélküli hirdetésen nincs „Utasaim” link**

- **Forrás:** KAN-13; spec 4.16 · **Prioritás:** P3 · **Típus:** Negatív · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** H-ALAP foglalás nélkül (vagy egy új, foglalás nélküli QA hirdetés).
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg a foglalás nélküli hirdetés adatlapját.
- **Elvárt eredmény:**
  - Nem jelenik meg „Utasaim” link.

### TC-LISTA-006
**Új foglalás jelzése (badge) a menüben**

- **Forrás:** KAN-13; spec 4.16 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 2
- **Előfeltétel:** S megnyitotta az Utasaim oldalt (nincs badge). Ezután U1 új foglalást tesz S egyik hirdetésére.
- **Tesztadat:** —
- **Lépések:**
  1. U1-ként foglalj S egyik hirdetésére.
  2. S-ként navigálj az oldalon (vagy jelentkezz be újra).
- **Elvárt eredmény:**
  - A főmenü és a legördülő profilmenü „Utasaim” pontja jelzést mutat.
  - Az új foglalás „friss” jelöléssel jelenik meg az Utasaim listán.

### TC-LISTA-007
**A badge és a „friss” jelölés eltűnik az Utasaim megnyitásakor**

- **Forrás:** KAN-13; spec 4.16, 2.1 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** TC-LISTA-006 után badge látszik.
- **Tesztadat:** —
- **Lépések:**
  1. S-ként nyisd meg az Utasaim oldalt, majd navigálj el és vissza.
- **Elvárt eredmény:**
  - A badge eltűnik; visszatéréskor a „friss” jelölés már nincs.
  - DB: S utolsó megtekintési időpontja frissült.

### TC-LISTA-008
**Elindult út foglalása „Lejárt” címkével a korábbi blokkba kerül**

- **Forrás:** KAN-22; spec 4.22 · **Prioritás:** P2 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Részben · **E-mail (db):** 0
- **Előfeltétel:** H-LEJAR: U1 aktív foglalással, indulás most+20 perc.
- **Tesztadat:** —
- **Lépések:**
  1. Indulás előtt nézd meg U1 Foglalásaim és S Utasaim / Hirdetéseim oldalát.
  2. Indulás után 1-2 perccel frissíts.
- **Elvárt eredmény:**
  - Indulás előtt az Aktív blokkban van.
  - Indulás után mindhárom listán a korábbi blokkban, „Lejárt” címkével.
- **Megjegyzés:** SQ-2 lezárva (v11): az indulási időpont számít.

### TC-LISTA-009
**Üres listák érthető üres állapottal**

- **Forrás:** Hibasejtés · **Prioritás:** P3 · **Típus:** Hibasejtés · **Technika:** Hibasejtés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** K bejelentkezve (nincs foglalása, hirdetése, járműve).
- **Tesztadat:** —
- **Lépések:**
  1. K-ként nyisd meg a Foglalásaim, Hirdetéseim, Utasaim és Járműveim oldalt.
- **Elvárt eredmény:**
  - Mindenhol érthető, magyar üres állapot üzenet, nincs hiba, nincs üres fehér oldal.
