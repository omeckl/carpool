# 02 — Playwright tesztszkriptek

Újrafuttatható, determinisztikus end-to-end tesztek a repóban, amelyek helyben, a felhőben és GitHub Actionsben (CI) is futnak. Ez a regressziós biztonsági háló: amit egyszer már kézzel/böngészőből elfogadtunk, azt a Playwright minden kiadás előtt olcsón újraellenőrzi.

## Mit automatizálj (és mit ne)

Automatizáld, ha **mind** igaz:
- P1 vagy P2 prioritású, és várhatóan sokszor kell futtatni (regresszió, smoke);
- a lépések és az elvárt eredmény egyértelmű;
- a funkció már stabil (legalább egyszer sikeresen átment böngészős tesztelésen).

Ne automatizáld (vagy később): a gyakran változó UI-t, a tisztán vizuális/esztétikai ellenőrzéseket, az egyszeri teszteket, és azt, ami egy Supabase-szintű tesztben olcsóbban ellenőrizhető.

Telekocsi első körös jelöltjei: bejelentkezés; jármű felvétele; hirdetés létrehozása (dátum-határértékekkel); foglalás és kapacitás; ismételt foglalás összevonása; zárolt hirdetés szerkesztése; lemondás a megerősítő ablakkal (Mégse és OK ág); láthatósági szabályok (rendszám foglaló és nem foglaló utasnak); a három lista rendezése és címkéi.

## Mappastruktúra

A Playwright projekt a `qa/e2e/` mappában él, **saját `package.json`-nal**, hogy ne keveredjen az alkalmazás függőségeivel:

```
qa/e2e/
├── package.json              # @playwright/test, dotenv, @supabase/supabase-js
├── playwright.config.ts
├── .env.example              # a szükséges változók listája, értékek nélkül
├── fixtures/
│   ├── szereplok.ts          # sofőr, utas1, utas2, kívülálló — bejelentkezett page-ek
│   └── tesztadat.ts          # adat-előkészítés és takarítás Supabase-en keresztül
├── pages/                    # Page Object-ek: LoginPage, HirdetesUrlap, FoglalasaimPage…
├── tests/
│   ├── auth.spec.ts
│   ├── jarmu.spec.ts
│   ├── hirdetes.spec.ts
│   ├── foglalas.spec.ts
│   ├── lemondas.spec.ts
│   ├── listak.spec.ts
│   └── jogosultsag.spec.ts
└── .auth/                    # storageState fájlok (gitignore!)
```

A `qa/e2e/.env.local`, a `qa/e2e/.auth/`, a `test-results/` és a `playwright-report/` kerüljön a `.gitignore`-ba.

## Konfiguráció — alapelvek

- `baseURL` környezeti változóból: `BASE_URL` (alapértelmezés: helyi `http://localhost:5173`; éles: `https://carpool-tawny.vercel.app`; CI-ban: a Vercel preview URL).
- Projektek: `chromium` asztali, és egy mobil projekt (`devices['Pixel 7']` vagy `iPhone 14`) a fő folyamatokra.
- `timezoneId: 'Europe/Budapest'`, `locale: 'hu-HU'` — a dátum- és rendezési szabályok miatt kötelező.
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.
- `retries`: helyben 0, CI-ban 1. **Az újrapróbálás nem hibaelrejtés**: ha egy teszt csak újrapróbálással megy át, az „flaky”, és a riportban jelölni kell.
- Riporterek: `list` + `html` + `json` (a JSON-ból épül a tesztriport) + CI-ban `junit`.
- `fullyParallel: true` csak akkor, ha a tesztek adat szinten izoláltak (lásd lent); különben a fájlok futhatnak párhuzamosan, a fájlon belüli tesztek sorban.

A felhő-konténerben a Chromium előre telepítve van (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) — ott **ne** futtasd a `playwright install`-t. A felhasználó Windows-gépén: `npx playwright install chromium`.

## Tesztírási szabályok

### Elnevezés és nyomonkövethetőség

Minden teszt neve kezdődjön a teszteset-azonosítóval, és legyen címkézve:

```ts
test('TC-FOGL-012 Ismételt foglalás növeli a meglévő foglalás helyszámát',
  { tag: ['@P1', '@regresszio', '@KAN-31'] },
  async ({ utas1, tesztHirdetes }) => { /* … */ });
```

Így futtatható szűrve (`--grep @P1`), és a JSON-riportból a TC-ID alapján visszaírható az eredmény az `eredmenyek.csv`-be.

### Lokátorok — prioritási sorrend

1. `getByRole` hozzáférhető névvel (`getByRole('button', { name: 'Foglalás' })`)
2. `getByLabel` (űrlapmezők)
3. `getByText` — csak egyedi, stabil szövegre
4. `getByTestId` — ha a fenti három nem egyértelmű
5. CSS/XPath — **soha**, kivéve indokolt, kommentezett esetben

Ha a UI-ban nincs stabil lokátor, **ne írj törékeny szelektort**: gyűjtsd össze a javasolt `data-testid` attribútumokat (komponens, elem, javasolt név) a riport Javaslatok részébe. Az alkalmazás kódját csak a felhasználó kérésére módosítsd.

### Page Object-ek

Minden oldalhoz/űrlaphoz egy osztály a `pages/` mappában, amely **műveleteket** ad (pl. `hirdetesLetrehozasa({...})`, `foglal(helyek)`), a lokátorokat elrejti, és **nem tartalmaz assertiont** — az ellenőrzés a tesztben történik, hogy olvasható legyen, mit vizsgálunk.

### Várakozás és ellenőrzés

- **Tilos a `waitForTimeout`** (fix várakozás). Használj web-first assertiont: `await expect(locator).toHaveText(...)`, `toBeVisible()`, `toBeDisabled()`, amelyek maguktól újrapróbálnak.
- Hálózati eredményre várj `page.waitForResponse`-szal, ha a művelet mellékhatását kell elkapni.
- Egy teszt ne csak a UI-t ellenőrizze: a kritikus eseteknél a teszt végén **Supabase-lekérdezéssel** is ellenőrizd az adatot (a `tesztadat.ts` segédfüggvényein keresztül).

### Izoláció és tesztadat

- Minden teszt a saját adatát hozza létre (fixture-ben), és takarítja utána — **ne függjön más teszt eredményétől vagy futási sorrendjétől**.
- Az adatot lehetőleg API-n keresztül készítsd elő (gyors és stabil), és csak azt a lépést végezd UI-n, amit a teszt ténylegesen vizsgál. Példa: a foglalás-tesztben a jármű és a hirdetés API-val jön létre, a foglalás a felületen.
- Minden létrehozott adat `QA_` előtagot és egyedi utótagot kapjon (pl. `QA_Debrecen_${testInfo.workerIndex}_${Date.now()}`), így párhuzamos futtatásnál sem ütköznek.
- A dátumok relatívak: `maPlusz(3)`; a határérték-tesztek `maPlusz(0)`, `maPlusz(365)`, `maPlusz(366)`, `maPlusz(-1)`.
- A takarítás a `afterEach`/fixture teardown-ban fusson, hibás teszt esetén is.

### Bejelentkezés

- Szereplőnként egyszer jelentkezz be egy `setup` projektben, és mentsd a `storageState`-et a `.auth/` mappába; a tesztek ezt használják.
- A bejelentkezést magát egy külön teszt (`auth.spec.ts`) ellenőrzi a felületen.
- A tesztfelhasználók hitelesítő adatai csak környezeti változóból jöjjenek (`QA_SOFOR_EMAIL`, `QA_SOFOR_JELSZO`, …).

### Titkok

- A `SUPABASE_SERVICE_ROLE_KEY` (ha adat-előkészítéshez kell) **csak** a `.env.local`-ban és a CI titkai között legyen. Soha ne kerüljön kódba, logba, riportba vagy képernyőképre.
- Jogosultsági tesztekhez **ne** használd a service role kulcsot (megkerüli az RLS-t) — ott mindig a tesztfelhasználó saját munkamenetével dolgozz.

## Futtatás

```bash
cd qa/e2e
npm ci
npx playwright test                       # mind
npx playwright test --grep @P1            # csak P1
npx playwright test tests/foglalas.spec.ts
npx playwright test --project=mobil
npx playwright show-report                # HTML riport
```

Windows PowerShellben a környezeti változó: `$env:BASE_URL="https://carpool-tawny.vercel.app"; npx playwright test`.

## CI (GitHub Actions) — javasolt felállás

- Esemény: pull request, és sikeres Vercel preview deploy után a preview URL-lel.
- Lépések: checkout → Node beállítása → `npm ci` a `qa/e2e`-ben → `npx playwright install --with-deps chromium` → teszt → a HTML riport és a trace-ek feltöltése artifactként.
- PR-en a `@smoke` és `@P1` csomag fusson (gyors), éjszaka vagy kiadás előtt a teljes regresszió.
- A workflow-fájlt csak a felhasználó jóváhagyásával hozd létre (a repó közös, Orsolyával együtt dolgoznak rajta).

## Flaky tesztek kezelése

Egy teszt flaky, ha ugyanazon a kódon hol átmegy, hol nem. Ilyenkor:
1. Jelöld a riportban „Flaky” megjegyzéssel, a trace-szel.
2. Vizsgáld az okot: fix várakozás, rossz lokátor, megosztott adat, időzítés, sorrendfüggés, valódi versenyhelyzet az alkalmazásban (ez utóbbi **alkalmazáshiba**, nem tesztprobléma!).
3. Javítsd a tesztet; ha nem megy azonnal, `test.fixme` + hibajegy, de **ne** hagyd csendben bukni vagy újrapróbálással elrejtve.

## Eredmények a riportba

A futás után a `playwright-report` JSON-kimenetéből:
- töltsd ki az `eredmenyek.csv`-t (Mód = `Playwright`; Bizonyíték = trace/képernyőkép útvonala);
- a bukott teszteknél írj hibajegyet a SKILL.md 5. fejezete szerint — a Playwright hibaüzenete önmagában **nem** hibajegy, fordítsd le felhasználói nyelvre (elvárt vs. tényleges);
- különítsd el a **termékhibát** és a **teszthibát** (elavult lokátor, rossz tesztadat) — utóbbi nem kerül a hibastatisztikába, de a riportban szerepel.

## Kimenet ebből a módból (a skill által írt kód)

Amikor a skill Playwright-teszteket ír:
1. Először a teszteseteket nézi meg a `qa/tesztesetek/tesztesetek.csv`-ben (Automatizálható = Igen), és csak azokat implementálja.
2. Frissíti a teszteset „Mód” oszlopát (`Playwright`) és jelöli a tesztfájlt.
3. Lefuttatja a tesztet legalább egyszer, és csak zöld (vagy valódi termékhibán bukó, dokumentált) tesztet ad át.
4. Röviden összefoglalja: mely tesztesetek kerültek automatizálásra, melyek nem és miért, milyen `data-testid`-ket javasol.
