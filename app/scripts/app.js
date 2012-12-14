define(['d3','underscore'], function(d3,_) {
    "use strict";


//    var tempColors = [
//        //{zone: '3a', minTemp: -40, color: 0xE2A2D7},
//        //{zone: '3b', minTemp: -35, color: 0xBFACE3},
//        //{zone: '4a', minTemp: -30, color: 0x96B5E5},
//        //{zone: '4b', minTemp: -25, color: 0x6CBCDD},
//        //{zone: '5a', minTemp: -20, color: 0x49C0CC},
//        //{zone: '5b', minTemp: -15, color: 0x3CC1B4},
//        //{zone: '6a', minTemp: -10, color: 0x4DC098},
//        //{zone: '6b', minTemp: -5, color: 0x68BD7C},
//        {zone: '7a', minTemp: 0, color: "#85B862"},
//        {zone: '7b', minTemp: 5, color: "#A1B04F"},
//        {zone: '8a', minTemp: 10, color: "#BBA746"},
//        {zone: '8b', minTemp: 15, color: "#D19C48"},
//        {zone: '9a', minTemp: 20, color: "#E39054"},
//        {zone: '9b', minTemp: 25, color: "#ED8667"},
//        {zone: '10a', minTemp: 30, color: "#E39054"},
//        {zone: '10b', minTemp: 35, color: "#ED8667"}
//    ];

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
//
//    var tempColors = [
//        {minTemp: 0, color: "#F9B5F0"},
//        {minTemp: 5, color: "#DEBCF9"},
//        {minTemp: 10, color: "#C1C2FD"},
//        {minTemp: 15, color: "#A2C8FC"},
//        {minTemp: 20, color: "#83CDF6"},
//        {minTemp: 25, color: "#66D0EC"},
//        {minTemp: 30, color: "#4ED2DD"},
//        {minTemp: 35, color: "#42D2CC"},
//        {minTemp: 40, color: "#46D2B8"},
//        {minTemp: 45, color: "#55D0A3"},
//        {minTemp: 50, color: "#68CE8E"},
//        {minTemp: 55, color: "#7DCA7B"},
//        {minTemp: 60, color: "#90C569"},
//        {minTemp: 65, color: "#A4BF5A"},
//        {minTemp: 70, color: "#B6B850"},
//        {minTemp: 75, color: "#C7B14A"},
//        {minTemp: 80, color: "#D7A94B"},
//        {minTemp: 85, color: "#E4A050"},
//        {minTemp: 90, color: "#EF9859"},
//        {minTemp: 95, color: "#F69066"}
//    ]

    var body = $('body');

    var padding = 10,
        innerRadius = 200,
        seasonsWidth = 50,
        monthsWidth = 50,
        moonWidth = 10,
        precipWidth = 50,
        tempWidth = 100,
        frostWidth = 5;

    // Days of the Week mapped to integers
    var daysOfWeek = d3.scale.ordinal()
        .domain([0, 1, 2, 3, 4, 5, 6])
        .range(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

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

    function draw() {
        if (!stats || !days || !events || !months || !phases) return;

        d3.select('#viz').innerHTML = '';

        var g = d3.select("#viz")
            .append("svg:svg")
            .attr("width", body.outerWidth())
            .attr("height", body.outerHeight())
            .append("g")
            .attr("transform", "translate(" + body.outerWidth()/2 + "," + body.outerHeight()/2 + ")")
            .append("g").attr("transform", "rotate(-90)scale(1)");

        // season mark
        g.append('g').attr('class','axis')
            .append('circle').attr('r', innerRadius);
        g.selectAll("g.season").data(events.seasons)
            .enter().append('g').attr('class', 'season')
            .append('rect').attr('width', seasonsWidth).attr('height', 1)
            .attr("transform", function (d, i) {
                return "rotate(" + yearArc(d.start) + ")" +
                    "translate(" + (innerRadius) + ")";
            });
        g.selectAll("g.season")
            .append('text').text(function(d) {
                return d.name;
            })
            .attr('class', 'seasonLabel')
            .attr("text-anchor", "middle")
            .attr("transform", function (d, i) {

                return "rotate("
                    + (yearArc(d.start + ((d.end - d.start) / 2))) + ")" +
                    "translate(" + (innerRadius+padding) + ")rotate(90)";
            });

        // month marks
        var monthsInnerRadius = innerRadius + seasonsWidth;
        g.append('g').attr('class','axis')
            .append('circle').attr('r', monthsInnerRadius);
        g.selectAll("g.month").data(months)
            .enter().append('g').attr('class', 'month')
            .append('rect').attr('width', monthsWidth).attr('height', 1)
            .attr("transform", function (d, i) {
                return "rotate(" + yearArc(d.start.getTime()) + ")" +
                    "translate(" + (monthsInnerRadius) + ")";
            });
        g.selectAll("g.month")
            .append('text').text(function(d) {
                return d.start.getMonth()+1;
            })
            .attr('class', 'monthLabel')
            .attr("text-anchor", "middle")
            .attr("transform", function (d, i) {
                return "rotate("
                        + (yearArc(d.start.getTime() + ((d.end.getTime()- d.start.getTime()) / 2))) + ")" +
                    "translate(" + (monthsInnerRadius+padding) + ")rotate(90)";
            });
        g.append('g').attr('class','axis')
            .append('circle').attr('r', monthsInnerRadius+monthsWidth);

        // Moon marks
        var moonInnerRadius = monthsInnerRadius + monthsWidth + padding;
        g.append("g").attr('class', 'phases').selectAll("g.moon").data(phases)
            .enter().append('g').attr('class', 'moon')
            .attr("transform", function (d, i) {
                return "rotate(" + (yearArc(d.date.getTime()+millisecondsInDay)) + ")" +
                    "translate(" + moonInnerRadius + ")";

            })
            .append('path').attr("d", d3.svg.symbol())
            .attr('class', function(d){
                return phasesOfMoon(d.phase);
            });

        // day marks
        var daysInnerRadius = moonInnerRadius + moonWidth + padding;
        g.append("g").attr('class', 'days').selectAll("g.day").data(days)
            .enter().append('g').attr('class', 'day')
            .attr("transform", function (d, i) {
                return "rotate(" + (yearArc(d.date.getTime())) + ")" +
                    "translate(" + daysInnerRadius + ")";

            })
            .append('text').text(function(d){
                return d.date.getDate();
            })
            .attr('baseline-shift', '-100%')
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
            .attr('width', function(d){ return precipScale(d.PRECIP);})
            .attr('height', 4)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO, d.DY);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (precipInnerRadius) + ")";
            });


        // frost marks
        var innerTempRadius = precipInnerRadius + precipWidth + padding;
        var innerFrostRadius = innerTempRadius;

        var frostTime = events.frosts.end - events.frosts.start;
        var frostAngle = daysArc(frostTime);
        var growAngle = 360 - frostAngle;

        var frostArc = d3.svg.arc()
            .innerRadius(innerFrostRadius)
            .outerRadius(innerFrostRadius + 2)
            .startAngle(0)
            .endAngle(radians(frostAngle));

        var growArc = d3.svg.arc()
            .innerRadius(innerFrostRadius)
            .outerRadius(innerFrostRadius + 1)
            .startAngle(0)
            .endAngle(radians(growAngle));


//        g.append('g').attr('class', 'frost')
//            .append('path').attr('d', frostArc())
//            .attr("transform", "rotate(" + (-yearArc(events.frosts.start)) + ")");

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
                var date = new Date(today.getFullYear(), d.MO, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d.TMIN)) + ")";
            });

        clipPath.selectAll("circle.maxTemp").data(stats)
            .enter()
            .append('circle').attr('class', 'maxTemp')
            .attr('r', 1.5)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d['TMAX-MAX'])) + ")";
            });

        clipPath.selectAll("circle.minTemp").data(stats)
            .enter()
            .append('circle').attr('class', 'minTemp')
            .attr('r', 1.5)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d['TMIN-MIN'])) + ")";
            });

        // temperature colors
        g.append('g').attr('class', 'tempColors')
            .selectAll('g.tempColor').data(tempColors).enter()
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



//        g.append('g').attr('class','axis')
//            .append('circle').attr('r', innerTempRadius);

        // axis line for freezing
//        g.append('g').attr('class','axis')
//            .append('circle').attr('r', innerTempRadius + tempScale(32));

//
//        g.append('g').attr('class','axis')
//            .append('circle').attr('r', innerTempRadius + tempScale(100));


    }
});