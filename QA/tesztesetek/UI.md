# UI — Felület, navigáció, képek, mobil

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 9 · P1: 0 · P2: 2 · P3: 7 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-UI-001](#tc-ui-001) | A böngészőfül címe „Telekocsi” | P3 | Böngésző |
| [TC-UI-002](#tc-ui-002) | Soha nincs törött kép a kártyákon és a részletező oldalon | P3 | Böngésző |
| [TC-UI-003](#tc-ui-003) | Vissza gomb a Profil → Foglalásaim úton | P3 | Böngésző |
| [TC-UI-004](#tc-ui-004) | Utasaim Vissza gomb a navigációs helytől függően | P3 | Böngésző |
| [TC-UI-005](#tc-ui-005) | Egységes jármű-ikon | P3 | Böngésző |
| [TC-UI-006](#tc-ui-006) | Foglalásaim gombjai a kártya jobb felső sarkában | P3 | Böngésző |
| [TC-UI-007](#tc-ui-007) | Mobil nézet: a fő folyamat használható | P2 | Böngésző |
| [TC-UI-008](#tc-ui-008) | Nincs JavaScript-hiba és 4xx/5xx válasz a fő oldalakon | P2 | Böngésző |
| [TC-UI-009](#tc-ui-009) | Célállomás-fotó cache: egy célállomás egyszer kerül keresésre | P3 | Supabase |

### TC-UI-001
**A böngészőfül címe „Telekocsi”**

- **Forrás:** KAN-32 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Ellenőrzőlista
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** —
- **Tesztadat:** Oldalak: főoldal, részletek, Foglalásaim, Hirdetéseim, Utasaim, Járműveim, bejelentkezés
- **Lépések:**
  1. Nyisd meg sorban az oldalakat, nézd a fül címét.
- **Elvárt eredmény:**
  - Mindenhol „Telekocsi”.

### TC-UI-002
**Soha nincs törött kép a kártyákon és a részletező oldalon**

- **Forrás:** KAN-24; spec 4.26 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Hibasejtés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Legalább egy ismert (Debrecen) és egy új célállomású QA hirdetés.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd meg a főoldali kártyákat és a részletező oldalakat, a hálózati kéréseket is.
- **Elvárt eredmény:**
  - Minden kártyán célállomás-fotó vagy a statikus tartalékkép látszik; nincs törött kép ikon vagy 404-es kép.

### TC-UI-003
**Vissza gomb a Profil → Foglalásaim úton**

- **Forrás:** KAN-25 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Használati eset
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1 bejelentkezve.
- **Tesztadat:** —
- **Lépések:**
  1. Profil oldalról nyisd meg a Foglalásaim oldalt, kattints a Vissza gombra.
- **Elvárt eredmény:**
  - A Vissza gomb látszik, és a Profil oldalra visz.

### TC-UI-004
**Utasaim Vissza gomb a navigációs helytől függően**

- **Forrás:** KAN-25 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Döntési tábla
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S, H-FOGLALT foglalással.
- **Tesztadat:** —
- **Lépések:**
  1. Hirdetés adatlapjáról nyisd meg az Utasaim oldalt, kattints Vissza.
  2. A főmenüből nyisd meg az Utasaim oldalt.
- **Elvárt eredmény:**
  - Hirdetésről érkezve van Vissza gomb, és az adatlapra visz.
  - Menüből érkezve nincs Vissza gomb.

### TC-UI-005
**Egységes jármű-ikon**

- **Forrás:** KAN-26, KAN-33 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Ellenőrzőlista
- **Mód:** Böngésző · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** S, H-ALAP.
- **Tesztadat:** —
- **Lépések:**
  1. Hasonlítsd össze a jármű-ikont a Járműveim, a Hirdetéseim (aktív kártya) és az útrészletező „Jármű” szekciójában.
- **Elvárt eredmény:**
  - Mindhárom helyen ugyanaz az ikon-rajzolat.

### TC-UI-006
**Foglalásaim gombjai a kártya jobb felső sarkában**

- **Forrás:** KAN-35 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Ellenőrzőlista
- **Mód:** Böngésző · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** U1 aktív foglalással.
- **Tesztadat:** —
- **Lépések:**
  1. Nézd meg az aktív foglalás-kártyát.
- **Elvárt eredmény:**
  - A Szerkesztés (felül) és a Lemondás (alatta) kisméretű gombként a jobb felső sarokban van, a Hirdetéseim/Járműveim oldallal egyező stílusban.

### TC-UI-007
**Mobil nézet: a fő folyamat használható**

- **Forrás:** Nem funkcionális kiegészítés · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Böngésző 390×844-es méretben, U2 bejelentkezve.
- **Tesztadat:** —
- **Lépések:**
  1. Mobil nézetben: keresés → hirdetés részletei → foglalás → Foglalásaim → lemondás (Mégse).
  2. Nyisd meg a menüt és a profilmenüt.
- **Elvárt eredmény:**
  - Minden elem elérhető és kattintható, nincs vízszintes görgetés, nincs kilógó vagy átfedő elem.

### TC-UI-008
**Nincs JavaScript-hiba és 4xx/5xx válasz a fő oldalakon**

- **Forrás:** Hibasejtés · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Ellenőrzőlista
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve.
- **Tesztadat:** Minden fő oldal
- **Lépések:**
  1. Nyisd meg sorban a fő oldalakat, olvasd ki a konzolt és a hálózati kéréseket.
- **Elvárt eredmény:**
  - Nincs JavaScript-hiba és nincs váratlan 4xx/5xx válasz (a szándékos jogosultsági elutasítások kivételével).

### TC-UI-009
**Célállomás-fotó cache: egy célállomás egyszer kerül keresésre**

- **Forrás:** spec 4.26, 2.5 · **Prioritás:** P3 · **Típus:** Pozitív · **Technika:** Adat-ellenőrzés
- **Mód:** Supabase · **Automatizálható:** Részben · **E-mail (db):** 0
- **Előfeltétel:** Új, még nem cache-elt célállomás (pl. 'Sopron') és egy már Kész állapotú (Debrecen).
- **Tesztadat:** —
- **Lépések:**
  1. Hozz létre egy hirdetést Sopron célállomással, kérdezd le a destination_photo_cache sort.
  2. Hozz létre második hirdetést Debrecenbe, ellenőrizd, hogy nem indul új keresés.
- **Elvárt eredmény:**
  - Sopronhoz létrejön a sor (Folyamatban → Kész/Hibás); amíg nincs Kész, a tartalékkép látszik.
  - Debrecennél nincs új keresés (a sor updated_at nem változik).
- **Megjegyzés:** Ha nincs beállítva Unsplash-kulcs, az állapot Hibás lesz — ez környezeti ok, nem termékhiba.
