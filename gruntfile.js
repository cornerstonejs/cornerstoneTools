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
            build: {
                src : ['src/**/*.js'],
                dest: 'build/built.js'
            },
            dist: {
                options: {
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                        '| (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */\n'
                },
                src : ['build/built.js'],
                dest: 'dist/cornerstoneTools.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/cornerstoneTools.min.js': ['dist/cornerstoneTools.js']
                }
            },
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                    '| (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */\n'
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
                tasks: ['concat:build', 'concat:dist', 'jshint']
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildAll', ['concat:build', 'concat:dist', 'uglify', 'jshint']);
    grunt.registerTask('default', ['clean', 'buildAll']);
};