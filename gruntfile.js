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
        copy: {
            bower: {
                src: [
                    'bower_components/hammerjs/hammer.min.js',
                    'bower_components/hammerjs/hammer.min.map',
                    'bower_components/hammerjs/plugins/hammer.fakemultitouch.js'
                ],
                dest: 'examples',
                expand: true,
                flatten: true
            },
        },
        concat: {
            build: {
                src : [
                    'src/inputSources/mouseWheelInput.js',
                    'src/inputSources/mouseInput.js',
                    'src/imageTools/mouseButtonTool.js',
                    'src/imageTools/mouseWheelTool.js',
                    'src/imageTools/touchDragTool.js',
                    'src/imageTools/touchPinchTool.js',
                    'src/**/*.js'
                ],
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

    grunt.registerTask('buildAll', ['copy', 'concat:build', 'concat:dist', 'uglify', 'jshint']);
    grunt.registerTask('default', ['clean', 'buildAll']);
};