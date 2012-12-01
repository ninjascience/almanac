define(['d3'], function(d3) {
    var daysInYear = 365,
        random = d3.random.normal(3, 10),
        days = d3.range(daysInYear).map(random),
        months = d3.range(12);

    var angles = [-180, 180];

    // create scale for arc angle and days of year
    var daysArc = d3.scale.linear()
        .domain([0, daysInYear - 1])
        .range(angles);

    var monthsArc = d3.scale.linear()
        .domain([0, 11])
        .range(angles);

    var body = $('body');

    var g = d3.select("#viz")
        .append("svg:svg")
        .attr("width", body.outerWidth())
        .attr("height", body.outerHeight())
            .append("g")
        .attr("transform", "translate(" + body.outerWidth()/2 + "," + body.outerHeight()/2 + ")");

    g.selectAll("g.day").data(days)
        .enter().append('g').attr('class', 'day')
        .attr("transform", function (d, i) {
            return "rotate(" + daysArc(i) +
                ")translate(" + 300 + ")";
        }).append('rect').attr('fill', "#000").attr('width', function(d){return d;}).attr('height', 3);

    g.selectAll("g.month").data(months)
        .enter().append('g').attr('class', 'day')
        .attr("transform", function (d, i) {
            return "rotate(" + monthsArc(i) +
                ")translate(" + 275 + ")";
        }).append('rect').attr('fill', "#000").attr('width', 3).attr('height', 3);
});