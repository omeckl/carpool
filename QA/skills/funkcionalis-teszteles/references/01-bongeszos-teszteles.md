# 01 — Böngészős, élő tesztelés

Claude a böngészőt vezérli, és valódi felhasználóként hajtja végre a teszteseteket: kattint, kitölti az űrlapokat, és képernyőképpel bizonyít. Ez a mód akkor a legerősebb, ha **gondolkodó** tesztelésre van szükség: új funkció első tesztje, elfogadási teszt, UX-ellenőrzés, felderítő tesztelés, hibareprodukálás.

## Mikor NE ezt használd

- Ha ugyanazt a stabil folyamatot sokadszor kell lefuttatni → Playwright.
- Ha a kérdés az, hogy a szerver kikényszerít-e egy szabályt a UI megkerülésével → Supabase/API.
- Ha tömeges adatvariáció kell (sok bemeneti kombináció) → Playwright paraméterezett teszt.

## Eszközök

- **Beépített böngésző** (`Claude_Browser` eszközök) — ez az alapértelmezett. Saját, tartós profilja van, ezért előfordulhat, hogy egy korábbi munkamenetből be van jelentkezve valaki: **minden futás elején ellenőrizd, ki van bejelentkezve**, és szükség esetén jelentkezz ki.
- **Claude in Chrome** — csak akkor, ha a felhasználó ezt kéri.
- Olvasáshoz a `get_page_text` / `read_page` / `find` eszközt használd (pontos szöveget és struktúrát ad). **Bizonyítékhoz** készíts képernyőképet.
- A konzol- és hálózati napló-olvasó eszközökkel minden fontos lépés után ellenőrizd, hogy nincs-e JavaScript-hiba vagy 4xx/5xx válasz.

## Végrehajtási protokoll

### A futás előtt

1. Hozz létre futásazonosítót (`RUN-ÉÉÉÉHHNN-ÓÓPP`) és a riportmappát (`qa/riportok/<RUN-ID>/bizonyitekok/`).
2. Rögzítsd a környezetet: URL, időpont (Europe/Budapest), böngésző, és ha elérhető, a telepített verzió (Vercel deploy / commit).
3. **Smoke-teszt:** a nyitóoldal betölt; a konzolban nincs kritikus hiba; a tesztfelhasználó be tud jelentkezni. Ha bármelyik elbukik, minden további teszt Blokkolt — jelezd azonnal a felhasználónak.
4. Készítsd elő a tesztadatot (a teszteset előfeltételei szerint), vagy ellenőrizd Supabase-ből, hogy megvan.

### Tesztesetenként

1. Olvasd be a tesztesetet (ID, előfeltétel, lépések, elvárt eredmény).
2. Állítsd be az előfeltételt (a megfelelő szereplővel bejelentkezve, a megfelelő oldalon).
3. Hajtsd végre a lépéseket **pontosan**, ahogy le vannak írva. Ha el kell térned, írd le, miért.
4. Minden „Akkor” elemet ellenőrizz külön:
   - **UI:** szöveg, érték, elem megléte/hiánya, állapot (letiltott gomb, csak olvasható mező);
   - **Adat:** ha a teszteset kéri, Supabase-lekérdezéssel (lásd 03);
   - **Mellékhatás:** e-mail, badge, lista-átrendeződés.
5. Kulcspontokon készíts képernyőképet: az előfeltétel állapota, a döntő lépés, az eredmény. Fájlnév: `<TC-ID>_<lépés>_<rövid-leírás>.png`.
6. Nézd meg a konzolt és a hálózati hívásokat. Egy „sikeres” UI mögötti 500-as válasz is hiba.
7. Rögzítsd az eredményt az `eredmenyek.csv`-be azonnal.
8. Hiba esetén: állítsd vissza az előfeltételt, **reprodukáld még egyszer**, majd írd meg a hibajegyet.

### Több szereplő kezelése

A Telekocsi szinte minden szabálya szereplőfüggő (sofőr / foglaló utas / nem foglaló utas / vendég). Szereplőváltásnál:

- jelentkezz ki a felületen, és ellenőrizd, hogy tényleg kijelentkezett (egy védett oldal ne legyen elérhető);
- a jogosultsági teszteknél **közvetlen URL-lel** is próbáld megnyitni a más szereplőhöz tartozó oldalt (pl. egy más utas foglalását, egy más sofőr hirdetésének szerkesztő oldalát) — a menüben nem látszó oldal attól még elérhető lehet;
- a vendég-teszteknél kijelentkezett állapotban nézd meg ugyanazokat az oldalakat.

### Megerősítő ablakok

- A Telekocsi saját (nem natív) megerősítő ablakot használ a lemondásnál és a törlésnél (KAN-18). Mindig teszteld a **Mégse** ágat is, és utána ellenőrizd, hogy az adat változatlan.
- **Natív böngésző-dialógust (alert/confirm/prompt) ne válts ki**, mert blokkolja az automatizálást. Ha egy gomb natív dialógust nyit, az önmagában megfigyelés (UX-eltérés a spectől), jelezd, és kérdezd meg a felhasználót, mielőtt rákattintasz.

### E-mailek ellenőrzése

- Ha van hozzáférés a tesztpostafiókhoz, ellenőrizd a tárgyat, a feladót, a nyelvet (magyar), a sablon típusát és a tartalmat (kontaktadatok, rendszám).
- Ha nincs, a Supabase-oldalon ellenőrizd az értesítés elküldését (Edge Function naplók, lásd 03), és a teszteset e-mail részét jelöld **Blokkolt**-nak, indoklással („nincs hozzáférés a postafiókhoz”).

### Reszponzív ellenőrzés

A fő folyamatokat legalább két nézetben nézd meg: asztali (1366×768) és mobil (390×844). Figyelj a mobil navigációra (hamburger menü, profilmenü), a kilógó elemekre és az elérhetetlen gombokra.

## Hibasejtési ellenőrzőlista (minden űrlapra és műveletre)

- Üres mezők, csak szóköz, vezető/záró szóköz
- Nagyon hosszú szöveg (255+ karakter), ékezetes és speciális karakterek (`ő ű " ' < > &`)
- Határértékek: 0, 1, max, max+1, negatív szám, tizedes tört
- Dupla kattintás a beküldő gombon (duplikált foglalás/hirdetés?)
- Böngésző Vissza gomb egy sikeres művelet után, majd újraküldés
- Oldalfrissítés (F5) folyamat közben; ugyanaz az oldal két fülön, az egyiken módosítva
- Lejárt munkamenet (kijelentkezés egy másik fülön) után művelet
- Közvetlen URL-lel elért védett oldal kijelentkezve
- Időhatár: éjfél körüli dátum, ma induló, de már elmúlt időpontú út (Lejárt?)
- Közben változott adat: amíg az utas nézi a hirdetést, a sofőr törli / más betelíti

## Felderítő tesztelés (Session-Based Test Management)

Ha a feladat felderítő tesztelés, vagy a tervezett tesztek után marad idő:

1. Írj **chartert**: „Fedezd fel a(z) *<terület>*-et *<eszközökkel/adatokkal>*, hogy megtudd *<milyen kockázat>*.”
   Példa: „Fedezd fel a foglalás-módosítást két utassal párhuzamosan, hogy kiderüljön, túlléphető-e a kapacitás.”
2. Időkeret: 30–60 perc.
3. Vezess **jegyzetet** menet közben: mit próbáltál, mit tapasztaltál, kérdések, hibák, ötletek.
4. A végén rövid összefoglaló a riport „Felderítő tesztelés” szakaszába: charter, idő, lefedett terület, talált hibák, új tesztesetjavaslatok.
5. A talált hibákhoz utólag írj formális tesztesetet (regresszióhoz).

## Kimenet ebből a módból

- `eredmenyek.csv` sorai (Mód = `Böngésző`)
- képernyőképek a `bizonyitekok/` mappában
- hibajegyek a `hibak.md`-ben
- **Playwright-jelöltek listája:** azok a tesztesetek, amelyek stabilan, egyértelmű lépésekkel lefutottak, és P1/P2 prioritásúak — ezt a riport Javaslatok részébe írd.
