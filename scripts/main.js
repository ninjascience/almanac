require.config({

    paths:{
        jquery:'/bower_components/jquery/jquery',
        d3:'/bower_components/d3/d3',
        underscore: '/bower_components/underscore/underscore',
        bootstrap: '/bower_components/bootstrap/dist/js/bootstrap'
    },
    shim:{
        'd3':{exports:'d3'},
        'underscore':{exports:'_'},
        'bootstrap': {
            'deps': [
                'jquery'
            ]
        },
        'app': {
            'deps': [
                'bootstrap'
            ]
        }
    }
});

require(['app'], function (app) {
    // use app here
});
