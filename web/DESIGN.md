# DESIGN · Huella Rosa

> Written by `/uak-design-lock` from the direction the human picked by looking (round R1, variant v1, with the
> human's changes: the hero map is real Mapbox GL `light-v11` and the states themselves extrude; no cylinder bars).
> Global changes after the lock need a human decision.

## Direction
- Name: `Lámina` · Intent: `EIRA's impact shown as a labeled specimen sheet: white paper, ink frames, one pink that carries the data`
- The one memorable element: `the 3D map of Mexico whose states rise in EIRA pink, full-bleed; plates (Carga, Informe, landing) carry the ink frame with two pink registration squares; everything else is calm paper and hairlines`
- References: `web/public/design-lock/refs/r1-v1-1280.png` (the picked landing variant); no product links were given

## Type
- Families: display `Outfit` (600, 700) · body `Figtree` (400, 600) (2 at most; never Inter, Roboto, Arial or Geist by default)
- Scale (px, ratio ≥ 1.25, 6 steps at most): `12 / 14 / 16 / 20 / 28 / 48`
- Body: `16` px · line height `1.5` · hero display `48` px · tabular figures for numbers: yes

## Space and shape
- Spacing scale (px): `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` (use 3-4 steps per screen)
- Radius family: `2 / 6` (square, like a printed sheet) · elevation: one level (`--shadow`, the nav only), hairlines `1px --line`, frames `1.5px --frame`
- Content width `1200` px · side panel `392` px

## Color (tokens in `web/src/index.css`)
| Token | Value | Job |
|---|---|---|
| `--bg` | `#FFFFFF` | page |
| `--surface` / `--surface-2` | `#FFFFFF` / `#FCE4EC` | the one container level / pale pink fill (chips, map ground) |
| `--text` / `--text-2` | `#3A3A3A` / `#6B6468` | body / secondary |
| `--frame` / `--line` | `#3A3A3A` / `#E9DFE3` | plate frames, active tab / hairlines |
| `--accent` | `#B83A63` | the primary action and the brand moment, nothing else (EIRA pink deepened for AA) |
| `--accent-ink` | `#FFFFFF` | text on the accent (contrast ≥ 4.5:1, `design-lint` checks it) |
| `--rose-pale` / `--rose` / `--rose-deep` | `#FCE4EC` / `#F08FAA` / `#D9577F` | the map ramp and the hero number; never small text on white |
| `--ok` / `--warn` / `--bad` | `#5BB98C` / `#F2B544` / `#E25D5D` | data states only (the quality traffic light) |
| `--ok-ink` / `--warn-ink` / `--bad-ink` | `#12301F` / `#3F2C03` / `#3D0E0E` | text on each state color (≥ 4.5:1) |
Disabled: `--disabled` fill with `--disabled-ink` text, no border color; never the accent at low opacity

## Shell (owned by the design lock task)
- `AppShell` · `NavBar` (EIRA mark + "Huella Rosa", `segmented` numbered tabs for the 6 steps, role selector and `SIMULADO` badge at the end) · `PageHeader` · `PageLayout` (`map`, `flow`, `list`, `detail`)
- Brand: the EIRA wordmark first, then the Huella Rosa mark (`HuellaMark`: EIRA's triangle with fingerprint ridges) and the name. Files in `web/public/brand/`: `huella-rosa-mark.svg` (favicon), `huella-rosa-logo.png` (transparent), `huella-rosa-logo-fondo-blanco.png`, `huella-rosa-icono-1024.png`
- At 390 wide: `the tabs become a fixed bottom bar that scrolls sideways; the map panel drops under the map`

## Screens: one recipe and one hero each
| Screen | Recipe (skill `product-ui` §2) | Hero |
|---|---|---|
| Mapa (wow) | `map + panel` | `the 3D extruded states map, full-bleed, legend on the map` |
| Carga | `flow` | `the column-to-field mapping network inside a Plate` |
| Calidad | `list` | `the count of alerts (hero Stat) over traffic-light rows` |
| Coincidencias | `detail` | `the pair side by side with its score and reasons` |
| Alianzas | `detail` | `the alliance's unique women count` |
| Informe | `detail` | `the report cover: a Plate with the indicators` |
| Landing | `landing-story` | `the wow as a real screenshot of the map inside a Plate` |

Locked screens (copy the one with your recipe): `web/public/design-lock/screens/{mapa,carga,calidad}-{1280,390}.png`,
live at `/?lock=1&tab=mapa|carga|calidad`, source in `web/src/lib/ui/locked/`.

## AI tells we refuse
- A colored side stripe on rows or cards · a card inside a card · a grid of equal boxes
- Purple-blue gradients, glass on every surface, emoji as icons, tracked-out uppercase eyebrows over every heading
- Three equal pricing or feature cards · every label in the same weight · `demo:`, `undefined` or raw IDs on screen
- Glows or soft pink haze around the map; light comes from the extrusions only
- Rounded "bubbly" cards and pill buttons: this is a printed sheet, corners stay at 2 px
- A number without its source line, or a person count shown without "estimado" or "validado"
