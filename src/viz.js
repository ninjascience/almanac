import * as d3 from 'd3';
import './app.css';
import { radians, millisecondsInDay } from './rings/constants.js';
import { drawSeasons } from './rings/seasons.js';
import { drawMonths } from './rings/months.js';
import { drawDays } from './rings/days.js';
import { drawPrecipitation } from './rings/precipitation.js';
import { drawGrowingSeason } from './rings/growingSeason.js';
import { drawTemperature } from './rings/temperature.js';
import { createDayDetail } from './rings/dayDetail.js';

const INNER_RADIUS = 200;
const PADDING = 10;

export function draw({ normals, currentYear, sunTimes, seasons, frosts }) {
    const year = new Date().getFullYear();

    // Build per-day and per-month calendar arrays for the current year
    const days = [];
    const months = [];
    let cursor = new Date(year, 0, 1);
    while (cursor.getFullYear() === year) {
        const thisDay = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        cursor.setDate(cursor.getDate() + 1);
        days.push({ date: thisDay });
        if (thisDay.getMonth() !== cursor.getMonth()) {
            months.push({
                start: new Date(year, thisDay.getMonth(), 1),
                end:   new Date(year, thisDay.getMonth(), thisDay.getDate()),
            });
        }
    }

    // Merge computed sun times into the normals data
    const sunMap = new Map(sunTimes.map((s) => [`${s.mo}-${s.dy}`, s]));
    const stats = normals.map((d) => ({ ...d, ...(sunMap.get(`${d.mo}-${d.dy}`) || {}) }));

    // Index current-year actuals by "mo-dy" for fast overlay lookups
    const currentMap = new Map(currentYear.map((d) => [`${d.mo}-${d.dy}`, d]));

    // Shared scales passed into ring modules
    const yearArc = d3.scaleLinear()
        .domain([days[0].date.getTime(), days[days.length - 1].date.getTime() + millisecondsInDay])
        .range([0, 360]);

    const daysArc = d3.scaleLinear()
        .domain([0, millisecondsInDay * days.length])
        .range([0, 360]);

    // Fixed 0–110 °F domain so bar positions align with the colour band arcs.
    const tempScale = d3.scaleLinear().domain([0, 110]).range([0, 100]);

    // SVG setup
    d3.select('#viz').html('');
    const svgWidth  = window.innerWidth;
    const svgHeight = window.innerHeight;

    const svg = d3.select('#viz').append('svg')
        .attr('width', svgWidth).attr('height', svgHeight);

    const g = svg.append('g').attr('id', 'offsetContainer')
        .append('g').attr('id', 'rotateContainer')
        .attr('transform', 'rotate(-90)scale(1)');

    const shared = { g, yearArc, daysArc, year };

    // ── Draw rings from innermost → outermost ─────────────────────────────────
    let r = INNER_RADIUS;
    r = drawSeasons(      { ...shared, innerRadius: r,            seasons });
    r = drawMonths(       { ...shared, innerRadius: r + PADDING,  months });
    r = drawDays(         { ...shared, innerRadius: r + PADDING,  days });
    r = drawPrecipitation({ ...shared, innerRadius: r + PADDING,  stats, currentMap });
    r = drawGrowingSeason({ ...shared, innerRadius: r + PADDING,  frosts });
    r = drawTemperature(  { ...shared, innerRadius: r + PADDING,  stats, currentMap, tempScale });
    // ─────────────────────────────────────────────────────────────────────────

    // Invisible hit areas spanning all rings — triggers day-detail updates
    g.append('g').attr('class', 'mouseDays').selectAll('g.mouseDay').data(days)
        .enter().append('g').attr('class', 'mouseDay')
        .append('path')
        .attr('data-day', (d, i) => i)
        .attr('d', d3.arc()
            .innerRadius(INNER_RADIUS)
            .outerRadius(r)
            .startAngle((d) => radians(yearArc(d.date.getTime()) + 90))
            .endAngle((d) => radians(yearArc(d.date.getTime() + millisecondsInDay) + 90)));

    // Scale and center the whole diagram to fit the viewport height
    const diameter = r * 2;
    const scale = svgHeight / (diameter + PADDING * 2);
    d3.select('#rotateContainer').attr('transform', `rotate(-90)scale(${scale})`);
    d3.select('#offsetContainer').attr('transform', `translate(${svgWidth / 2},${(diameter * scale) / 2})`);

    // Day detail panel rendered in the open centre of the diagram
    const dayDetail = createDayDetail({ g, innerRadius: INNER_RADIUS, stats, days, currentMap, tempScale });

    // ── Interactions ──────────────────────────────────────────────────────────
    window.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rc = d3.select('#rotateContainer');
        const parsed = rc.attr('transform').match(/(rotate\()([-\d.]+)(\)scale\()([\d.]+)(\))/);
        if (!parsed) return;
        let rotation = Number(parsed[2]);
        let sc = Number(parsed[4]);
        if (event.shiftKey)     sc = Math.max(0.5, sc - event.deltaY * 0.002);
        else if (event.altKey)  rotation -= event.deltaY * 0.2;
        rc.attr('transform', `rotate(${rotation})scale(${sc})`);
    }, { passive: false });

    let oldOffset = null;
    window.addEventListener('click', (event) => {
        if (!event.shiftKey) return;
        const oc = d3.select('#offsetContainer');
        if (!oldOffset) {
            oldOffset = oc.attr('transform');
            oc.attr('transform', `translate(${svgWidth / 2},-${diameter * scale * 0.5})`);
            d3.select('#rotateContainer').attr('transform', `rotate(-90)scale(${scale * 3})`);
        } else {
            oc.attr('transform', oldOffset);
            d3.select('#rotateContainer').attr('transform', `rotate(-90)scale(${scale})`);
            oldOffset = null;
        }
        event.preventDefault();
    });

    d3.selectAll('.mouseDay path').on('mouseenter', function () {
        dayDetail.update(+this.dataset.day);
    });
}
