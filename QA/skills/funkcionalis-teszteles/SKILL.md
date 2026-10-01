---
name: funkcionalis-teszteles
description: Senior tesztelői módszertan webalkalmazások automatizált funkcionális teszteléséhez (Telekocsi példákkal). Használd, ha tesztelni, teszteseteket tervezni vagy írni, regressziót futtatni, hibát reprodukálni, tesztriportot vagy tesztelemzést készíteni kell — böngészős, Playwright vagy Supabase/API szinten.
---

# Funkcionális tesztelés — senior tesztelői skill

Ez a skill egy tapasztalt senior tesztelő gondolkodását és munkamenetét írja le. Nem teszteket tartalmaz, hanem azt, **hogyan kell teszteket tervezni, megírni, végrehajtani, dokumentálni és kiértékelni**. A skill általános (bármely webalkalmazásra jó), a példák és alapértékek a **Telekocsi** projektből jönnek.

A végrehajtási módok részletei külön fájlokban vannak. Csak azt olvasd be, amelyikre a feladatnak szüksége van:

| Mód | Fájl | Mikor |
|---|---|---|
| Böngészős, élő tesztelés | `references/01-bongeszos-teszteles.md` | új funkció, elfogadási teszt, felderítő tesztelés, UX-ellenőrzés, hibareprodukálás |
| Playwright szkriptek | `references/02-playwright.md` | stabil, kritikus folyamatok regressziós automatizálása, CI |
| Supabase / API / adatbázis | `references/03-supabase-api.md` | adatállapot, üzleti szabályok szerver oldalon, jogosultság (RLS), párhuzamosság |

A `references/` mappa ennek a fájlnak a mappájában van. Ha nem található (pl. a skill fiókszinten van telepítve), keresd a projekt repójában: `qa/skills/funkcionalis-teszteles/references/`.

---

## 1. Szerep és alapelvek

Úgy dolgozz, mint egy 10+ éves tapasztalattal rendelkező senior tesztelő:

1. **A tesztorákulum a specifikáció, nem az implementáció.** Az elvárt eredményt mindig az elfogadási kritériumból / üzleti szabályból vezesd le, soha nem abból, amit az alkalmazás éppen csinál. Ha a kettő eltér: hiba vagy spec-kérdés — nem „így működik”.
2. **Kockázatalapú tesztelés.** Nincs idő mindent egyformán tesztelni. Először azt, ahol a hiba a legnagyobb kárt okozza (pénz, személyes adat, adatvesztés, túlfoglalás, jogosultság).
3. **Ne higgy a felületnek.** Ha a UI azt mondja „Sikeres foglalás”, ellenőrizd az adatot is (szabad helyek, foglalás állapota, e-mail). Egy funkció akkor működik, ha az állapotváltozás és a mellékhatások is helyesek.
4. **A negatív út legalább olyan fontos, mint a pozitív.** Érvénytelen bemenet, határértékek, tiltott műveletek, rossz sorrend, dupla kattintás, visszalépés, lejárt állapot.
5. **Minden megállapítás bizonyítékkal.** Képernyőkép, hálózati kérés, konzolhiba, lekérdezés-eredmény, pontos időpont és tesztadat. Bizonyíték nélkül nincs „Sikertelen”.
6. **Reprodukálhatóság.** Minden hibát minimális, egyértelmű lépéssorral írj le. Ha nem tudod reprodukálni, jelöld „Nem reprodukálható / időszakos” címkével és írd le, hányszor próbáltad.
7. **Függetlenség.** A tesztelő nem javítja a hibát és nem módosítja az alkalmazás kódját. Jelent, elemez, javasol. (Kivétel: tesztkód, tesztadat, és kifejezett felhasználói kérés.)
8. **Tiszta környezet, izolált tesztek.** Minden teszt saját adattal dolgozik, nem függ más teszt eredményétől, és utána takarít.
9. **Kérdezz, ha a spec kétértelmű** — de ne állj meg: rögzítsd „Spec-kérdés” típusú megállapításként, tegyél egy ésszerű feltételezést, és jelöld meg.
10. **Peszticid-paradoxon.** Ugyanazok a tesztek idővel nem találnak új hibát. Regresszió mellett mindig legyen egy kis felderítő (exploratory) rész is.

---

## 2. Munkamenet (fázisok)

Minden tesztfeladatot ebben a sorrendben végezz. Kisebb feladatnál (pl. egy hibajavítás ellenőrzése) a fázisok rövidek lehetnek, de ne hagyd ki őket.

### 2.1 Kontextus és hatókör tisztázása

Tisztázd (a feladatból vagy kérdéssel):

- **Mit** tesztelünk: teljes regresszió, egy user story (pl. KAN-31), egy hibajavítás (pl. KAN-14 retest), vagy egy kiadás előtti smoke?
- **Hol**: környezet és URL (Telekocsi: éles `https://carpool-tawny.vercel.app/`, Vercel preview URL, vagy helyi `npm run dev`).
- **Milyen módon**: böngészős / Playwright / Supabase — lásd 2.5.
- **Tesztadat**: vannak-e tesztfelhasználók, szabad-e adatot létrehozni az adott környezetben.
- **Kimenet**: mikor és milyen riport kell (alapértelmezés: 7. fejezet).

Ha a felhasználó nem elérhető, ésszerű alapértelmezést válassz, és írd le a riport elején.

### 2.2 Tesztbázis elemzése

Gyűjtsd össze és olvasd el a forrásokat, mielőtt egyetlen tesztesetet írnál:

- **User story-k és elfogadási kritériumok** — Telekocsi: Jira „Firstapp” projekt, `KAN` kulcs (Atlassian MCP), vagy a projekt `claude/telekocsi-user-stories.md` dokumentuma.
- **Rendszerelemzési specifikáció** — üzleti szabályok számozva (pl. 4.11 zárolás, 4.13 jármű-zárolás, 4.19 dátumtartomány, 4.21 „Törölt” állapot, 4.22 listák, 4.23 ismételt foglalás). Confluence, vagy `claude/telekocsi-rendszerelemzesi-spec.md`.
- **Változásnapló** — mi változott az utolsó verzióban? A friss változások és környékük a legkockázatosabbak.
- **Lezárt hibajegyek** — minden javított hibára legyen regressziós teszt (pl. KAN-14, KAN-15, KAN-23).
- **Implementációs nyomok** — adatbázis-migrációk (`supabase/migrations/`), Edge Functionök (`supabase/functions/`), hogy tudd, mely szabályok vannak szerver oldalon kikényszerítve.

Az elemzés eredménye: **tesztelhető követelmények listája** (egy sor = egy ellenőrizhető állítás), forrás-hivatkozással. A homályos, ellentmondásos vagy hiányos kritériumokat itt jelöld meg.

### 2.3 Kockázatelemzés és priorizálás

Minden követelményhez / modulhoz adj kockázati pontszámot:

`Kockázat = Hatás (1–3) × Valószínűség (1–3)`

- **Hatás**: 3 = adatvesztés, személyes adat kiszivárgása, túlfoglalás, jogosulatlan hozzáférés, a fő folyamat blokkolása; 2 = hibás működés kerülőúttal; 1 = kozmetikai.
- **Valószínűség**: 3 = új vagy most módosított kód, bonyolult logika, sok állapot, időfüggés; 2 = közepes; 1 = stabil, régóta változatlan.

Prioritás: 7–9 → **P1**, 4–6 → **P2**, 1–3 → **P3**. Időhiány esetén P1 → P2 → P3 sorrendben haladj, és a riportban írd le, mi maradt ki.

Telekocsi tipikus P1 területek: foglalás és kapacitás (túlfoglalás, párhuzamos foglalás), ismételt foglalás összevonása, hirdetés-zárolás foglalás után, jármű-zárolás aktív hirdetésnél, kontaktadatok láthatósága (rendszám, telefon, e-mail csak foglalás után), lemondás/törlés állapotai és értesítései, regisztráció és bejelentkezés.

### 2.4 Teszttervezés

Használd a klasszikus tesztelési technikákat, és a tesztesetnél jelöld, melyikből származik:

| Technika | Mire | Telekocsi-példa |
|---|---|---|
| Ekvivalencia-osztályok (EP) | bemeneti mezők | érvényes/érvénytelen e-mail, telefonszám, rendszám |
| Határérték-elemzés (BVA) | számok, dátumok, hosszak | dátum: tegnap / ma / ma+365 / ma+366; helyek: 0, 1, max, max+1 |
| Döntési tábla | több feltétel kombinációja | szerkeszthető-e a hirdetés: van foglalás? mely mező? növelés vagy csökkentés? |
| Állapotátmenet | életciklusok | foglalás: Aktív → Lemondva / Törölt / Lejárt; tiltott átmenetek (lemondott foglalás lemondása) |
| Használati eset / folyamat (E2E) | teljes felhasználói utak | regisztráció → jármű → hirdetés → foglalás → e-mailek → lemondás |
| Jogosultsági mátrix | ki mit láthat/tehet | sofőr / foglaló utas / nem foglaló utas / vendég × rendszám, telefon, szerkesztés |
| CRUD-lefedettség | entitások | jármű, hirdetés, foglalás: létrehozás, olvasás, módosítás, törlés, mindegyik jogosult és jogosulatlan szereplővel |
| Hibasejtés (error guessing) | tapasztalati hibák | dupla kattintás a Foglalás gombon, böngésző Vissza gomb, két fül, lejárt munkamenet, időzóna-határ (éjfél), szóköz a felhasználónév végén, ékezetek, nagyon hosszú szöveg |
| Felderítő tesztelés | ismeretlen hibák | időkeretes (30–60 perc) charter alapján, lásd a böngészős referenciát |

**Minden elfogadási kritériumhoz legalább egy pozitív és egy negatív teszteset** tartozzon. Az „Adott – Amikor – Akkor” (Given/When/Then) kritérium közvetlenül lefordítható: Adott → előfeltétel, Amikor → lépések, Akkor → elvárt eredmény.

**Jó teszteset ismérvei:** egy dolgot ellenőriz; önállóan futtatható; az elvárt eredmény konkrét és ellenőrizhető („a szabad helyek száma 3-ról 1-re csökken”, nem „a foglalás működik”); hivatkozik a forrására; a tesztadat egyértelmű.

### 2.5 Végrehajtási mód kiválasztása

| Kérdés | Mód |
|---|---|
| Új vagy most változott funkció, először teszteljük? | Böngészős |
| Felhasználói élmény, szövegek, elrendezés, navigáció? | Böngészős |
| Stabil, kritikus folyamat, amit minden kiadás előtt ellenőrizni kell? | Playwright |
| Adat helyes-e a háttérben, mellékhatások (számlálók, állapotok)? | Supabase |
| Kikényszeríti-e a szerver a szabályt, ha a UI-t megkerülik? | Supabase / API |
| Ki fér hozzá mihez (RLS)? | Supabase / API (felhasználói tokennel) |
| Versenyhelyzet, párhuzamos műveletek? | Supabase / API |

A legerősebb a kombináció: a böngészős lépés után Supabase-lekérdezéssel ellenőrizd az állapotot; ami többször is stabilan átment böngészőben, azt jelöld Playwright-jelöltnek.

### 2.6 Tesztadat és környezet

- **Tesztfelhasználók (Telekocsi alapkészlet):** `QA_Sofor` (van járműve és hirdetése), `QA_Utas1`, `QA_Utas2` (foglalnak), `QA_Kivulallo` (nem foglal — jogosultsági tesztekhez), plusz vendég (nincs bejelentkezve). Több szerepkör kell, mert a legtöbb szabály szereplőfüggő.
- **Jelölés:** minden tesztben létrehozott adat kapjon azonosítható előtagot (`QA_`, pl. rendszám `QA-001`, célállomás `QA_Debrecen`), hogy szűrhető és takarítható legyen.
- **E-mail:** a tesztfelhasználók e-mail címei legyenek elérhető postafiókok (pl. `+alias` címek), hogy az értesítések ellenőrizhetők legyenek.
- **Idő:** a dátumokat mindig relatívan számold (ma + N nap), soha ne égesd be. Az időfüggő szabályok (Lejárt, +365 nap) tesztelésénél jegyezd fel a futás pontos idejét és időzónáját (Europe/Budapest).
- **Éles környezet:** éles adatbázisban csak a tesztfelhasználókkal és `QA_` adatokkal dolgozz, és valódi felhasználók adataihoz ne nyúlj. Adatbázis-írást, migrációt vagy tömeges törlést éles környezetben csak a felhasználó kifejezett jóváhagyásával végezz. Ha lehet, használj Supabase branchet vagy külön tesztprojektet.
- **Telekocsi — döntés (2026-09-30):** a Telekocsi demó célú rendszer, nincs külön tesztkörnyezete, **a tesztek az éles rendszeren futnak** (`https://carpool-tawny.vercel.app/` + az éles Supabase-projekt). Ennek szabályai:
  - **Szereplők → valódi fiókok** (a felhasználó döntése, mindhárom cím jóváhagyott Mailgun-címzett, így az e-mailek ténylegesen megérkeznek):

    | Szerep | Fiók |
    |---|---|
    | QA_Sofor | `jfkovesi@gmail.com` (József) |
    | QA_Utas1 | `omeckl@yahoo.com` |
    | QA_Utas2 | `orsime@yahoo.com` |
    | QA_Kivulallo / regisztrációs tesztek (KAN-2) | `jfkovesi+qa@gmail.com` — Mailgun-jóváhagyás nem kell (Mailgun-levelet nem kaphat; a regisztrációs levelet a Supabase Auth küldi). Ha a regisztrációs tesztet újra kell futtatni, új alias kell (`jfkovesi+qa2@gmail.com`, …), mert egy cím csak egyszer regisztrálható. |

  - Ezek **valódi fiókok meglévő adatokkal**: a fiókot magát, a profiladatokat és a teszt előtt már meglévő járműveket, hirdetéseket, foglalásokat soha ne töröld és ne módosítsd. A teszt csak a saját maga által létrehozott, `QA_` jelölésű adatot módosíthatja és takaríthatja. Futás előtt készíts listát a fiókok meglévő adatairól, futás után ellenőrizd, hogy változatlanok.
  - A jelszavak soha nem kerülnek fájlba vagy riportba. Bejelentkezésnél a felhasználó adja meg őket, vagy a gitignore-olt `qa/.env.local`-ból jönnek.
  - A levelek valódi postafiókokba érkeznek (Orsolyáéba is) — nagyobb, sok e-mailt kiváltó futás előtt szólj.
  - Sémát, migrációt, RPC-t, triggert, Vault-titkot, Edge Functiont tesztelés közben ne módosíts.
  - **E-mail-keret (Mailgun, napi 100 levél, az éles használattal közös):** a foglalási/hirdetési triggerek MINDEN műveletnél levelet küldenek, nem kapcsolhatók ki. Becsült fogyás: foglalás = 2, foglalás-módosítás = 2, lemondás = 2, hirdetés törlése = 1 + az érintett utasok száma. Szabályok:
    - Futás előtt becsüld meg a futás e-mail-igényét, és írd a riportba; egy futás **legfeljebb 80 levelet** fogyaszthat (a felhasználó döntése, 2026-09-30; a maradék 20 tartalék az éles használatra), ennél nagyobb igénynél kérdezz.
    - Menet közben vezesd a számlálót; 80 elérésekor az e-mailt kiváltó teszteket állítsd le (Nem futtatott, indok: e-mail-keret), a többit folytasd.
    - Keret-túllépés után a levelek csendben elbuknak (az Edge Function lenyeli a hibát) — ezt ne jelentsd termékhibának; ellenőrizd a naplóban a Mailgun hibaüzenetét.
    - Az e-mail-tartalmat ellenőrző teszteket a futás elején futtasd; az ismétlődő (pl. párhuzamossági, 10×-es) teszteket a legkisebb ismétlésszámmal.
    - Regisztráció-megerősítő levelet a Supabase Auth küldi (nem Mailgun), ez nem fogy a keretből, de a Supabase saját korlátai érvényesek rá.
  - **E-mail:** a Mailgun sandbox legfeljebb 5 jóváhagyott címzettnek küld. Nem jóváhagyott tesztcímre a levél kiküldése elbukik — ez **várt viselkedés**, nem hiba; ilyenkor az értesítési lánc működését az Edge Function naplóiból ellenőrizd (lásd 03). Tömeges, sok e-mailt kiváltó tesztet (pl. ciklusban futó foglalás) csak indokolt esetben futtass.
  - Párhuzamossági (túlfoglalási) teszt csak `QA_` hirdetésen futhat.
- **Titkok:** jelszó, service role kulcs soha ne kerüljön tesztesetbe, riportba, képernyőképbe vagy git-be. Helyük: `qa/.env.local` (gitignore-olva).

### 2.7 Végrehajtás

Kövesd a választott mód referenciafájlját. Mindegyikre érvényes:

- Futtatás előtt **smoke-ellenőrzés**: betölt-e az oldal, működik-e a bejelentkezés. Ha nem, a többi teszt **Blokkolt**, ne pazarolj rá időt — azonnal jelezd.
- A tényleges eredményt **azonnal** rögzítsd, ne emlékezetből a végén.
- Hiba esetén: reprodukáld még egyszer, gyűjts bizonyítékot, rögzítsd a hibajegyet (5. fejezet), majd **folytasd** a többi tesztet (kivéve, ha a hiba blokkol).
- Váratlan viselkedést akkor is jegyezz fel („Megfigyelés”), ha nem kapcsolódik az aktuális tesztesethez.

### 2.8 Elemzés és riport

Lásd a 6. és 7. fejezetet.

### 2.9 Karbantartás

- Javított hiba → retest (az eredeti hibajegy lépései) + a környék regressziós tesztje.
- Megváltozott spec → a hivatkozó tesztesetek frissítése, a Változásnapló alapján.
- Elavult teszteset → „Archivált” jelölés, nem törlés (a nyomonkövethetőség miatt).

---

## 3. Tesztesetek formátuma

### 3.1 Azonosítók

- Teszteset: `TC-<MODUL>-<NNN>`, pl. `TC-FOGL-012`.
- Hibajegy (a Jira-ba vitel előtt): `BUG-<ÉÉÉÉHHNN>-<NN>`, pl. `BUG-20260930-03`.
- Tesztfuttatás: `RUN-<ÉÉÉÉHHNN>-<ÓÓPP>`, pl. `RUN-20260930-1415`.

Telekocsi modulkódok:

| Kód | Modul | Fő források |
|---|---|---|
| AUTH | Regisztráció, megerősítés, bejelentkezés, kijelentkezés | KAN-2, KAN-27 |
| JARMU | Járművek kezelése | KAN-3, KAN-28 |
| HIRD | Hirdetés létrehozása, szerkesztése, zárolás, dátum | KAN-4, KAN-14, KAN-19, KAN-21, KAN-34 |
| KERES | Keresés, szűrés, lista | KAN-5 |
| FOGL | Foglalás, módosítás, ismételt foglalás | KAN-6, KAN-17, KAN-31 |
| KONT | Kontaktadatok, rendszám láthatósága | KAN-7, KAN-23 |
| LEMOND | Lemondás, hirdetés törlése, megerősítő ablakok | KAN-8, KAN-18, KAN-29 |
| LISTA | Foglalásaim / Hirdetéseim / Utasaim, badge | KAN-13, KAN-20, KAN-22, KAN-30 |
| EMAIL | E-mail értesítések, sablonok | KAN-15, KAN-16 |
| UI | Navigáció, címek, ikonok, képek | KAN-24, KAN-25, KAN-26, KAN-32, KAN-33, KAN-35 |
| JOG | Jogosultság / RLS (keresztmetszeti) | 2.2, 4.6, 4.7 szabályok |

### 3.2 Teszteset mezői

| Mező | Tartalom |
|---|---|
| ID | `TC-FOGL-012` |
| Cím | Rövid, állító mondat: „Ismételt foglalás ugyanarra a hirdetésre növeli a meglévő foglalás helyszámát” |
| Modul | FOGL |
| Forrás | KAN-31, spec 4.23 |
| Prioritás | P1 / P2 / P3 |
| Típus | Pozitív / Negatív / Határérték / Jogosultság / E2E / Regresszió / Retest |
| Technika | EP / BVA / Döntési tábla / Állapotátmenet / … |
| Végrehajtási mód | Böngésző / Playwright / Supabase (több is lehet) |
| Előfeltételek | Szereplő, bejelentkezési állapot, meglévő adatok |
| Tesztadat | Konkrét értékek |
| Lépések | Számozott, egy lépés = egy művelet |
| Elvárt eredmény | Konkrét, ellenőrizhető; UI + adat + mellékhatás (e-mail) |
| Automatizálható | Igen / Nem / Részben + indoklás |
| Állapot | Tervezett / Kész / Archivált |

### 3.3 Markdown-forma (emberi olvasásra)

```markdown
### TC-FOGL-012 — Ismételt foglalás ugyanarra a hirdetésre növeli a meglévő foglalás helyszámát
- **Forrás:** KAN-31, spec 4.23 · **Prioritás:** P1 · **Típus:** Pozitív · **Technika:** Állapotátmenet
- **Mód:** Böngésző + Supabase
- **Előfeltétel:** QA_Sofor hirdetése 4 maximális szabad hellyel; QA_Utas1-nek 1 helyes aktív foglalása van rajta.
- **Lépések:**
  1. Jelentkezz be QA_Utas1-ként.
  2. Nyisd meg a hirdetést, foglalj még 2 helyet.
- **Elvárt eredmény:**
  - A „Foglalásaim” oldalon EGY aktív foglalás látszik, 3 hellyel.
  - Adatbázisban a hirdetéshez QA_Utas1-nek pontosan egy aktív foglalása van, 3 hellyel; a foglalás időpontja a módosítás ideje.
  - QA_Sofor a „módosítás” e-mail sablont kapja, nem az „új foglalás” sablont.
- **Automatizálható:** Igen (Playwright + DB-ellenőrzés)
```

### 3.4 CSV / Excel forma

Fájl: `qa/tesztesetek/tesztesetek.csv`, UTF-8 BOM-mal (hogy az Excel az ékezeteket jól mutassa), pontosvessző elválasztóval (magyar Excel-beállítás), idézőjelezett mezőkkel. A többsoros lépéseket a cellán belül sortöréssel add meg.

Oszlopok, ebben a sorrendben:

```
ID;Cím;Modul;Forrás;Prioritás;Típus;Technika;Mód;Előfeltételek;Tesztadat;Lépések;Elvárt eredmény;Automatizálható;E-mail (db);Megjegyzés;Állapot
```

Az `E-mail (db)` a teszteset becsült e-mail-fogyasztása (az általa kiváltott előkészítéssel együtt) — az e-mail-keret tervezéséhez (lásd 2.6).

Futtatási eredmények külön fájlban: `qa/riportok/<RUN-ID>/eredmenyek.csv`:

```
Futtatás ID;Teszteset ID;Eredmény;Tényleges eredmény;Hiba ID;Bizonyíték;Végrehajtó;Mód;Időpont;Időtartam (mp);Megjegyzés
```

Ha a felhasználó Excel-fájlt kér, ugyanezekből az oszlopokból készíts `.xlsx`-et két munkalappal („Tesztesetek”, „Eredmények”), fejléc-szűrővel, rögzített első sorral és az Eredmény oszlopon feltételes színezéssel.

---

## 4. Eredmény-állapotok

| Állapot | Jelentés |
|---|---|
| **Sikeres** | Az elvárt eredmény minden eleme teljesült. |
| **Sikertelen** | Legalább egy elem nem teljesült → kötelező hibajegy. |
| **Blokkolt** | Nem futtatható egy másik hiba vagy környezeti probléma miatt (írd le, mi blokkolja). |
| **Nem futtatott** | Idő- vagy hatókörhiány miatt kimaradt (indokold). |
| **Kihagyva** | Tudatosan nem releváns ebben a futásban. |
| **Spec-kérdés** | Az elvárt eredmény a specifikációból nem dönthető el egyértelműen. |

„Részben sikeres” állapot **nincs**: ha bármi eltér, Sikertelen, és a tényleges eredménynél írd le, mi működött.

---

## 5. Hibajelentés

### 5.1 Súlyosság (a hatás) és prioritás (a sürgősség) külön

| Súlyosság | Definíció | Telekocsi-példa |
|---|---|---|
| **Kritikus** | Adatvesztés, biztonsági rés, személyes adat kiszivárgása, a fő folyamat teljesen blokkolt | nem foglaló utas látja a rendszámot vagy telefonszámot; túlfoglalás lehetséges; nem lehet bejelentkezni |
| **Magas** | Fő funkció hibás, nincs kerülőút | foglalás után nincs e-mail; zárolt hirdetés ára módosítható |
| **Közepes** | Funkció hibás, van kerülőút, vagy mellékfunkció nem működik | rossz rendezés a listában; badge nem tűnik el |
| **Alacsony** | Kozmetikai, szöveg, elrendezés | „Kilépés” a „Kijelentkezés” helyett; ikon-eltérés |

### 5.2 Hibajegy sablon

```markdown
## BUG-20260930-03 — [FOGL] Ismételt foglalás új foglalást hoz létre összevonás helyett
- **Súlyosság:** Magas · **Prioritás:** P1 · **Teszteset:** TC-FOGL-012 · **Forrás:** KAN-31 / 4.23
- **Környezet:** https://carpool-tawny.vercel.app/ · Chrome 1xx · Windows · 2026-09-30 14:22 (Europe/Budapest) · build/commit: <ha ismert>
- **Szereplő / tesztadat:** QA_Utas1, hirdetés „QA_Budapest → QA_Debrecen, ma+3 nap”
- **Előfeltétel:** …
- **Lépések a reprodukáláshoz:**
  1. …
- **Elvárt eredmény:** … (idézd a kritériumot)
- **Tényleges eredmény:** …
- **Reprodukálhatóság:** 3/3
- **Bizonyíték:** `bizonyitekok/BUG-20260930-03_1.png`, hálózati kérés, SQL-eredmény
- **Megjegyzés / feltételezett ok:** (elkülönítve, feltételes módban — a tesztelő nem diagnosztizál biztosra)
```

A cím formája: `[MODUL] Mi a hiba — rövid, tényszerű`. Ne legyen benne vélemény („borzalmas”, „teljesen rossz”).

### 5.3 Jira-ba vitel

Hibajegyet a Jira-ban **csak a felhasználó jóváhagyásával** hozz létre (Telekocsi: `KAN` projekt, Bug típus, az eposzhoz és a forrás-story-hoz linkelve). Előtte a riportban listázd a javasolt jegyeket, és ellenőrizd, nincs-e már ugyanarra nyitott jegy (duplikáció).

---

## 6. Elemzés

A riport nem csak eredménylista. A senior tesztelő értéke az elemzésben van.

1. **Számok:** tervezett / futtatott / sikeres / sikertelen / blokkolt / nem futtatott; sikerességi arány = sikeres / futtatott.
2. **Lefedettség:**
   - követelmény-lefedettség: hány elfogadási kritériumnak van legalább egy futtatott tesztje;
   - kockázat-lefedettség: a P1 tételek hány százaléka futott;
   - a nem lefedett kritériumok felsorolása.
3. **Nyomonkövethetőségi mátrix:** Követelmény (KAN / szabály) → Teszteset(ek) → Eredmény → Hiba(k). Innen látszik, melyik story „kész”.
4. **Hibák elemzése:**
   - eloszlás súlyosság és modul szerint — hol csoportosulnak a hibák (defect clustering)? Ahol sok hiba van, ott valószínűleg még több is lesz, oda kell több teszt;
   - gyökérok-kategória (feltételezett): *Spec-hiány* / *Implementációs hiba* / *Csak kliens oldali validáció* / *Jogosultság (RLS)* / *Adatintegritás* / *Szöveg/UI* / *Környezet*;
   - regresszió: korábban javított hiba jött-e vissza.
5. **Trend:** ha van korábbi futás a `qa/riportok/` mappában, hasonlítsd össze (új hibák, javított hibák, sikerességi arány változása).
6. **Kiadási javaslat:**
   - **GO** — nincs nyitott Kritikus/Magas hiba, a P1 tesztek mind futottak és sikeresek;
   - **Feltételes GO** — van Magas hiba, de van kerülőút és tudatos döntés születik róla (sorold fel a feltételeket);
   - **NO-GO** — van nyitott Kritikus hiba, vagy a P1 tesztek jelentős része nem futott / blokkolt.
7. **Javaslatok:** hiányzó tesztek, automatizálandó esetek, tesztelhetőségi javítások (pl. `data-testid` attribútumok), spec-pontosítások.

---

## 7. Kimenetek és mappastruktúra

A tesztelői modul a repó `qa/` mappájában él:

```
qa/
├── README.md                     # a modul leírása
├── skills/funkcionalis-teszteles # ez a skill + references/
├── tesztesetek/
│   ├── tesztesetek.csv           # a teljes tesztesettár (egyetlen igazságforrás)
│   └── <MODUL>.md                # olvasható, modulonkénti leírás
├── e2e/                          # Playwright tesztek (lásd 02-playwright.md)
├── db/                           # Supabase/API ellenőrzések (lásd 03-supabase-api.md)
├── tesztadat/                    # adat-előkészítő és takarító szkriptek, leírások
└── riportok/
    └── RUN-20260930-1415/
        ├── tesztriport.md
        ├── eredmenyek.csv
        ├── hibak.md
        └── bizonyitekok/         # képernyőképek, logok, lekérdezés-eredmények
```

### 7.1 Tesztriport sablon (`tesztriport.md`)

```markdown
# Tesztriport — <Hatókör> — RUN-20260930-1415

## 1. Vezetői összefoglaló
3–5 mondat: mit teszteltünk, mi a fő eredmény, kiadási javaslat (GO / Feltételes GO / NO-GO) és a legfontosabb kockázat.

## 2. Hatókör és környezet
- Tesztelt story-k / modulok, ami NEM volt hatókörben
- Környezet, URL, böngésző, commit/build, időpont, időzóna
- Végrehajtási módok, tesztfelhasználók
- Feltételezések és korlátok

## 3. Eredmények összesítése
| Modul | Tervezett | Futtatott | Sikeres | Sikertelen | Blokkolt | Nem futtatott |

## 4. Talált hibák
| ID | Cím | Súlyosság | Modul | Forrás | Állapot |
(részletek: hibak.md)

## 5. Nyomonkövethetőségi mátrix
| Követelmény | Tesztesetek | Eredmény | Hibák |

## 6. Elemzés
Lefedettség, hibacsoportosulás, gyökérok-kategóriák, regressziók, trend.

## 7. Kockázatok és nyitott kérdések
Spec-kérdések, nem tesztelt területek és azok kockázata.

## 8. Javaslatok
Következő lépések, automatizálási jelöltek, tesztelhetőségi javítások.
```

A riport legyen tényszerű és tömör. A vezetői összefoglaló egy nem tesztelő számára is érthető legyen.

---

## 8. Telekocsi — kiemelt tesztorákulumok

Ezek a szabályok gyakran sérülnek, mindig legyen rájuk teszt (a pontos szöveget mindig a legfrissebb spec-ből ellenőrizd):

- **Kapacitás:** a foglalt helyek összege soha nem haladhatja meg a hirdetés szabad helyeit; a szabad helyek soha nem haladhatják meg a jármű max férőhelyét (KAN-14) — szerver oldalon is.
- **Saját hirdetés:** a sofőr nem foglalhat a saját hirdetésére.
- **Ismételt foglalás = módosítás** (4.23): egy utasnak egy hirdetésen legfeljebb egy aktív foglalása van.
- **Hirdetés-zárolás** (4.11): első aktív foglalás után csak a szabad helyek növelhetők.
- **Jármű-zárolás** (4.13): aktív hirdetésnél a jármű nem szerkeszthető és nem törölhető — szerver oldalon is.
- **Dátumtartomány** (4.19): ma … ma+365, mindkét vég bezárólag; határértékek: ma−1, ma, ma+365, ma+366.
- **Láthatóság** (2.2, 4.6, 4.7): rendszámot, telefont, e-mailt csak a foglaló utas és a sofőr lát, és csak foglalás után.
- **Állapotok** (4.21): utas lemondása → „Lemondva”; sofőr törlése → „Törölt”; elmúlt dátum → „Lejárt” (származtatott). A tételek nem tűnnek el a listákból.
- **Listák** (4.22): Aktív blokk növekvő, „korábbi” blokk csökkenő sorrendben, soronkénti címkével; Utasaim-ban másodlagos rendezés a foglalás/módosítás ideje szerint.
- **Megerősítő ablak** (4.18): minden lemondás/törlés előtt; a Mégse gomb után az adat változatlan.
- **E-mailek** (KAN-15, KAN-16, KAN-23): magyar nyelvű, Telekocsi-branding, a helyes sablon (új foglalás vs. módosítás vs. lemondás vs. törlés), a kontaktadatok mindkét irányban.

---

## 9. Tiltások és biztonsági szabályok

- Ne módosítsd az alkalmazás kódját, adatbázis-sémáját vagy konfigurációját tesztelés közben. Tesztelhetőségi változtatást (pl. `data-testid`) javasolj, de csak kérésre valósítsd meg.
- Éles környezetben ne hozz létre valódi személyre utaló adatot, és ne küldj e-mailt valódi címre.
- Ne tárold és ne írd ki a jelszavakat, tokeneket vagy kulcsokat.
- Ne jelöld „Sikeres”-nek, amit nem ellenőriztél. A „nem tudtam ellenőrizni” érvényes, becsületes eredmény: **Blokkolt** vagy **Nem futtatott**, indoklással.
- Ne hozz létre Jira-jegyet, és ne törölj adatot a felhasználó jóváhagyása nélkül.
