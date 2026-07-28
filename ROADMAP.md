# Almanac Design Roadmap

Visual and UX improvements, roughly ordered by impact. Each item is self-contained — work them in any order.

---

## 1. Dark background

**Goal:** Shift the page background from cream to deep navy or charcoal.

The temperature ring spans the full color spectrum. On a dark ground it reads like stained glass; on cream it reads like a dashboard.

- Change `body` background in [src/app.css](src/app.css) from the radial white→`#f9f8f3` gradient to a dark color (e.g. `#0d1b2a` or `#1a1a2e`)
- Audit all light-on-light text: month labels (`dimgrey`), season labels, day-detail date text — these will need to lighten
- Check that `g.mouseDay path:hover` at 15% opacity is still visible against the new background (may need to flip to a light highlight)
- The day dots (`#cecece`) will likely need to brighten; weekend orange (`#F90`) may need to warm up to gold

---

## 2. Smooth the temperature gradient

**Goal:** Eliminate the hard cyan→green break at 35°F.

The jump from `#19D0DE` (cyan) to `#00D96D` (bright green) is the most visible flaw in the outer ring. The bands below it read as "cold/water" and above as "growing season" — a semantically interesting split — but the transition needs to be gradual.

- In [src/rings/constants.js](src/rings/constants.js), rework the `tempColors` array around the 30–45°F range
- Aim for a smooth perceptual path: purple → blue → teal → sage → yellow-green → yellow → amber → orange → red
- Consider generating the gradient programmatically with `d3.scaleSequential` + a cubehelix or multi-stop interpolator instead of the hard-coded array, so the full range stays smooth if the domain ever changes

---

## 3. Precipitation color

**Goal:** Give rain its own color territory, separate from Winter.

`#3B8B99` (precipitation) and `#7cb4c0` (Winter season arc) share enough hue that the precipitation ring visually merges into Winter in the upper-left quadrant.

- In [src/app.css](src/app.css), change `g.precip rect` fill from `#3B8B99` to a deep cobalt or slate (e.g. `#2255aa` or `#3d5a80`)
- Adjust `g.currentPrecip rect` (`rgba(40, 120, 200, 0.6)`) to match the new base hue
- Snow (`#65DAF4`) is fine — it reads as distinctly lighter/icier than rain

---

## 4. Center day detail redesign

**Goal:** Make the detail panel feel like part of the piece, not a tooltip.

The grey/white temperature bar in the center uses different visual language from the radial rings outside it.

- Apply the same `tempColors` gradient to the detail bar in [src/rings/dayDetail.js](src/rings/dayDetail.js) — the `dayTempColors` rects already use the gradient via clip path; remove the grey `dayTempGrays` background or make it very subtle
- Style the date (`01.01.2026`) and day-of-week (`Thursday`) labels to feel designed, not defaulted — consider letter-spacing, weight, or a size relationship between the two
- The `High: 40°, Low: 35°` current-year overlay (`fill: '#e68c1e'` in dayDetail.js:154) should be more deliberately positioned — right now it floats wherever the temperature happens to fall; anchor it or give it a consistent layout position
- The precipitation bar (`g.dayRain`) is currently positioned ad-hoc at `x: 60` — give it consistent spacing relative to the temp bar

---

## 5. Weekend dot color

**Goal:** Preserve weekday/weekend texture without color collision.

`#F90` orange on the day ring is nearly identical to Fall and Summer season arc colors, causing the dots to visually bleed into those arcs.

- In [src/app.css](src/app.css), change `g.day circle.Sunday, g.day circle.Saturday` from `#F90` to a warm gold or desaturated amber (e.g. `#c9a227` or `#d4a017`)
- On a dark background (item 1), the weekday grey `#cecece` will also need attention — something like `#888` or a very muted warm white

---

## 6. Growing season visibility

**Goal:** Make the growing season a first-class visual layer.

At `HEIGHT = 2` in [src/rings/growingSeason.js](src/rings/growingSeason.js) the arc barely registers. The "Growing Season ⇾" label renders upside-down on the bottom half of the circle.

- Increase `HEIGHT` from `2` to something like `6–8` so the arc has presence
- Fix label orientation: detect when the arc center falls in the bottom half (270°–360° / 0°–90° after rotation) and either flip the text or move the label to the top portion of the arc
- The green `#82b966` is well-chosen; on a dark background it may want to be slightly more luminous (e.g. `#a3d977`)

---

## Notes

- Items 1–3 are pure CSS/constant changes — low risk, high visual payoff
- Items 4 and 6 touch JS layout logic — test hover interactions after changes
- After completing item 1 (dark background), re-evaluate all other colors in context before finalizing — values that work on cream often need adjustment
