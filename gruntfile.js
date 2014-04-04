module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            default: {
                src: [
                    'dist'
                ]
            }
        },
        concat: {
            dist: {
                src : [ 'src/**/*.js'],
                dest: 'dist/cornerstone-tools.js'
            }
        },
        uglify: {
            cornerstoneTools: {
                files: {
                    'dist/cornerstone-tools.min.js': ['dist/cornerstone-tools.js']
                }
            }
        },
        qunit: {
            all: ['test/*.html']
        },
        jshint: {
            files: [
                'src/**/*.js'
            ]
        },
        watch: {
            scripts: {
                files: ['src/**/*.js', 'test/*.js'],
                tasks: ['buildAll']
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildAll', ['concat', 'uglify', 'jshint']);
    grunt.registerTask('default', ['clean', 'buildAll']);
};