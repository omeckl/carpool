# Telekocsi — tesztelői modul (`qa/`)

Ez a mappa a Telekocsi alkalmazás funkcionális tesztelésének alapja. Itt élnek a tesztesetek, az automata tesztek, a tesztadat-szkriptek és a tesztriportok.

## A skill

A tesztelés módszertanát a **`skills/funkcionalis-teszteles/`** skill írja le. Ezt Claude (Cowork / Claude Code) használja, amikor tesztelni, teszteseteket tervezni vagy írni, vagy tesztriportot készíteni kérik.

| Fájl | Tartalom |
|---|---|
| `SKILL.md` | Senior tesztelői módszertan: alapelvek, munkamenet, kockázatelemzés, teszttervezési technikák, teszteset- és hibajegy-formátum, eredmény-állapotok, elemzés, riportsablon, Telekocsi-orákulumok |
| `references/01-bongeszos-teszteles.md` | Élő, böngészős tesztelés (elfogadási, felderítő, UX, hibareprodukálás) |
| `references/02-playwright.md` | Playwright tesztszkriptek írása és futtatása, CI |
| `references/03-supabase-api.md` | Adatbázis-, API- és jogosultsági (RLS) tesztelés, párhuzamosság, invariánsok |

## Mappastruktúra (a skill használata során töltődik fel)

```
qa/
├── README.md
├── skills/funkcionalis-teszteles/   # a skill
├── tesztesetek/                     # tesztesetek.csv + modulonkénti .md
├── e2e/                             # Playwright projekt
├── db/                              # Supabase felderítés, invariánsok, API-tesztek
├── tesztadat/                       # adat-előkészítés, takarítás
└── riportok/<RUN-ID>/               # tesztriport.md, eredmenyek.csv, hibak.md, bizonyitekok/
```

## Használat — példa kérések

- „Tervezd meg a teszteseteket a KAN-31-hez.”
- „Futtass böngészős elfogadási tesztet a foglalás modulra az éles oldalon.”
- „Írd meg Playwrightban a P1 foglalási teszteseteket.”
- „Ellenőrizd a Supabase-ben a jogosultsági mátrixot és az invariánsokat.”
- „Készíts regressziós tesztriportot a mai deploy után.”

## Szabályok röviden

- A titkok (jelszavak, service role kulcs) csak `.env.local` fájlokban lehetnek, amelyek a `.gitignore`-ban vannak.
- Éles adatbázison adatot módosítani, Jira-jegyet nyitni csak jóváhagyással lehet.
- A tesztelő nem javítja az alkalmazás kódját — jelent, elemez, javasol.
