# 03 — Supabase / API / adatbázis szintű tesztelés

A felület alatti réteget teszteljük: adatbázis-állapotot, RPC-függvényeket, triggereket, sor szintű jogosultságot (RLS), Edge Functionöket. Csak itt lehet igazán ellenőrizni, hogy egy üzleti szabályt **a szerver kényszerít ki**, nem csak a felület — és hogy ki mihez fér hozzá.

## Mikor ezt használd

- **Állapot-ellenőrzés** egy böngészős vagy Playwright-lépés után (létrejött-e a foglalás, jó-e a helyszám, jó-e az állapot).
- **Szerver oldali validáció**: a UI megkerülésével is elutasítja-e a rendszer a tiltott műveletet (pl. KAN-14 kapacitás, KAN-19 dátum, KAN-21 zárolás, KAN-28 jármű-zárolás, saját hirdetésre foglalás).
- **Jogosultság (RLS)**: egy felhasználó olvashatja/módosíthatja-e más felhasználó adatát.
- **Párhuzamosság**: két egyidejű foglalás túlléphet-e a kapacitáson.
- **Adatintegritás**: invariánsok, amelyeknek mindig igaznak kell lenniük.
- **Mellékhatások**: értesítő Edge Function lefutott-e, hibázott-e.

## A rendszer felderítése (minden futás előtt röviden)

Mielőtt tesztet írsz, térképezd fel a valós sémát — ne feltételezz:

1. `supabase/migrations/` — táblák, nézetek, RPC-függvények, triggerek, RLS-szabályok, `revoke`/`grant` utasítások. A migrációk nevében gyakran benne van a KAN-szám is.
2. `supabase/functions/` — Edge Functionök (Telekocsi: `notify-booking`, `search-destination-photo`).
3. Supabase MCP: `list_tables`, `list_migrations`, `get_advisors` (biztonsági és teljesítmény-figyelmeztetések), `list_edge_functions`.
4. Készíts rövid **felderítési jegyzetet** a riport mellé: melyik üzleti szabályt melyik objektum kényszeríti ki (pl. „4.23 ismételt foglalás → `book_ride` RPC”). Ha egy szabályhoz **nem találsz** szerver oldali kikényszerítést, az önmagában kockázat — jelöld P1 tesztre.

## Két eszköz, két cél — ezt ne keverd össze

| Eszköz | Mire jó | Mire NEM jó |
|---|---|---|
| **Supabase MCP `execute_sql`** (vagy a service role kulcs) | adatállapot olvasása, invariánsok ellenőrzése, naplók | **jogosultság tesztelése** — megkerüli az RLS-t, ezért mindent lát |
| **supabase-js / REST a publikus (anon) kulccsal + a tesztfelhasználó bejelentkezésével** | RLS és jogosultság, RPC-k meghívása úgy, ahogy a kliens hívná, szerver oldali validáció a UI megkerülésével | teljes adatállapot átlátása |

Szabály: **jogosultsági állítást csak a felhasználó saját munkamenetével tett kísérlet alapján** jelenthetsz „Sikeres”-nek.

## Környezet és biztonság

- **Telekocsi:** nincs külön tesztkörnyezet, a tesztek az éles Supabase-projekten futnak (döntés: 2026-09-30, lásd SKILL.md 2.6). A `QA_` adatok írása a tesztfelhasználók nevében megengedett, a védett fiókok (József saját fiókja, `omeckl@yahoo.com`) érintetlenek maradnak, a futás végén takarítani kell.
- Más projektnél, ha van, használj **Supabase branchet** vagy külön tesztprojektet. Éles projekten egyébként csak:
  - olvasó lekérdezéseket futtass szabadon;
  - írni csak a tesztfelhasználók nevében, `QA_` jelölésű adattal szabad;
  - **migrációt, sémamódosítást, `delete`/`update` SQL-t, `reset_branch`-et soha ne futtass** a felhasználó kifejezett jóváhagyása nélkül.
- Az `execute_sql`-lel futtatott lekérdezések legyenek `select`-ek. Ha írni kell (adat-előkészítés), inkább a publikus RPC-ket használd a tesztfelhasználó nevében — az ugyanazt az utat járja be, mint a valódi kliens.
- A lekérdezés-eredményekből a riportba kerülő bizonyítéknál **maszkold** a személyes adatot (e-mail, telefon), ha nem tesztfelhasználóé.
- Kulcsok, tokenek soha ne kerüljenek a kimenetbe.

## Tesztfelhasználók létrehozása (Telekocsi-tapasztalatok)

- Elsősorban a felületen regisztrálj (ez maga is teszt), vagy az Auth admin API-val hozd létre a felhasználót.
- Ha mégis SQL-lel jön létre `auth.users` sor: kell hozzá `auth.identities` sor, a token-oszlopok üres stringek legyenek (ne NULL), különben az Edge Function `getUserById()` hívása „Database error loading user” hibával elszáll.
- A `handle_new_user()` trigger a `raw_user_meta_data`-ból tölti a `profiles` sort — a `username`, `full_name`, `phone` kötelező, nélkülük a teljes tranzakció elszáll.
- Frissen létrehozott felhasználónál előfordulhat egy átmeneti „JWT issued at future” hiba — ismételd meg a hívást, mielőtt hibának jelölnéd.

## Tesztkategóriák és minták

### 1. Állapot-ellenőrzés (UI-lépés után)

A teszteset „Akkor” részét adatszinten is igazold. Minta (a pontos tábla- és oszlopneveket a felderítésből vedd):

```sql
-- TC-FOGL-012: QA_Utas1-nek pontosan egy aktív foglalása van a hirdetésen, 3 hellyel
select count(*) as aktiv_foglalasok, sum(<helyek_oszlop>) as helyek
from <foglalasok_tabla>
where <hirdetes_id> = :hirdetes and <utas_id> = :utas1 and <allapot> = 'aktiv';
```

Mindig a **teljes elvárt állapotot** ellenőrizd, ne csak egy mezőt: darabszám, érték, állapot, időbélyeg, és hogy nincs-e fölösleges sor.

### 2. Szerver oldali validáció (UI megkerülése)

A tesztfelhasználó munkamenetével közvetlenül hívd az RPC-t / REST végpontot a tiltott bemenettel. Elvárt: hiba, és **az adat nem változott**. Telekocsi-ellenőrzőlista:

- hirdetés létrehozása a jármű férőhelyénél több szabad hellyel (KAN-14);
- hirdetés dátuma ma−1 és ma+366 (KAN-19), valamint a határok (ma, ma+365) elfogadása;
- zárolt (foglalt) hirdetés árának / dátumának módosítása; szabad helyek csökkentése a foglalt alá (KAN-21, 4.11);
- aktív hirdetéshez tartozó jármű módosítása és törlése (KAN-28);
- foglalás a saját hirdetésre; foglalás 0 vagy negatív helyre; foglalás a kapacitás felett; foglalás lejárt vagy törölt hirdetésre;
- lemondott foglalás ismételt lemondása vagy módosítása (tiltott állapotátmenet).

Minden esetben rögzítsd a hibaüzenetet is — értelmes-e, nem szivárogtat-e belső részletet (SQL, stack trace).

### 3. Jogosultsági mátrix (RLS)

Készíts mátrixot: **szereplő × erőforrás × művelet**, és minden cellára egy tesztet.

| Erőforrás / adat | Vendég | Kívülálló utas | Foglaló utas | Sofőr (tulajdonos) |
|---|---|---|---|---|
| Hirdetés listázása (nyilvános mezők) | ? (spec szerint) | olvas | olvas | olvas |
| Rendszám | nem | **nem** | olvas | olvas |
| Sofőr telefon / e-mail | nem | **nem** | olvas | — |
| Utas telefon / e-mail | nem | nem | saját | olvas (csak a saját hirdetésén foglalókét) |
| Más foglalásának módosítása / lemondása | nem | **nem** | csak a sajátját | ? (spec szerint) |
| Más hirdetésének / járművének módosítása | nem | **nem** | **nem** | csak a sajátját |

Ellenőrizd nézeteken (view) keresztül is: egy nézet `security_invoker` beállítás nélkül megkerülheti az RLS-t (a Telekocsin volt már ilyen advisor-javítás). Nézd meg a `get_advisors` biztonsági kimenetét is, és minden új figyelmeztetés legyen megállapítás.

### 4. Párhuzamosság / versenyhelyzet

A túlfoglalás a Telekocsi egyik legnagyobb kockázata. Minta: egy hirdetésen 1 szabad hely; két utas (vagy ugyanaz az utas két kérésben) **egyszerre** foglal.

```ts
const [a, b] = await Promise.allSettled([
  utas1.rpc('book_ride', { /* 1 hely */ }),
  utas2.rpc('book_ride', { /* 1 hely */ }),
]);
// Elvárt: pontosan egy sikeres; a foglalt helyek összege <= szabad helyek
```

Futtasd többször (pl. 10×), mert a versenyhelyzet nem minden futásnál jön elő. Egyetlen túlfoglalás is **Kritikus** hiba. Ugyanígy teszteld: ismételt foglalás összevonása párhuzamosan (nem jöhet létre két aktív foglalás), foglalás és hirdetés-törlés egyszerre.

### 5. Adatintegritási invariánsok

Olyan lekérdezések, amelyeknek **mindig üres eredményt** kell adniuk. Futtasd őket minden tesztfuttatás végén (és kérésre az éles adatbázison is, csak olvasva):

- hirdetés, ahol az aktív foglalások helyösszege > a hirdetés szabad helyei;
- hirdetés, ahol a szabad helyek > a jármű max férőhelye;
- utas, akinek egy hirdetésen egynél több aktív foglalása van;
- foglalás, amely a saját hirdetésre szól (utas = sofőr);
- aktív foglalás törölt hirdetésen (a „Törölt” állapotba kellett volna kerülnie);
- aktív hirdetés, amelynek a járműve nem létezik.

Az invariáns-lekérdezéseket a skill a `qa/db/invariansok.sql` fájlba gyűjti, egy lekérdezés = egy invariáns, fölötte kommentben a szabály és a forrás (KAN / spec pont).

### 6. Mellékhatások: e-mail és Edge Function

- A foglalás / módosítás / lemondás / törlés után ellenőrizd, hogy az értesítő függvény lefutott-e: Supabase MCP `query_logs` (Edge Function naplók) az adott időablakra.
- Ellenőrizd, hogy a **helyes esemény-típus** váltotta ki (új foglalás vs. módosítás — KAN-31 szerint az összevonásnál a módosítás sablon a helyes).
- Hiba a naplóban (pl. 4xx/5xx az e-mail-szolgáltatótól) akkor is megállapítás, ha a UI sikeresnek mutatta a műveletet.

### 7. Időfüggő logika

A „Lejárt” állapot származtatott (az indulási időponthoz képest). Teszteld a határt: indulás 1 perc múlva vs. 1 perce. Ha a szerver időzónája eltér (UTC vs. Europe/Budapest), éjfél körül és óraátállításnál keress eltérést — ez tipikus rejtett hiba.

## Kód és fájlok, amelyeket a skill ebben a módban ír

```
qa/db/
├── felderites.md            # szabály → DB-objektum megfeleltetés, nyitott kérdések
├── invariansok.sql          # mindig-üres lekérdezések
├── allapot-ellenorzesek/    # tesztesetenkénti ellenőrző lekérdezések (TC-ID a fájlnévben)
└── api-tesztek/             # supabase-js alapú tesztek (jogosultság, validáció, párhuzamosság)
```

Az `api-tesztek` futtatható a Playwright test runnerrel is (böngésző nélkül, `request`/supabase-js használatával), így közös riportba kerülnek a 02-es mód tesztjeivel. Ilyenkor a fájlok a `qa/e2e/tests/api/` alá kerülnek, `@api` címkével.

## Eredmények a riportba

- `eredmenyek.csv` sorai (Mód = `Supabase`), a Bizonyíték oszlopban a lekérdezés és az eredmény fájlja.
- Az invariáns-ellenőrzés eredménye külön táblázatban a riport „Elemzés” részében (invariáns, eredmény: OK / sérült sorok száma).
- A felderítésből származó kockázatok („ezt a szabályt semmi nem kényszeríti ki a szerveren”) a „Kockázatok és nyitott kérdések” részbe.
