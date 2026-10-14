# Bike lanes on Bloor Street West

Toronto put barrier-separated bike lanes on Bloor Street West from Runnymede to Resurrection. This site pulls Ontario's files on removing them, the City's before and after numbers, and a map.

## Run locally

```bash
bun install
bun run dev
```

```bash
bun run build
bun run preview
```

## Deploy

Static Vite app. Any static host works, or:

```bash
npx vercel
```

## Data

| Metric | Before | After | Source |
| --- | --- | --- | --- |
| Serious crashes on that stretch | 2016 to 2022 | 2024 to 2026 | [Toronto Open Data KSI](https://open.toronto.ca/dataset/motor-vehicle-collisions-involving-killed-or-seriously-injured-persons/) |
| Drive time, speeds, bike counts | City counts | City counts | [Fall 2026 post-install report](https://www.toronto.ca/wp-content/uploads/2026/10/9905-Bloor-West-Extension-Post-Installation-Data-Report-Fall-2026-AODA.pdf) |
| Permanent bike counter (Old Mill) | none (live Jul 2024) | May to Aug avg +22% YoY (2025 to 2026) | [Permanent bicycle counters](https://open.toronto.ca/dataset/permanent-bicycle-counters/) |

Phase 1 car volumes stayed about 18,000/day. City travel times rose with citywide congestion through 2025, then eased in 2026 on this stretch.

Ontario internal files and a CIMA+ review for MTO (via [CBC](https://www.cbc.ca/news/canada/toronto/ontario-bike-lanes-internal-documents-1.7481729) and [2025 ONSC reasons](https://ecojustice.ca/wp-content/uploads/2025/07/Cycle-Toronto-v.-AGO-Reasons-for-Judgment-PBS-July-30-2025.pdf)) covered congestion and crash effects of removal. The Court of Appeal later allowed the law. This site is about the lanes going in, not the 2026 provincial teardown.

Phase 1 went in fall 2023. Phase 2 finished in 2024.

## Stack

Vite, React, TypeScript, MapLibre, OpenStreetMap tiles
