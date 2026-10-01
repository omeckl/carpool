# AUTH — Regisztráció, megerősítés, bejelentkezés, kijelentkezés

Szereplők: **S** = QA_Sofor (jfkovesi@gmail.com), **U1** = QA_Utas1 (omeckl@yahoo.com), **U2** = QA_Utas2 (orsime@yahoo.com), **K** = QA_Kivulallo (jfkovesi+qa@gmail.com), **V** = vendég. Fixture-ök (J-A, H-ALAP, …): lásd [00-attekintes.md](00-attekintes.md).

Tesztesetek: 16 · P1: 9 · P2: 4 · P3: 3 · becsült e-mail: 0

| ID | Cím | Prioritás | Mód |
|---|---|---|---|
| [TC-AUTH-001](#tc-auth-001) | Sikeres regisztráció minden kötelező adattal és hozzájárulással | P1 | Böngésző + Supabase |
| [TC-AUTH-002](#tc-auth-002) | Megerősítetlen fiókkal nem lehet bejelentkezni | P2 | Böngésző |
| [TC-AUTH-003](#tc-auth-003) | A megerősítő link a bejelentkező oldalra visz, automatikus bejelentkezés nélkül | P1 | Böngésző + Supabase |
| [TC-AUTH-004](#tc-auth-004) | Regisztráció hozzájárulás nélkül nem lehetséges | P1 | Böngésző + Supabase |
| [TC-AUTH-005](#tc-auth-005) | Foglalt felhasználónévvel nem lehet regisztrálni | P1 | Böngésző + Supabase |
| [TC-AUTH-006](#tc-auth-006) | Foglalt e-mail címmel nem lehet regisztrálni | P1 | Böngésző + Supabase |
| [TC-AUTH-007](#tc-auth-007) | Kötelező mezők üresen hagyva — mindegyik külön | P2 | Böngésző |
| [TC-AUTH-008](#tc-auth-008) | Érvénytelen e-mail és telefonszám formátum | P2 | Böngésző |
| [TC-AUTH-009](#tc-auth-009) | Jelszó minimális követelménye *(archivált)* | P3 | Böngésző |
| [TC-AUTH-010](#tc-auth-010) | Bejelentkezés felhasználónévvel | P1 | Böngésző |
| [TC-AUTH-011](#tc-auth-011) | Bejelentkezés e-mail címmel | P1 | Böngésző |
| [TC-AUTH-012](#tc-auth-012) | Hibás jelszó / nem létező felhasználó | P1 | Böngésző |
| [TC-AUTH-013](#tc-auth-013) | Bejelentkezés kis/nagybetű-eltéréssel és szóközökkel | P3 | Böngésző |
| [TC-AUTH-014](#tc-auth-014) | Kijelentkezés és védett oldalak elérhetetlensége utána | P1 | Böngésző |
| [TC-AUTH-015](#tc-auth-015) | A kijelentkezés gomb felirata mindenhol „Kijelentkezés” | P3 | Böngésző |
| [TC-AUTH-016](#tc-auth-016) | A jelszó hash-elve tárolódik | P2 | Supabase |
| [TC-AUTH-017](#tc-auth-017) | Az adatkezelési hozzájárulás időpontja tárolódik | P3 | Supabase |

### TC-AUTH-001
**Sikeres regisztráció minden kötelező adattal és hozzájárulással**

- **Forrás:** KAN-2; spec 3.1, 4.6 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Használati eset
- **Mód:** Böngésző + Supabase · **Automatizálható:** Részben · **E-mail (db):** 0
- **Előfeltétel:** V (nincs bejelentkezve). A jfkovesi+qa@gmail.com cím még nincs regisztrálva.
- **Tesztadat:** Név: QA Kívülálló; felhasználónév: qa_kivulallo; e-mail: jfkovesi+qa@gmail.com; jelszó: (a felhasználó adja meg); telefon: +36301234567
- **Lépések:**
  1. Nyisd meg a regisztrációs oldalt.
  2. Töltsd ki az összes mezőt a tesztadattal.
  3. Jelöld be az adatkezelési hozzájárulást.
  4. Küldd el az űrlapot.
- **Elvárt eredmény:**
  - A felület sikeres regisztrációt jelez, és tájékoztat a megerősítő e-mailről.
  - A felhasználó NINCS bejelentkezve.
  - DB: létrejön az auth.users és a profiles sor (username, full_name, phone), consent_accepted_at kitöltve, e-mail még nincs megerősítve.
  - A megerősítő e-mail megérkezik a jfkovesi@gmail.com postafiókba (Supabase Auth küldi).
- **Megjegyzés:** A cím csak egyszer regisztrálható — újrafuttatáskor új alias kell (+qa2, +qa3…). Ha a levél nem érkezik meg, ellenőrizd a Supabase SMTP-korlátot (Blokkolt, nem termékhiba).

### TC-AUTH-002
**Megerősítetlen fiókkal nem lehet bejelentkezni**

- **Forrás:** KAN-2; spec 2.1 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Állapotátmenet
- **Mód:** Böngésző · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** TC-AUTH-001 lefutott, a megerősítő linkre MÉG NEM kattintottak.
- **Tesztadat:** qa_kivulallo + helyes jelszó
- **Lépések:**
  1. Próbálj bejelentkezni a qa_kivulallo felhasználónévvel és helyes jelszóval.
- **Elvárt eredmény:**
  - A bejelentkezés nem sikerül.
  - Érthető üzenet jelzi, hogy az e-mail címet előbb meg kell erősíteni.

### TC-AUTH-003
**A megerősítő link a bejelentkező oldalra visz, automatikus bejelentkezés nélkül**

- **Forrás:** KAN-2; spec 4.14 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase · **Automatizálható:** Nem · **E-mail (db):** 0
- **Előfeltétel:** TC-AUTH-001 megerősítő levele megérkezett.
- **Tesztadat:** —
- **Lépések:**
  1. Kattints a megerősítő levélben lévő linkre (a felhasználó végzi, vagy megosztja a linket).
  2. Figyeld meg, melyik oldal jelenik meg.
- **Elvárt eredmény:**
  - A bejelentkező oldal jelenik meg a sikeres megerősítés üzenetével.
  - A felhasználó NINCS automatikusan bejelentkezve.
  - DB: auth.users.email_confirmed_at kitöltve.

### TC-AUTH-004
**Regisztráció hozzájárulás nélkül nem lehetséges**

- **Forrás:** KAN-2; spec 4.6 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V.
- **Tesztadat:** Új alias (pl. jfkovesi+qa-neg1@gmail.com), minden más mező érvényes
- **Lépések:**
  1. Töltsd ki a regisztrációs űrlapot érvényes adatokkal.
  2. A hozzájárulás jelölőnégyzetet hagyd üresen.
  3. Próbáld elküldeni.
- **Elvárt eredmény:**
  - A regisztráció nem jön létre.
  - A felület jelzi a hiányzó hozzájárulást.
  - DB: nincs új auth.users sor ezzel a címmel.

### TC-AUTH-005
**Foglalt felhasználónévvel nem lehet regisztrálni**

- **Forrás:** KAN-2; spec 2.1 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V. S felhasználóneve ismert (leltárból).
- **Tesztadat:** Felhasználónév = S meglévő felhasználóneve; új alias e-mail
- **Lépések:**
  1. Regisztrálj S felhasználónevével, de új e-mail címmel, hozzájárulással.
- **Elvárt eredmény:**
  - A rendszer hibaüzenettel elutasítja a regisztrációt.
  - DB: nem jön létre új auth.users / profiles sor (árva auth.users sor sem!).
- **Megjegyzés:** Error guessing: a profiles unique hiba a trigger miatt a teljes regisztrációt vissza kell görgesse.

### TC-AUTH-006
**Foglalt e-mail címmel nem lehet regisztrálni**

- **Forrás:** KAN-2; spec 2.1, 3.1 (v11) · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző + Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V.
- **Tesztadat:** E-mail: omeckl@yahoo.com (U1, már regisztrált); új felhasználónév
- **Lépések:**
  1. Regisztrálj U1 e-mail címével, új felhasználónévvel, minden más mező érvényes, hozzájárulással.
  2. Ellenőrizd a felületi üzenetet, a DB-t és U1 postafiókját.
- **Elvárt eredmény:**
  - A rendszer elutasítja a regisztrációt, és egyértelmű hibaüzenetet ad arról, hogy ezzel az e-mail címmel már létezik regisztráció.
  - NEM jelenik meg látszólagos siker (pl. „Ellenőrizd a postafiókodat”, „Sikeres regisztráció”).
  - DB: nem jön létre új profiles sor; U1 fiókja (profil, jelszó, megerősítés) változatlan.
  - U1 nem kap megerősítő levelet.
- **Megjegyzés:** SQ-12 lezárva (v11). Kockázat: a Supabase Auth bekapcsolt e-mail-megerősítésnél alapértelmezésben látszólagos sikert ad meglévő címre — ha így működik, Sikertelen, hibajegy (Közepes).

### TC-AUTH-007
**Kötelező mezők üresen hagyva — mindegyik külön**

- **Forrás:** KAN-2 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V.
- **Tesztadat:** Egyszerre mindig csak egy mező üres (név, felhasználónév, e-mail, jelszó, telefon); csak szóköz is
- **Lépések:**
  1. Minden kötelező mezőre: hagyd üresen (majd csak szóközzel töltsd ki), a többit töltsd ki helyesen, és küldd el.
- **Elvárt eredmény:**
  - Egyik esetben sem jön létre fiók.
  - A hibás mező egyértelműen meg van jelölve, érthető magyar üzenettel.

### TC-AUTH-008
**Érvénytelen e-mail és telefonszám formátum**

- **Forrás:** KAN-2 · **Prioritás:** P2 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V.
- **Tesztadat:** E-mail: 'abc', 'abc@', 'a b@c.hu'; telefon: 'abc', '12', 300 karakteres szám
- **Lépések:**
  1. Próbálj regisztrálni egyenként az érvénytelen értékekkel.
- **Elvárt eredmény:**
  - A rendszer elutasítja, és jelzi a hibás mezőt.
- **Megjegyzés:** A telefonszám formátuma a spec-ben nincs definiálva — ha minden elfogadott, Megfigyelés + Spec-kérdés.

### TC-AUTH-009 — ARCHIVÁLT
**Jelszó minimális követelménye**

- **Forrás:** spec 5 · **Prioritás:** P3 · **Típus:** Határérték · **Technika:** Határérték-elemzés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** V.
- **Tesztadat:** Jelszó: 1 karakter, 5 karakter, 6 karakter
- **Lépések:**
  1. Próbálj regisztrálni a különböző hosszúságú jelszavakkal.
- **Elvárt eredmény:**
  - A túl rövid jelszó elutasításra kerül érthető üzenettel.
- **Megjegyzés:** ARCHIVÁLT — SQ-6: a felhasználó döntése szerint erre nem kell teszteset (2026-09-30).

### TC-AUTH-010
**Bejelentkezés felhasználónévvel**

- **Forrás:** KAN-2; spec 4.10 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S megerősített fiók, kijelentkezett állapot.
- **Tesztadat:** S felhasználóneve + jelszó
- **Lépések:**
  1. Jelentkezz be S felhasználónevével és jelszavával.
- **Elvárt eredmény:**
  - Sikeres bejelentkezés, a navigációban S neve / profilmenüje látszik.

### TC-AUTH-011
**Bejelentkezés e-mail címmel**

- **Forrás:** KAN-2; spec 4.10 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** U1 megerősített fiók, kijelentkezett állapot.
- **Tesztadat:** omeckl@yahoo.com + jelszó
- **Lépések:**
  1. Jelentkezz be U1 e-mail címével és jelszavával.
- **Elvárt eredmény:**
  - Sikeres bejelentkezés.

### TC-AUTH-012
**Hibás jelszó / nem létező felhasználó**

- **Forrás:** KAN-2 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Ekvivalencia-osztály
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Kijelentkezett állapot.
- **Tesztadat:** S felhasználónév + rossz jelszó; nem létező 'qa_nincs_ilyen' + bármi
- **Lépések:**
  1. Próbálj bejelentkezni a két hibás kombinációval.
- **Elvárt eredmény:**
  - Mindkét esetben sikertelen bejelentkezés.
  - Az üzenet nem árulja el, hogy a felhasználó létezik-e (azonos szöveg).

### TC-AUTH-013
**Bejelentkezés kis/nagybetű-eltéréssel és szóközökkel**

- **Forrás:** spec 4.10 · **Prioritás:** P3 · **Típus:** Hibasejtés · **Technika:** Hibasejtés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** Kijelentkezett állapot.
- **Tesztadat:** '  Omeckl@Yahoo.com ' ; S felhasználónév nagybetűvel
- **Lépések:**
  1. Jelentkezz be a megadott változatokkal.
- **Elvárt eredmény:**
  - Az e-mail cím kis/nagybetűtől és vezető/záró szóköztől függetlenül működik.
  - A felhasználónév viselkedése konzisztens (ha érzékeny a kis/nagybetűre, jegyezd fel Megfigyelésként).

### TC-AUTH-014
**Kijelentkezés és védett oldalak elérhetetlensége utána**

- **Forrás:** KAN-2 · **Prioritás:** P1 · **Típus:** Negatív · **Technika:** Használati eset
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve.
- **Tesztadat:** Védett URL-ek: Foglalásaim, Hirdetéseim, Utasaim, Járműveim, Profil
- **Lépések:**
  1. Kattints a Kijelentkezés gombra.
  2. Nyisd meg közvetlen URL-lel egyenként a védett oldalakat.
  3. Használd a böngésző Vissza gombját.
- **Elvárt eredmény:**
  - A kijelentkezés után a védett oldalak nem jelenítenek meg adatot, bejelentkezésre irányítanak.
  - A Vissza gomb sem mutat korábbi személyes adatot.

### TC-AUTH-015
**A kijelentkezés gomb felirata mindenhol „Kijelentkezés”**

- **Forrás:** KAN-27 · **Prioritás:** P3 · **Típus:** Regresszió · **Technika:** Hibasejtés
- **Mód:** Böngésző · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** S bejelentkezve.
- **Tesztadat:** Nézetek: asztali navigáció, mobil navigáció (390×844), profilmenü, gyorslinkek
- **Lépések:**
  1. Nézd meg a kijelentkezés elemet minden megadott helyen.
- **Elvárt eredmény:**
  - Mindenhol pontosan „Kijelentkezés” a felirat (sehol nem „Kilépés”).

### TC-AUTH-016
**A jelszó hash-elve tárolódik**

- **Forrás:** KAN-9; spec 5 · **Prioritás:** P2 · **Típus:** Pozitív · **Technika:** Adat-ellenőrzés
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** TC-AUTH-001 lefutott.
- **Tesztadat:** qa_kivulallo
- **Lépések:**
  1. Lekérdezéssel nézd meg az auth.users encrypted_password mezőjét (csak a formátumot, az értéket ne írd ki).
  2. Ellenőrizd, hogy a public sémában (profiles stb.) nincs jelszó-oszlop.
- **Elvárt eredmény:**
  - Az encrypted_password bcrypt formátumú ($2a$/$2b$ előtag).
  - Nyílt szövegű jelszó sehol nem tárolódik.

### TC-AUTH-017
**Az adatkezelési hozzájárulás időpontja tárolódik**

- **Forrás:** spec 2.1, 4.6 · **Prioritás:** P3 · **Típus:** Pozitív · **Technika:** Adat-ellenőrzés
- **Mód:** Supabase · **Automatizálható:** Igen · **E-mail (db):** 0
- **Előfeltétel:** TC-AUTH-001 lefutott.
- **Tesztadat:** qa_kivulallo
- **Lépések:**
  1. Kérdezd le a profiles.consent_accepted_at mezőt.
- **Elvárt eredmény:**
  - Ki van töltve, és a regisztráció idejéhez közeli.
