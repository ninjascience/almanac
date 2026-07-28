import * as d3 from 'd3';
import { millisecondsInDay } from './constants.js';

const WIDTH = 50;

export function drawPrecipitation({ g, innerRadius, yearArc, stats, currentMap, year }) {
    // Domain max = heaviest total-precip day across both normals and current year,
    // so the tallest bar hits exactly WIDTH and no bar ever overflows.
    const maxNormal = d3.max(stats, (d) => +d.precip) ?? 0;
    const maxCurrent = currentMap.size > 0
        ? d3.max([...currentMap.values()], (d) => +d.precip) ?? 0
        : 0;
    const maxPrecip = Math.max(maxNormal, maxCurrent, 0.01);

    const precipScale = d3.scaleLinear()
        .domain([0, maxPrecip])
        .range([0, WIDTH]);

    const dayTransform = (d) => {
        const date = new Date(year, d.mo - 1, d.dy);
        return `rotate(${yearArc(date.getTime())})translate(${innerRadius})`;
    };

    // Historical normals — rain portion (innermost segment of each bar)
    g.append('g').attr('class', 'precip').selectAll('rect').data(stats)
        .enter().append('rect')
        .attr('width', (d) => precipScale(d.rain != null ? +d.rain : +d.precip))
        .attr('height', 4)
        .attr('transform', dayTransform);

    // Historical normals — snow portion (stacked on top of rain)
    g.append('g').attr('class', 'snow').selectAll('rect').data(stats)
        .enter().append('rect')
        .attr('width', (d) => precipScale(d.snow != null ? +d.snow : 0))
        .attr('height', 4)
        .attr('transform', (d) => {
            const date = new Date(year, d.mo - 1, d.dy);
            const rainWidth = precipScale(d.rain != null ? +d.rain : +d.precip);
            return `rotate(${yearArc(date.getTime())})translate(${innerRadius + rainWidth})`;
        });

    if (currentMap.size > 0) {
        // Current-year overlay — rain portion
        g.append('g').attr('class', 'currentPrecip').selectAll('rect').data(stats)
            .enter().append('rect')
            .attr('width', (d) => {
                const cy = currentMap.get(`${d.mo}-${d.dy}`);
                return cy ? precipScale(cy.rain != null ? +cy.rain : +cy.precip) : 0;
            })
            .attr('height', 4)
            .attr('transform', dayTransform);

        // Current-year overlay — snow portion
        g.append('g').attr('class', 'currentSnow').selectAll('rect').data(stats)
            .enter().append('rect')
            .attr('width', (d) => {
                const cy = currentMap.get(`${d.mo}-${d.dy}`);
                return cy ? precipScale(cy.snow != null ? +cy.snow : 0) : 0;
            })
            .attr('height', 4)
            .attr('transform', (d) => {
                const date = new Date(year, d.mo - 1, d.dy);
                const cy = currentMap.get(`${d.mo}-${d.dy}`);
                const rainWidth = cy ? precipScale(cy.rain != null ? +cy.rain : +cy.precip) : 0;
                return `rotate(${yearArc(date.getTime())})translate(${innerRadius + rainWidth})`;
            });
    }

    return innerRadius + WIDTH;
}
