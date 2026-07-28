import * as d3 from 'd3';
import { radians, millisecondsInDay, tempColors } from './constants.js';

export function drawTemperature({ g, innerRadius, yearArc, tempScale, stats, currentMap, year }) {
    const outerRadius = innerRadius + tempScale.range()[1];

    // Clip path: one rect per day covering the tmin→tmax range
    const clipPath = g.append('defs').append('clipPath').attr('id', 'tempMarks');

    clipPath.selectAll('rect.temp').data(stats).enter()
        .append('rect').attr('class', 'temp')
        .attr('width', (d) => tempScale(+d.tmax - +d.tmin))
        .attr('height', 4)
        .attr('transform', (d) => {
            const date = new Date(year, d.mo - 1, d.dy);
            return `rotate(${yearArc(date.getTime())})translate(${innerRadius + tempScale(+d.tmin)})`;
        });

    clipPath.selectAll('circle.maxTemp').data(stats).enter()
        .append('circle').attr('class', 'maxTemp').attr('r', 1.5)
        .attr('transform', (d) => {
            const date = new Date(year, d.mo - 1, d.dy);
            return `rotate(${yearArc(date.getTime() + millisecondsInDay / 2)})translate(${innerRadius + tempScale(+d.tmax_record)})`;
        });

    clipPath.selectAll('circle.minTemp').data(stats).enter()
        .append('circle').attr('class', 'minTemp').attr('r', 1.5)
        .attr('transform', (d) => {
            const date = new Date(year, d.mo - 1, d.dy);
            return `rotate(${yearArc(date.getTime() + millisecondsInDay / 2)})translate(${innerRadius + tempScale(+d.tmin_record)})`;
        });

    // Full-circle colour bands, visible only through clip path
    g.append('g').attr('class', 'tempColors')
        .selectAll('g.tempColor').data(tempColors).enter()
        .append('g').attr('class', 'tempColor')
        .append('path')
        .attr('fill', (d) => d.color)
        .attr('style', 'clip-path: url(#tempMarks);')
        .attr('d', d3.arc()
            .innerRadius((d) => innerRadius + tempScale(d.minTemp))
            .outerRadius((d) => innerRadius + tempScale(d.minTemp + 5))
            .startAngle(0)
            .endAngle(radians(360)));

    // Current-year overlay: same structure with a separate clip path
    if (currentMap.size > 0) {
        const currentClip = g.append('defs').append('clipPath').attr('id', 'currentTempMarks');

        currentClip.selectAll('rect.temp').data(stats).enter()
            .append('rect').attr('class', 'temp')
            .attr('width', (d) => {
                const cy = currentMap.get(`${d.mo}-${d.dy}`);
                return cy ? Math.max(0, tempScale(cy.tmax - cy.tmin)) : 0;
            })
            .attr('height', 4)
            .attr('transform', (d) => {
                const cy = currentMap.get(`${d.mo}-${d.dy}`);
                const date = new Date(year, d.mo - 1, d.dy);
                const offset = cy ? tempScale(cy.tmin) : 0;
                return `rotate(${yearArc(date.getTime())})translate(${innerRadius + offset})`;
            });

        g.append('g').attr('class', 'currentTemp')
            .selectAll('g.tempColor').data(tempColors).enter()
            .append('g').attr('class', 'tempColor')
            .append('path')
            .attr('fill', (d) => d.color)
            .attr('style', 'clip-path: url(#currentTempMarks);')
            .attr('d', d3.arc()
                .innerRadius((d) => innerRadius + tempScale(d.minTemp))
                .outerRadius((d) => innerRadius + tempScale(d.minTemp + 5))
                .startAngle(0)
                .endAngle(radians(360)));
    }

    return outerRadius;
}
