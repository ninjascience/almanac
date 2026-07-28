import * as d3 from 'd3';
import { radians } from './constants.js';

const WIDTH = 30;

// Returns the outer radius of this ring.
export function drawSeasons({ g, innerRadius, yearArc, seasons }) {
    // Invisible zero-height paths used as textPath anchors for labels.
    g.append('defs').selectAll('path.seasonArc').data(seasons)
        .enter().append('path')
        .attr('class', 'seasonArc')
        .attr('id', (d) => d.name)
        .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(innerRadius)
            .startAngle((d) => radians(yearArc(d.start) + 90))
            .endAngle((d) => radians(yearArc(d.end) + 90)));

    g.append('g').selectAll('path.seasonArc').data(seasons)
        .enter().append('path')
        .attr('class', 'seasonArc')
        .attr('id', (d) => d.name)
        .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(innerRadius + WIDTH)
            .startAngle((d) => radians(yearArc(d.start) + 90))
            .endAngle((d) => radians(yearArc(d.end) + 90)));

    g.append('g').selectAll('text.seasonLabel').data(seasons)
        .enter().append('text')
        .attr('id', (d) => d.name + 'Label')
        .attr('class', 'seasonLabel')
        .attr('text-anchor', 'middle')
        .append('textPath')
        .attr('startOffset', '25%')
        .attr('baseline-shift', '45%')
        .attr('href', (d) => '#' + d.name)
        .text((d) => d.name);

    return innerRadius + WIDTH;
}
