import * as d3 from 'd3';
import { radians } from './constants.js';

const HEIGHT = 2;

export function drawGrowingSeason({ g, innerRadius, yearArc, daysArc, frosts }) {
    const frostTime = frosts.end - frosts.start;
    const frostAngle = daysArc(frostTime);
    const growAngle = 360 - frostAngle;
    const growRotation = -yearArc(frosts.start) + frostAngle;

    const growArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + HEIGHT)
        .startAngle(0)
        .endAngle(radians(growAngle));

    g.append('defs').append('path')
        .attr('id', 'growArc')
        .attr('d', growArc())
        .attr('transform', `rotate(${growRotation})`);

    g.append('g').attr('class', 'grow')
        .append('path').attr('d', growArc())
        .attr('transform', `rotate(${growRotation})`);

    g.append('g').attr('class', 'frostLabel')
        .append('text')
        .append('textPath')
        .attr('href', '#growArc')
        .attr('baseline-shift', '2')
        .text('Growing Season ⇾');

    return innerRadius + HEIGHT;
}
