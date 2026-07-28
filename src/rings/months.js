import * as d3 from 'd3';
import { radians, millisecondsInDay, monthNames } from './constants.js';

const WIDTH = 25;

export function drawMonths({ g, innerRadius, yearArc, months }) {
    const monthG = g.append('g').selectAll('g.monthArc').data(months)
        .enter().append('g').attr('class', 'monthArc');

    monthG.append('path').attr('d', d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + WIDTH)
        .startAngle((d) => radians(yearArc(d.start.getTime()) + 90))
        .endAngle((d) => radians(yearArc(d.end.getTime() + millisecondsInDay) + 90)));

    monthG.append('text')
        .text((d) => monthNames(d.start.getMonth()))
        .attr('class', 'monthLabel')
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => {
            const mid = d.start.getTime() + (d.end.getTime() - d.start.getTime()) / 2;
            return `rotate(${yearArc(mid)})translate(${innerRadius + 5})rotate(90)`;
        });

    return innerRadius + WIDTH;
}
