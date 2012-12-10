define(['d3','underscore'], function(d3,_) {
    "use strict";

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
            .append("g").attr("transform", "scale(1)");

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
        g.selectAll("g.month").append('text').text(function(d) {
                return d.start.getMonth()+1;
            })
            .attr("transform", function (d, i) {
                return "rotate(" + (yearArc(d.start.getTime()+(millisecondsInDay*15))) + ")" +
                    "translate(" + (monthsInnerRadius+(monthsWidth/2)) + ")";
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
                return "rotate(" + (yearArc(d.date.getTime()+millisecondsInDay)) + ")" +
                    "translate(" + daysInnerRadius + ")";

            })
            .append('text').text(function(d){
                return d.date.getDate();
            })
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

        // temperature marks
        var maxTemp = d3.max(stats, function(d){
            return d['TMAX-MAX'];
        });

        var minTemp = d3.min(stats, function(d){
            return d['TMIN-MIN'];
        });

        var tempScale = d3.scale.linear()
            .domain([0, maxTemp-minTemp])
            .range([0,tempWidth]);

        var innerTempRadius = precipInnerRadius + precipWidth + padding;

        g.append("g").attr('class', 'temps').selectAll("g.temp").data(stats)
            .enter().append('g').attr('class', 'temp')
            .append('rect')
            .attr('width', function(d){ return tempScale((d.TMAX- d.TMIN));})
            .attr('height', 4)
            .attr("transform", function (d, i) {
                var date = new Date(today.getFullYear(), d.MO, d.DY, 0, 0, 0, 0);
                return "rotate(" + yearArc(date.getTime()) + ")" +
                    "translate(" + (innerTempRadius + tempScale(d.TMIN)) + ")";
            });

        g.append('g').attr('class','axis')
            .append('circle').attr('r', innerTempRadius);


        g.append('g').attr('class','axis')
            .append('circle').attr('r', innerTempRadius + tempScale(50));


        g.append('g').attr('class','axis')
            .append('circle').attr('r', innerTempRadius + tempScale(100));

        // frost marks
        var innerFrostRadius = innerTempRadius + tempWidth + padding;

        var frostTime = events.frosts.end - events.frosts.start;
        var frostAngle = daysArc(frostTime);

        var frostArc = d3.svg.arc()
            .innerRadius(innerFrostRadius)
            .outerRadius(innerFrostRadius + frostWidth)
            .startAngle(0)
            .endAngle(radians(frostAngle));

        g.append('g').attr('class', 'frost')
            .append('path').attr('d', frostArc())
            .attr("transform", "rotate(" + (-yearArc(events.frosts.start)) + ")");

    }
});