define(['d3','underscore', 'mousewheel'], function(d3,_) {
    "use strict";

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    var zoneColors2 = [
        {minTemp: 0, color: "#aad681"},
        {minTemp: 5, color: "#cbdb82"},
        {minTemp: 10, color: "#ecd797"},
        {minTemp: 15, color: "#e8c976"},
        {minTemp: 20, color: "#dbb765"},
        {minTemp: 25, color: "#f4b785"},
        {minTemp: 30, color: "#e1a357"},
        {minTemp: 35, color: "#e27a3c"},
        {minTemp: 40, color: "#d45c3d"},
        {minTemp: 45, color: "#df8a71"},
        {minTemp: 50, color: "#ca5e58"},
        {minTemp: 55, color: "#a41c2b"},
        {minTemp: 60, color: "#983126"},
    ];

    var zoneColors = [
        {minTemp: 0, zone: 7, color: "#4CA6C7"},
        {minTemp: 5, zone: 7.5, color: "#26ABBB"},
        {minTemp: 10, zone: 8, color: "#06ADA9"},
        {minTemp: 15, zone: 8.5, color: "#1FAF94"},
        {minTemp: 20, zone: 9, color: "#3FAE7E"},
        {minTemp: 25, zone: 9.5, color: "#5BAC68"},
        {minTemp: 30, zone: 10, color: "#75A954"},
        {minTemp: 35, zone: 10.5, color: "#8EA444"},
        {minTemp: 40, zone: 11, color: "#A69E3A"},
        {minTemp: 45, zone: 11.5, color: "#BB9638"},
        {minTemp: 50, zone: 12, color: "#CE8E3F"},
        {minTemp: 55, zone: 12.5, color: "#DE854D"},
        {minTemp: 60, zone: 13, color: "#E87D5F"}];

    var tempColors = [
        {minTemp: 0, color: "#96BAEA"},
        {minTemp: 5, color: "#7FBEE7"},
        {minTemp: 10, color: "#69C0E0"},
        {minTemp: 15, color: "#55C2D7"},
        {minTemp: 20, color: "#46C4CC"},
        {minTemp: 25, color: "#3DC4BF"},
        {minTemp: 30, color: "#3FC4B1"},
        {minTemp: 35, color: "#47C3A2"},
        {minTemp: 40, color: "#54C293"},
        {minTemp: 45, color: "#62C084"},
        {minTemp: 50, color: "#71BD75"},
        {minTemp: 55, color: "#80BA68"},
        {minTemp: 60, color: "#8FB65C"},
        {minTemp: 65, color: "#9DB252"},
        {minTemp: 70, color: "#ABAD4B"},
        {minTemp: 75, color: "#B8A846"},
        {minTemp: 80, color: "#C4A245"},
        {minTemp: 85, color: "#CF9C47"},
        {minTemp: 90, color: "#D8964C"},
        {minTemp: 95, color: "#E08F53"},
        {minTemp: 100, color: "#E68A5B"},
        {minTemp: 105, color: "#EB8566"} ];

    var tempColors2 = [
        {minTemp: 0, color: "#B399FF"},
        {minTemp: 5, color: "#9AA2FA"},
        {minTemp: 10, color: "#80ABF4"},
        {minTemp: 15, color: "#66B4EF"},
        {minTemp: 20, color: "#4DBEE9"},
        {minTemp: 25, color: "#33C7E4"},
        {minTemp: 30, color: "#19D0DE"},
        {minTemp: 35, color: "#00D96D"},
        {minTemp: 40, color: "#1CDD61"},
        {minTemp: 45, color: "#55E649"},
        {minTemp: 50, color: "#71EA3D"},
        {minTemp: 55, color: "#8DEE31"},
        {minTemp: 60, color: "#AAF224"},
        {minTemp: 65, color: "#C6F718"},
        {minTemp: 70, color: "#E2FB0C"},
        {minTemp: 75, color: "#FFBF00"},
        {minTemp: 80, color: "#FF9F00"},
        {minTemp: 85, color: "#FF7F00"},
        {minTemp: 90, color: "#FF5F00"},
        {minTemp: 95, color: "#FF4000"},
        {minTemp: 100, color: "#FF1F00"},
        {minTemp: 105, color: "#B20000"} ];

    var body = $('body');

    var padding = 10,
        innerRadius = 200,
        seasonsWidth = 30,
        monthsWidth = 25,
        moonWidth = 10,
        precipWidth = 50,
        tempWidth = 100;

    // Days of the Week mapped to integers
    var daysOfWeek = d3.scale.ordinal()
        .domain([0, 1, 2, 3, 4, 5, 6])
        .range(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

    // Days of the Week mapped to integers
    var monthNames = d3.scale.ordinal()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

    // Phases of the moon.  used to translate data to css class
    var phasesOfMoon = d3.scale.ordinal()
        .domain(['Full Moon', 'First Quarter', 'New Moon', 'Last Quarter'])
        .range(['full_moon', 'first_quarter', 'new_moon', 'last_quarter']);

    var angles = [0, 360];

    var radians = function(degrees) {
        return degrees * (Math.PI/180);
    };

//    var radians = d3.scale.linear()
//        .domain(angles)
//        .range([-Math.PI, Math.PI]);

    var days = [],
        months = [],
        weeklyZones = null,
        phases = null,
        stats = null,
        events = null,
        today = new Date(),
        currentDay = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);

    d3.json('data/97008_events.json', function(result) {
        events = result;
        draw();
    });

    d3.csv('data/97008.csv', function(result) {
        stats = result;
        weeklyZones = [];
        var weekTemplate = {total: 0, days: 0, start: 0, end: 0};
        var currentWeek = _(weekTemplate).clone();
        for (var i = 0; i < stats.length; i++) {
            var day = new Date(today.getFullYear(), stats[i]['MO']-1, stats[i]['DY'], 0 , 0, 0, 0);
            if (currentWeek.days === 7) {
                currentWeek.average = currentWeek.total / currentWeek.days;
                currentWeek.end = day.getTime()+millisecondsInDay;
                weeklyZones.push(currentWeek);
                currentWeek = _(weekTemplate).clone();
            }
            if (currentWeek.days === 0) {
                var day = new Date(today.getFullYear(), stats[i]['MO']-1, stats[i]['DY'], 0 , 0, 0, 0);
                currentWeek.start = day.getTime();
            }
            if (currentWeek.days < 7) {
                currentWeek.total += Number(stats[i]['TMIN-MIN']);
                currentWeek.days += 1;
            }
        }
        currentWeek.average = currentWeek.total / currentWeek.days;
        draw();
    });

    d3.csv('data/moon.csv', function(result) {
        phases = [];
        _(result).each(function(phase){
            phases.push({date: new Date(phase['Date']), phase: phase['Phase']});
        });
        draw();
    });

    // process current year of dates
    while (currentDay.getFullYear() === today.getFullYear()){
        var thisDay = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
        currentDay.setDate(currentDay.getDate()+1);
        days.push({date:thisDay});
        if(thisDay.getMonth() !== currentDay.getMonth()) {
            months.push({
                start: new Date(today.getFullYear(), thisDay.getMonth(), 1),
                end: new Date(today.getFullYear(), thisDay.getMonth(), thisDay.getDate())
            });
        }
    }

    var millisecondsInDay = 1000 * 60 * 60 * 24;
    // create scale for arc angle and epoch time
    var yearArc = d3.scale.linear()
        .domain([days[0].date.getTime(), days[days.length-1].date.getTime()+millisecondsInDay])
        .range(angles);


    var daysArc = d3.scale.linear()
        .domain([0, millisecondsInDay*days.length])
        .range(angles);

    draw();

    var scale = 1.0500000000000005;

    function draw() {
        if (!stats || !days || !events || !months || !phases) return;

        d3.select('#viz').innerHTML = '';

        var g = d3.select("#viz")
            .append("svg:svg")
            .attr("width", body.outerWidth())
            .attr("height", body.outerHeight())
            .append("g").attr('id', 'offsetContainer')
            .append("g").attr('id', 'rotateContainer')
            .attr("transform", "rotate(-90)scale("+scale+")");

        // season mark
        g.append('defs').selectAll('path.seasonArc').data(events.seasons)
            .enter().append('path')
            .attr('class', 'seasonArc')
            .attr('id', function(d){
                return d.name;
            })
            .attr('d', d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(innerRadius)
                .startAngle(function(d){
                    return radians(yearArc(d.start)+90);
                })
                .endAngle(function(d){
                    return radians(yearArc(d.end)+90);
                }));
        g.append('g').selectAll('path.seasonArc').data(events.seasons)
            .enter().append('path')
            .attr('class', 'seasonArc')
            .attr('id', function(d){
                return d.name;
            })
            .attr('d', d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(innerRadius+seasonsWidth)
                .startAngle(function(d){
                    return radians(yearArc(d.start)+90);
                })
                .endAngle(function(d){
                    return radians(yearArc(d.end)+90);
                }));
        g.append('g').selectAll("text.seasonLabel")
            .data(events.seasons)
            .enter().append('text')
            .attr('id', function(d){
                return d.name + 'Label';
            })
            .attr('class', 'seasonLabel')
            .attr("text-anchor", "middle")
            .append('textPath')
            .attr('startOffset', '25%')
            .attr('baseline-shift', '45%')
            .attr('xlink:href', function(d){
                return '#' + d.name;
            })
            .attr("transform", function (d, i) {

                return "rotate("
                    + (yearArc(d.start + ((d.end - d.start) / 2))) + ")" +
                    "translate(" + (innerRadius+padding) + ")rotate(90)";
            })
            .text(function(d) {
                return d.name;
            });

        // month marks
        var monthsInnerRadius = innerRadius + seasonsWidth + padding;
        g.append('g').selectAll('g.monthArc').data(months)
            .enter().append('g').attr('class', 'monthArc')
            .append('path').attr('d', d3.svg.arc()
                .innerRadius(monthsInnerRadius)
                .outerRadius(monthsInnerRadius+monthsWidth)
                .startAngle(function(d){
                    return radians(yearArc(d.start.getTime())+90);
                })
                .endAngle(function(d){
                    return radians(yearArc(d.end.getTime()+millisecondsInDay)+90);
                }));
        g.selectAll("g.monthArc")
            .append('text').text(function(d) {
                return monthNames(d.start.getMonth());
            })
            .attr('class', 'monthLabel')
            .attr("text-anchor", "middle")
            .attr("transform", function (d, i) {
                return "rotate("
                        + (yearArc(d.start.getTime() + ((d.end.getTime()- d.start.getTime()) / 2))) + ")" +
                    "translate(" + (monthsInnerRadius+5) + ")rotate(90)";
            });

        // Moon marks
//        var moonInnerRadius = monthsInnerRadius + monthsWidth + padding;
//        g.append("g").attr('class', 'phases').selectAll("g.moon").data(phases)
//            .enter().append('g').attr('class', 'moon')
//            .attr("transform", function (d, i) {
//                return "rotate(" + (yearArc(d.date.getTime()+millisecondsInDay)) + ")" +
//                    "translate(" + moonInnerRadius + ")";
//
//            })
//            .append('path').attr("d", d3.svg.symbol())
//            .attr('class', function(d){
//                return phasesOfMoon(d.phase);
//            });

        // day marks
        var daysInnerRadius = monthsInnerRadius + monthsWidth + padding;
        g.append("g").attr('class', 'days').selectAll("g.day").data(days)
            .enter().append('g').attr('class', 'day')
            .attr("transform", function (d, i) {
                return "rotate(" + (yearArc(d.date.getTime()+(millisecondsInDay/2))) + ")" +
                    "translate(" + daysInnerRadius + ")";

            })
            .append('circle')
            .attr('r', '2')
            .attr('class', function(d){
                return daysOfWeek(d.date.getDay());
            });

        // precipitation marks
        var precipScale = d3.scale.linear()
            .domain(d3.extent(stats, function(d){return d.PRECIP;}))
            .range([0,precipWidth]);

        var precipInnerRadius = daysInnerRadius + (padding * 2);
        g.append("g").attr('class', 'precipation').selectAll("g.precip").data(stats)
            .enter().append('g').attr('class', 'precip')
            .append('rect')
            .attr('class', function(d){
                return d.MO + '_' + d.DY;
            })
            .attr('width', function(d){ return precipScale(d.PRECIP);})
            .attr('height', 4)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO-1, d.DY);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (precipInnerRadius) + ")";
            });
        g.append("g").attr('class', 'snows').selectAll("g.snow").data(stats)
            .enter().append('g').attr('class', 'snow')
            .append('rect')
            .attr('width', function(d){ return precipScale(d.SNOW);})
            .attr('height', 4)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO-1, d.DY);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (precipScale(d.PRECIP) + precipInnerRadius) + ")";
            });


        // frost marks
        var innerGrowRadius = precipInnerRadius + precipWidth + padding;

        var frostTime = events.frosts.end - events.frosts.start;
        var frostAngle = daysArc(frostTime);
        var growAngle = 360 - frostAngle;

        var growArc = d3.svg.arc()
            .innerRadius(innerGrowRadius)
            .outerRadius(innerGrowRadius + 2)
            .startAngle(0)
            .endAngle(radians(growAngle));

        // temperature marks
        var innerTempRadius = innerGrowRadius + padding;
        g.append('defs')
            .append('path')
            .attr('id', 'growArc').attr('class', 'grow')
            .attr('d', growArc())
            .attr("transform", "rotate(" + (-yearArc(events.frosts.start)+frostAngle) + ")");

        g.append('g').attr('class', 'grow')
            .append('path').attr('d', growArc())
            .attr("transform", "rotate(" + (-yearArc(events.frosts.start)+frostAngle) + ")");


        g.append('g').attr('class', 'frostLabel')
            .append('text')
            .append('textPath')
            .attr('xlink:href', '#growArc')
            .attr('baseline-shift', '2')
            .text('Growing Season ⇾');

        // temperature scales
        var maxTemp = d3.max(stats, function(d){
            return d['TMAX-MAX'];
        });

        var minTemp = d3.min(stats, function(d){
            return d['TMIN-MIN'];
        });

        var tempScale = d3.scale.linear()
            .domain([0, maxTemp-minTemp])
            .range([0,tempWidth]);

        // temperature marks
        var clipPath = g.append("defs").append('clipPath').attr('id', 'tempMarks')

        clipPath.selectAll("rect.temp").data(stats)
            .enter()
            .append('rect').attr('class', 'temp')
            .attr('width', function(d){ return tempScale((d.TMAX- d.TMIN));})
            .attr('height', 4)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO-1, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d.TMIN)) + ")";
            });

        clipPath.selectAll("circle.maxTemp").data(stats)
            .enter()
            .append('circle').attr('class', 'maxTemp')
            .attr('r', 1.5)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO-1, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()+(millisecondsInDay/2)) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d['TMAX-MAX'])) + ")";
            });

        clipPath.selectAll("circle.minTemp").data(stats)
            .enter()
            .append('circle').attr('class', 'minTemp')
            .attr('r', 1.5)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO-1, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()+(millisecondsInDay/2)) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d['TMIN-MIN'])) + ")";
            });

        // temperature colors
        g.append('g').attr('class', 'tempColors')
            .selectAll('g.tempColor').data(tempColors2).enter()
            .append('g').attr('class', 'tempColor')
            .append('path').attr('fill', function(d){
                return d.color;
            })
            .attr('style', 'clip-path: url(#tempMarks);')
            .attr('d', d3.svg.arc()
                .innerRadius(function(d){
                    return innerTempRadius + tempScale(d.minTemp);
                })
                .outerRadius(function(d){
                    return innerTempRadius + tempScale(d.minTemp+5);
                })
                .startAngle(0)
                .endAngle(360));

        // day mouseover marks
        g.append("g").attr('class', 'mouseDays').selectAll("g.mouseDay").data(days)
            .enter().append('g').attr('class', 'mouseDay')
            .append('path')
            .attr('data-day', function(d, i){
                return i;
            })
            .attr('d', d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(innerTempRadius+tempWidth)
                .startAngle(function(d){
                    return radians(yearArc(d.date.getTime())+90);
                })
                .endAngle(function(d){
                    return radians(yearArc(d.date.getTime()+millisecondsInDay)+90);
                }));



        var diameter = (innerTempRadius + tempWidth) * 2;

        var r = d3.scale.linear()
            .domain([-diameter / 2, diameter / 2])
            .range([0, diameter]);


        d3.select('#offsetContainer').attr("transform", "translate(" + body.outerWidth()/2 + "," + (diameter/2) + ")");

        var dayDetailSide = Math.sqrt(Math.pow(innerRadius*2, 2) / 2) - 20;
        var dayDetail = g.append('g').attr('id', 'selectedDay')
            .attr('transform', 'rotate(90)translate(-' + (dayDetailSide/2) + ',-' + (dayDetailSide/2) + ')')
            .attr('width', dayDetailSide)
            .attr('height', dayDetailSide);

        var tempHeight = dayDetailSide / (tempColors2.length);

        var detailTempScale = d3.scale.linear()
            .domain([0, maxTemp-minTemp])
            .range([0,dayDetailSide - (tempHeight)]);

        // Legend
        var legend = d3.select('#legendViz').append('svg').append('g');
        var sampleDay = 200;

        // temperature clip path
        var legendClipPath = legend.append("defs").append('clipPath').attr('id', 'legendTempMarks');

        legend.selectAll('g.legendTempColors').data(tempColors2).enter()
            .append('g').attr('class', 'legendTempColors')
            .append('rect')
            .attr('fill', function(d){
                return d.color;
            })
            .attr('width', 10)
            .attr('height', tempHeight)
            .attr('x', 20)
            .attr('y', function(d){
                return dayDetailSide - detailTempScale(d.minTemp);
            });

        legend.selectAll('g.legendTempLabels').data(tempColors2).enter()
            .append('g').attr('class', 'legendTempLabels')
            .append('text')
            .text(function(d) {
                return (d.minTemp % 10)? '' : d.minTemp;
            })
            .attr('x', 34)
            .attr('y', function(d){
                return dayDetailSide - detailTempScale(d.minTemp) + tempHeight + (tempHeight/2);
            });

        legendClipPath.selectAll("rect.temp").data([stats[sampleDay]])
            .enter()
            .append('rect').attr('class', 'temp')
            .attr('width', 10)
            .attr('height', function(d){ return detailTempScale((d.TMAX- d.TMIN));})
            .attr("transform", function (d, i) {
                return "translate(60," + (dayDetailSide - detailTempScale(d.TMAX) + tempHeight) + ")";
            });

        legendClipPath.selectAll("circle.maxTemp").data([stats[sampleDay]])
            .enter()
            .append('circle').attr('class', 'maxTemp')
            .attr('r', 5)
            .attr("transform", function (d, i) {
                return "translate(65," + (dayDetailSide - detailTempScale(d['TMAX-MAX']) + tempHeight) + ")";
            });

        legendClipPath.selectAll("circle.minTemp").data([stats[sampleDay]])
            .enter()
            .append('circle').attr('class', 'minTemp')
            .attr('r', 5)
            .attr("transform", function (d, i) {
                return "translate(65," + (dayDetailSide - detailTempScale(d['TMIN-MIN']) + tempHeight) + ")";
            });

        legend.selectAll('g.dayTempGrays').data(tempColors2).enter()
            .append('g').attr('class', 'dayTempGrays')
            .append('rect')
            .attr('x', 60)
            .attr('width', 10)
            .attr('height', tempHeight)
            .attr('y', function(d){
                return dayDetailSide - detailTempScale(d.minTemp);
            });

        legend.selectAll('g.dayTempColors').data(tempColors2).enter()
            .append('g').attr('class', 'dayTempColors')
            .append('rect')
            .attr('x', 60)
            .attr('style', 'clip-path: url(#legendTempMarks);')
            .attr('fill', function(d){
                return d.color;
            })
            .attr('width', 10)
            .attr('height', tempHeight)
            .attr('y', function(d){
                return dayDetailSide - detailTempScale(d.minTemp);
            });

        var legendDayTemps = [
            {label: 'Historical Min', temp:stats[sampleDay]['TMIN-MIN']},
            {label: 'Average Min', temp:stats[sampleDay]['TMIN']},
            {label: 'Average Max', temp:stats[sampleDay]['TMAX']},
            {label: 'Historical Max', temp:stats[sampleDay]['TMAX-MAX']}
        ];
        legend.selectAll('g.dayTempLabels').data(legendDayTemps).enter()
            .append('g').attr('class', 'dayTempLabels')
            .append('text')
            .text(function(d) {
                return d.label;
            })
            .attr('x', 75)
            .attr('y', function(d){
                return dayDetailSide - detailTempScale(d.temp) + tempHeight + (tempHeight/2);
            });

        // Day Detail Viz

        var selectedDay = 0;


        // temperature clip path
        var dayClipPath = dayDetail.append("defs").append('clipPath').attr('id', 'detailTempMarks');

        var drawDay = function() {

            var padding = 10;

            dayDetail.selectAll('g.selectedDate').remove();
            dayDetail.selectAll('g.dayOfWeek').remove();
            dayDetail.selectAll('rect.temp').remove();
            dayDetail.selectAll('circle.maxTemp').remove();
            dayDetail.selectAll('circle.minTemp').remove();
            dayDetail.selectAll('g.dayTempLabels').remove();
            dayDetail.selectAll('g.dayRain').remove();
            dayDetail.selectAll('g.daySnow').remove();
            dayDetail.selectAll('g.rainLabel').remove();
            dayDetail.selectAll('g.snowLabel').remove();

            // Selected Date
            var selectedDate = dayDetail.selectAll('g.selectedDate').data([days[selectedDay]]).enter()
                .append('g').attr('class', 'selectedDate')
                .append('text')
                .text(function(d){
                    return pad((d.date.getMonth()+1), 2) + '.' + pad(d.date.getDate(), 2) + '.' + d.date.getFullYear();
                });

            var selectedDateBBox = selectedDate.node().getBBox();
            selectedDate.attr('y', selectedDateBBox.height);
            selectedDate.attr('x', dayDetailSide);

            // Day of Week
            var dayOfWeek = dayDetail.selectAll('g.dayOfWeek').data([days[selectedDay]]).enter()
                .append('g').attr('class', 'dayOfWeek')
                .append('text').attr('id', 'dayOfWeek')
                .text(function(d){
                    return daysOfWeek(d.date.getDay());
                });

            var dayOfWeekBBox = dayOfWeek.node().getBBox();

            var dayOfWeekStart = selectedDateBBox.height + padding + dayOfWeekBBox.height;
            dayOfWeek.attr('y', dayOfWeekStart);
            dayOfWeek.attr('x', dayDetailSide);

            // Temperatures

            dayClipPath.selectAll("rect.temp").data([stats[selectedDay]])
                .enter()
                .append('rect').attr('class', 'temp')
                .attr('width', 10)
                .attr('height', function(d){ return detailTempScale((d.TMAX- d.TMIN));})
                .attr("transform", function (d, i) {
                        return "translate(20," + (dayDetailSide - detailTempScale(d.TMAX) + tempHeight) + ")";
                });

            dayClipPath.selectAll("circle.maxTemp").data([stats[selectedDay]])
                .enter()
                .append('circle').attr('class', 'maxTemp')
                .attr('r', 5)
                .attr("transform", function (d, i) {
                    return "translate(25," + (dayDetailSide - detailTempScale(d['TMAX-MAX']) + tempHeight) + ")";
                });

            dayClipPath.selectAll("circle.minTemp").data([stats[selectedDay]])
                .enter()
                .append('circle').attr('class', 'minTemp')
                .attr('r', 5)
                .attr("transform", function (d, i) {
                    return "translate(25," + (dayDetailSide - detailTempScale(d['TMIN-MIN']) + tempHeight) + ")";
                });

            dayDetail.selectAll('g.dayTempGrays').data(tempColors2).enter()
                .append('g').attr('class', 'dayTempGrays')
                .append('rect')
                .attr('width', 10)
                .attr('height', tempHeight)
                .attr('x', 20)
                .attr('y', function(d){
                    return dayDetailSide - detailTempScale(d.minTemp);
                });
            dayDetail.selectAll('g.dayTempColors').data(tempColors2).enter()
                .append('g').attr('class', 'dayTempColors')
                .append('rect')
                .attr('style', 'clip-path: url(#detailTempMarks);')
                .attr('fill', function(d){
                    return d.color;
                })
                .attr('width', 10)
                .attr('height', tempHeight)
                .attr('x', 20)
                .attr('y', function(d){
                    return dayDetailSide - detailTempScale(d.minTemp);
                });
            var selectedDayStats = stats[selectedDay];
            var selectedDayTemps = [selectedDayStats['TMIN-MIN'],selectedDayStats['TMIN'],selectedDayStats['TMAX'],selectedDayStats['TMAX-MAX']];
            dayDetail.selectAll('g.dayTempLabels').data(selectedDayTemps).enter()
                .append('g').attr('class', 'dayTempLabels')
                .append('text')
                .text(function(d) {
                    return d;
                })
                .attr('x', 34)
                .attr('y', function(d){
                    return dayDetailSide - detailTempScale(d) + tempHeight + (tempHeight/2);
                });

            var detailPrecipScale = d3.scale.linear()
                .domain(d3.extent(stats,
                    function(d){
                        return Number(d.PRECIP) + Number(d.SNOW);
                    }))
                .range([0,dayDetailSide]);

            dayDetail.selectAll('g.dayRain').data([stats[selectedDay]]).enter()
                .append('g').attr('class', 'dayRain precip')
                .append('rect')
                .attr('x', 60)
                .attr('y', function(d){
                    return dayDetailSide - detailPrecipScale(d.PRECIP) + tempHeight;
                })
                .attr('width', 10)
                .attr('height', function(d){
                    return detailPrecipScale(d.PRECIP);
                });

            dayDetail.selectAll('g.daySnow').data([stats[selectedDay]]).enter()
                .append('g').attr('class', 'daySnow snow')
                .append('rect')
                .attr('x', 60)
                .attr('y', function(d){
                    return dayDetailSide - detailPrecipScale(d.PRECIP) - detailPrecipScale(d.SNOW) + tempHeight;
                })
                .attr('width', 10)
                .attr('height', function(d){
                    return detailPrecipScale(d.SNOW) || 0;
                });

            dayDetail.selectAll('g.rainLabel').data([stats[selectedDay]]).enter()
                .append('g').attr('class', 'rainLabel')
                .append('text')
                .attr('x', 75)
                .attr('y', function(d){
                    return dayDetailSide - detailPrecipScale(d.PRECIP) + tempHeight;
                })
                .text(function(d){
                    return d.PRECIP;
                });

            dayDetail.selectAll('g.snowLabel').data([stats[selectedDay]]).enter()
                .append('g').attr('class', 'snowLabel')
                .append('text')
                .attr('x', 75)
                .attr('y', function(d){
                    return dayDetailSide - detailPrecipScale(d.PRECIP) - detailPrecipScale(d.SNOW) + tempHeight;
                })
                .text(function(d){
                    return d.SNOW;
                });

        };

        drawDay();

        $('body').on('mousewheel', function(event, delta){
            event.preventDefault();
            var rotateContainer = $('#rotateContainer');
            var parsed = rotateContainer.attr('transform').match(/(rotate\()([-]*[0-9.]+)(\)scale\()([0-9.]+)(\))/);
            var rotation = Number(parsed[2]);
            var scale = Number(parsed[4]);
            if (event.shiftKey) {
                // do zoom
                scale -= delta;
            } else if(event.altKey) {
                // do rotate
                rotation -= (delta*4);
            }
            rotateContainer.attr('transform', 'rotate(' + (rotation) + ')scale(' + (scale) + ')');
        });

        var oldOffset = null;
        var zoomDefault = 'rotate(-90)scale(1.0500000000000005)';
        var zoomIn = 'rotate(-90)scale(3.0500000000000005)';

        $('body').on('click', function(event){
           if(event.shiftKey) {
                if(!oldOffset){
                    oldOffset =  $('#offsetContainer').attr('transform');
                    $('#offsetContainer').attr('transform', 'translate(632.5,-1065)');
                    $('#rotateContainer').attr('transform', zoomIn);
                } else {
                    $('#offsetContainer').attr('transform', oldOffset);
                    $('#rotateContainer').attr('transform', zoomDefault);
                    oldOffset = null;
                }
           }
        });

        $('#rotateContainer').on('mousemove', function(event){
            //console.log(event);
        });

        $('.mouseDay path').on('mouseenter', function(event){
            var day = $(event.currentTarget).data('day');
            selectedDay = day;
            drawDay();
        });

    }


});