# Bloor West · Before & After Bike Lanes

Interactive visual story of Toronto’s **Bloor Street West Complete Street Extension** (Runnymede → Resurrection): serious collisions, travel time, vehicle speeds, and cycling — **before vs after** protected bike lanes were added.

Not a table dump. Flip the toggle; the map heat and numbers move with you.

## Run locally

```bash
bun install
bun run dev
```

Production build:

```bash
bun run build
bun run preview
```

## Deploy

Static Vite app. Drop `dist/` on any static host, or:

```bash
npx vercel
```

`vercel.json` includes an SPA rewrite.

## Data

| Metric | Before | After | Source |
| --- | --- | --- | --- |
| KSI collisions on corridor | 2016–2022 | 2024–2026 | [Toronto Open Data KSI](https://open.toronto.ca/dataset/motor-vehicle-collisions-involving-killed-or-seriously-injured-persons/) |
| Travel time, speeds, cycling counts | City monitoring | City monitoring | [Fall 2026 post-install report](https://www.toronto.ca/wp-content/uploads/2026/10/9905-Bloor-West-Extension-Post-Installation-Data-Report-Fall-2026-AODA.pdf) |

Phase 1 installed fall 2023; Phase 2 completed 2024. Comparison is **addition of lanes**, not the 2026 provincial removal.

## Stack

Vite · React · TypeScript · MapLibre GL · CARTO dark basemap
