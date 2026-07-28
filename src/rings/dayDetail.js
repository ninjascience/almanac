import * as d3 from 'd3';
import { tempColors, daysOfWeek } from './constants.js';

function pad(n, width, z = '0') {
    n = String(n);
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function createDayDetail({ g, innerRadius, stats, days, currentMap, tempScale }) {
    const dayDetailSide = Math.sqrt(Math.pow(innerRadius * 2, 2) / 2) - 20;
    const tempHeight = dayDetailSide / tempColors.length;
    const detailTempScale = d3.scaleLinear().domain([0, 110]).range([0, dayDetailSide - tempHeight]);

    const dayDetail = g.append('g').attr('id', 'selectedDay')
        .attr('transform', `rotate(90)translate(-${dayDetailSide / 2},-${dayDetailSide / 2})`);

    // ── Legend (static, drawn once) ─────────────────────────────────────────
    const legend = d3.select('#legendViz').append('svg').attr('height', 400).append('g');
    const s = stats[200];

    const legendClip = legend.append('defs').append('clipPath').attr('id', 'legendTempMarks');

    legend.selectAll('g.legendTempColors').data(tempColors).enter()
        .append('g').attr('class', 'legendTempColors')
        .append('rect').attr('fill', (d) => d.color)
        .attr('width', 10).attr('height', tempHeight).attr('x', 20)
        .attr('y', (d) => dayDetailSide - detailTempScale(d.minTemp));

    legend.selectAll('g.legendTempLabels').data(tempColors).enter()
        .append('g').attr('class', 'legendTempLabels')
        .append('text')
        .text((d) => (d.minTemp % 10) ? '' : d.minTemp)
        .attr('x', 34)
        .attr('y', (d) => dayDetailSide - detailTempScale(d.minTemp) + tempHeight + tempHeight / 2);

    legendClip.selectAll('rect.temp').data([s]).enter()
        .append('rect').attr('class', 'temp').attr('width', 10)
        .attr('height', (d) => detailTempScale(+d.tmax - +d.tmin))
        .attr('transform', (d) => `translate(60,${dayDetailSide - detailTempScale(+d.tmax) + tempHeight})`);

    legendClip.selectAll('circle.maxTemp').data([s]).enter()
        .append('circle').attr('class', 'maxTemp').attr('r', 5)
        .attr('transform', (d) => `translate(65,${dayDetailSide - detailTempScale(+d.tmax_record) + tempHeight})`);

    legendClip.selectAll('circle.minTemp').data([s]).enter()
        .append('circle').attr('class', 'minTemp').attr('r', 5)
        .attr('transform', (d) => `translate(65,${dayDetailSide - detailTempScale(+d.tmin_record) + tempHeight})`);

    legend.selectAll('g.dayTempGrays').data(tempColors).enter()
        .append('g').attr('class', 'dayTempGrays')
        .append('rect').attr('x', 60).attr('width', 10).attr('height', tempHeight)
        .attr('y', (d) => dayDetailSide - detailTempScale(d.minTemp));

    legend.selectAll('g.dayTempColors').data(tempColors).enter()
        .append('g').attr('class', 'dayTempColors')
        .append('rect').attr('x', 60)
        .attr('style', 'clip-path: url(#legendTempMarks);')
        .attr('fill', (d) => d.color)
        .attr('width', 10).attr('height', tempHeight)
        .attr('y', (d) => dayDetailSide - detailTempScale(d.minTemp));

    const legendLabels = [
        { label: 'Historical Min', temp: +s.tmin_record },
        { label: 'Average Min',    temp: +s.tmin },
        { label: 'Average Max',    temp: +s.tmax },
        { label: 'Historical Max', temp: +s.tmax_record },
    ];
    legend.selectAll('g.dayTempLabels').data(legendLabels).enter()
        .append('g').attr('class', 'dayTempLabels')
        .append('text').text((d) => d.label).attr('x', 75)
        .attr('y', (d) => dayDetailSide - detailTempScale(d.temp) + tempHeight + tempHeight / 2);

    // ── Day detail (redrawn on hover) ────────────────────────────────────────
    const dayClip = dayDetail.append('defs').append('clipPath').attr('id', 'detailTempMarks');

    function update(selectedDay) {
        dayDetail.selectAll('g.selectedDate').remove();
        dayDetail.selectAll('g.dayOfWeek').remove();
        dayDetail.selectAll('rect.temp').remove();
        dayDetail.selectAll('circle.maxTemp').remove();
        dayDetail.selectAll('circle.minTemp').remove();
        dayDetail.selectAll('g.dayTempGrays').remove();
        dayDetail.selectAll('g.dayTempColors').remove();
        dayDetail.selectAll('g.dayTempLabels').remove();
        dayDetail.selectAll('g.dayRain').remove();
        dayDetail.selectAll('g.rainLabel').remove();
        dayDetail.selectAll('g.currentDayOverlay').remove();

        const dayData = days[selectedDay];
        const stat = stats[selectedDay];
        const cyData = currentMap.get(`${dayData.date.getMonth() + 1}-${dayData.date.getDate()}`);

        // Date and day-of-week labels
        const dateText = dayDetail.selectAll('g.selectedDate').data([dayData]).enter()
            .append('g').attr('class', 'selectedDate')
            .append('text')
            .text((d) => `${pad(d.date.getMonth() + 1, 2)}.${pad(d.date.getDate(), 2)}.${d.date.getFullYear()}`);
        const dateBBox = dateText.node().getBBox();
        dateText.attr('y', dateBBox.height).attr('x', dayDetailSide);

        const dowText = dayDetail.selectAll('g.dayOfWeek').data([dayData]).enter()
            .append('g').attr('class', 'dayOfWeek')
            .append('text').attr('id', 'dayOfWeek')
            .text((d) => daysOfWeek(d.date.getDay()));
        const dowBBox = dowText.node().getBBox();
        dowText.attr('y', dateBBox.height + 10 + dowBBox.height).attr('x', dayDetailSide);

        // Temperature bar clip
        dayClip.selectAll('rect.temp').data([stat]).enter()
            .append('rect').attr('class', 'temp').attr('width', 10)
            .attr('height', (d) => detailTempScale(+d.tmax - +d.tmin))
            .attr('transform', (d) => `translate(20,${dayDetailSide - detailTempScale(+d.tmax) + tempHeight})`);

        dayClip.selectAll('circle.maxTemp').data([stat]).enter()
            .append('circle').attr('class', 'maxTemp').attr('r', 5)
            .attr('transform', (d) => `translate(25,${dayDetailSide - detailTempScale(+d.tmax_record) + tempHeight})`);

        dayClip.selectAll('circle.minTemp').data([stat]).enter()
            .append('circle').attr('class', 'minTemp').attr('r', 5)
            .attr('transform', (d) => `translate(25,${dayDetailSide - detailTempScale(+d.tmin_record) + tempHeight})`);

        // Grey background bands
        dayDetail.selectAll('g.dayTempGrays').data(tempColors).enter()
            .append('g').attr('class', 'dayTempGrays')
            .append('rect').attr('width', 10).attr('height', tempHeight).attr('x', 20)
            .attr('y', (d) => dayDetailSide - detailTempScale(d.minTemp));

        // Coloured bands through clip
        dayDetail.selectAll('g.dayTempColors').data(tempColors).enter()
            .append('g').attr('class', 'dayTempColors')
            .append('rect')
            .attr('style', 'clip-path: url(#detailTempMarks);')
            .attr('fill', (d) => d.color)
            .attr('width', 10).attr('height', tempHeight).attr('x', 20)
            .attr('y', (d) => dayDetailSide - detailTempScale(d.minTemp));

        // Temperature labels
        const tempLabels = [+stat.tmin_record, +stat.tmin, +stat.tmax, +stat.tmax_record];
        dayDetail.selectAll('g.dayTempLabels').data(tempLabels).enter()
            .append('g').attr('class', 'dayTempLabels')
            .append('text').text((d) => Math.round(d) + '°').attr('x', 34)
            .attr('y', (d) => dayDetailSide - detailTempScale(d) + tempHeight + tempHeight / 2);

        // Current-year overlay labels
        if (cyData) {
            const cyLabels = [
                { label: `High: ${Math.round(cyData.tmax)}°`, y: dayDetailSide - detailTempScale(cyData.tmax) + tempHeight },
                { label: `Low: ${Math.round(cyData.tmin)}°`,  y: dayDetailSide - detailTempScale(cyData.tmin) + tempHeight },
            ];
            dayDetail.selectAll('g.currentDayOverlay').data(cyLabels).enter()
                .append('g').attr('class', 'currentDayOverlay')
                .append('text').text((d) => d.label)
                .attr('x', 90).attr('y', (d) => d.y)
                .attr('font-size', '8pt').attr('fill', '#e68c1e');
        }

        // Precipitation
        const detailPrecipScale = d3.scaleLinear()
            .domain(d3.extent(stats, (d) => +d.precip))
            .range([0, dayDetailSide]);

        dayDetail.selectAll('g.dayRain').data([stat]).enter()
            .append('g').attr('class', 'dayRain precip')
            .append('rect')
            .attr('x', 60)
            .attr('y', (d) => dayDetailSide - detailPrecipScale(+d.precip) + tempHeight)
            .attr('width', 10)
            .attr('height', (d) => detailPrecipScale(+d.precip));

        dayDetail.selectAll('g.rainLabel').data([stat]).enter()
            .append('g').attr('class', 'rainLabel')
            .append('text').attr('x', 75)
            .attr('y', (d) => dayDetailSide - detailPrecipScale(+d.precip) + tempHeight)
            .text((d) => `${(+d.precip).toFixed(2)}" avg`);
    }

    update(0);
    return { update };
}
