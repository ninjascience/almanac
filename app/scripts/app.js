define(['d3'], function(d3) {
    "use strict";

    var days = [],
        months = [],
        today = new Date(),
        currentDay = new Date(today.getFullYear(), 0, 1);

    while (currentDay.getFullYear() === today.getFullYear()){
        var thisDay = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
        currentDay.setDate(currentDay.getDate()+1);
        days.push({date:thisDay});
        if(thisDay.getMonth() !== currentDay.getMonth()) {
            months.push({month: thisDay.getMonth(), days: thisDay.getDate()});
        }
    }

    var angles = [-180, 180];

    var radians = d3.scale.linear()
        .domain(angles)
        .range([-Math.PI, Math.PI]);

    // create scale for arc angle and days of year
    var daysArc = d3.scale.linear()
        .domain([0, days.length - 1])
        .range(angles);

    var monthsArc = d3.scale.linear()
        .domain([0, months.length-1])
        .range(angles);

    var body = $('body');

    var g = d3.select("#viz")
        .append("svg:svg")
        .attr("width", body.outerWidth())
        .attr("height", body.outerHeight())
            .append("g")
                .attr("transform", "translate(" + body.outerWidth()/2 + "," + body.outerHeight()/2 + ")")
                    .append("g").attr("transform", "scale(1)");

    g.selectAll("g.day").data(days)
        .enter().append('g').attr('class', 'day')
        .attr("transform", function (d, i) {
            return "rotate(" + daysArc(i) +
                ")translate(" + 300 + ")";
        }).append('circle').attr('fill', "#333").attr('r', 1.5);

    var arc = d3.svg.arc()
        .innerRadius(274)
        .outerRadius(275)
        .startAngle(function(d,i){
            var degrees = monthsArc(i);
            var r = radians(degrees);
            return r;
        })
        .endAngle(function(d,i){
            var degrees = monthsArc(i+1);
            var r = radians(degrees-1);
            return r;
        });

    g.selectAll("g.month").data(months)
        .enter().append('g').attr('class', 'month')
        .attr("transform", function (d, i) {
            return "translate(" + 0 + ")rotate(180)";
        }).append('path').attr('d', arc).fill('#333');
});