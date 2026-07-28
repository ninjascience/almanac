# Gardeners' Almanac

A circular data visualization of historical weather patterns for any location. Shows temperature ranges, precipitation, the growing season, moon phases, and solstice/equinox dates — all rendered as a radial almanac you can spin and zoom.

## Features

- **Historical climate normals** (1991–2020) fetched live from the Open-Meteo Climate API
- **Current-year actuals overlay** showing real observed weather for elapsed days this year
- **Dynamic location** — uses browser geolocation, falls back to Portland, OR
- **Astronomical data** computed client-side: equinox/solstice dates and moon phases via the Meeus algorithm
- **Sunrise/sunset/twilight** arcs calculated per day via SunCalc

## Getting started

Requires [Node.js](https://nodejs.org) (v18+).

```bash
npm install
npm run dev
```

Then open the URL shown in your terminal (typically `http://localhost:5173`).

## Other commands

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Tech stack

- [D3 v7](https://d3js.org) — visualization
- [Vite](https://vitejs.dev) — dev server and bundler
- [SunCalc](https://github.com/mourner/suncalc) — sunrise/sunset times
- [Open-Meteo](https://open-meteo.com) — climate normals and historical weather (no API key required)

## Credits

Visualization design and programming by [Ryan Miller](http://ninjascience.github.com/).
Graphic design by [Jeremy Cohen](http://jcohendesign.com/).
