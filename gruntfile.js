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
                    'bower_components/cornerstone/dist/cornerstone.min.css',
                    'bower_components/cornerstone/dist/cornerstone.min.js',
                    'bower_components/hammerjs/hammer.min.js',
                    'bower_components/hammerjs/hammer.min.map',
                    'bower_components/hammerjs/plugins/hammer.fakemultitouch.js'
                ],
                dest: 'examples',
                expand: true,
                flatten: true
            }
        },
        concat: {
            build: {
                src : [
                    'src/inputSources/mouseWheelInput.js',
                    'src/inputSources/mouseInput.js',
                    'src/imageTools/simpleMouseButtonTool.js',
                    'src/imageTools/mouseButtonTool.js',
                    'src/imageTools/mouseWheelTool.js',
                    'src/imageTools/touchDragTool.js',
                    'src/imageTools/touchPinchTool.js',
                    'src/**/*.js'
                ],
                dest: 'build/built.js',
                options: {
                    process: function (src, filepath) {
                        return '// Begin Source: ' + filepath + '\n' + src + ' \n// End Source; ' + filepath + '\n';
                    }
                }
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


// Release process:
//  1) Update version numbers
//  2) do a build (needed to update dist versions with correct build number)
//  3) commit changes
//      git commit -am "Changes...."
//  4) tag the commit
//      git tag -a 0.1.0 -m "Version 0.1.0"
//  5) push to github
//      git push origin master --tags