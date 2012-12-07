define(['d3'], function(d3) {
    "use strict";

    var body = $('body');

    var outerRadius = 400,
        padding = 10,
        innerRadius = 300,
        seasonsWidth = 50,
        monthsWidth = 50,
        precipWidth = 50,
        tempWidth = 100;


    var days = [],
        months = [],
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

    // Days of the Week mapped to integers
    var daysOfWeek = d3.scale.ordinal()
        .domain([0, 1, 2, 3, 4, 5, 6])
        .range(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

    var angles = [-180, 180];

    // create scale for arc angle and epoch time
    var yearArc = d3.scale.linear()
        .domain([days[0].date.getTime(), days[days.length-1].date.getTime()])
        .range(angles);

    draw();

    function draw() {
        if (!stats || !days || !events || !months) return;

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
        g.append('g').attr('class','axis')
            .append('circle').attr('r', monthsInnerRadius+monthsWidth);

        // TODO: moon marks

        // day marks
        var daysInnerRadius = monthsInnerRadius + monthsWidth + padding;
        g.append("g").attr('class', 'days').selectAll("g.day").data(days)
            .enter().append('g').attr('class', 'day')
            .attr("transform", function (d, i) {
                return "rotate(" + (yearArc(d.date.getTime())+1) + ")" +
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

        // TODO: frost marks

    }
});