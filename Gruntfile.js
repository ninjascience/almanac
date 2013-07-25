module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-contrib-sass');

    // Project configuration.
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 9001,
                    base: '.'
                }
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'styles/main.css': 'styles/main.scss'
                }
            }
        }
    });

    grunt.registerTask('server', ['connect:server']);

    // Default task.
    grunt.registerTask('default', ['server']);

};
