require.config({

    paths:{
        hm:'vendor/hm',
        esprima:'vendor/esprima',
        jquery:'vendor/jquery.min',
        d3:'../components/d3/d3.v2',
        underscore: '../components/underscore/underscore',
        mousewheel: 'vendor/jquery.mousewheel'
    },
    shim:{
        'mousewheel': ['jquery'],
        'd3':{exports:'d3'},
        'underscore':{exports:'_'}
    }
});

require(['app'], function (app) {
    // use app here
    console.log(app);
});