import { millisecondsInDay, daysOfWeek } from './constants.js';

const DOT_RADIUS = 2;

export function drawDays({ g, innerRadius, yearArc, days }) {
    g.append('g').attr('class', 'days').selectAll('g.day').data(days)
        .enter().append('g').attr('class', 'day')
        .attr('transform', (d) => {
            const mid = d.date.getTime() + millisecondsInDay / 2;
            return `rotate(${yearArc(mid)})translate(${innerRadius})`;
        })
        .append('circle')
        .attr('r', DOT_RADIUS)
        .attr('class', (d) => daysOfWeek(d.date.getDay()));

    return innerRadius + DOT_RADIUS * 2;
}
