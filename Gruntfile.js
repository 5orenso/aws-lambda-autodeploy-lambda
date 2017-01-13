'use strict';

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        packetName: 'aws-lambda-autodeploy-lambda',
        staticLambdaBucket: 'aws-lambda-static',
        autoLambdaBucket: 'aws-lambda-autodeploy-lambda',
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['*.js', 'lib/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        jscs: {
            main: ['*.js', 'test/**/*.js', 'lib/**/*.js'],
            options: {
                config: '.jscsrc'
            }
        },
        watch: {
            all: {
                files: ['test/**/*.js', '*.js', 'lib/**/*.js'],
                tasks: ['lint', 'buster:unit']
            }
        },
        buster: {
            unit: {}
        },
        shell: {
            // jscs:disable
            multiple: {
                command: [
                    'mkdir -p dist',
                    'mv ./node_modules ./node_modules2',
                    'npm install --production',
                    'zip -FSr  dist/<%= packetName %>.zip ./ ' +
                        '-x "*dist*" "bin/*" ".git*" "*.md" "*.DS_Store" "*.sh" "*test*" ' +
                        '"package.json" "Gruntfile.js" ' +
                        '"*node_modules2*" "*coverage/*" ".js*" "*doc/*"',
                    'rm -rf node_modules',
                    'mv ./node_modules2 ./node_modules',
                    'echo ""',
                    'echo "TODO:"',
                    'echo "Upload the zip file to S3 to be able to run it from Lambda."',
                    'echo "$ aws s3 cp dist/<%= packetName %>.zip s3://<%= staticLambdaBucket %>/<%= packetName %>.zip"',
                    'echo ""',
                    'echo "Or to auto update the aws-lambda-autodeploy-lambda :"',
                    'echo "$ aws s3 cp dist/<%= packetName %>.zip s3://<%= autoLambdaBucket %>/<%= packetName %>.zip"',
                    'echo ""'
                ].join('&&')
            }
            // jscs:enable
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-buster');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-coveralls');

    // Default task.
    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('default', ['lint', 'buster:unit']);
    grunt.registerTask('test', ['buster:unit']);
    grunt.registerTask('check', ['watch']);
    grunt.registerTask('artifact', ['shell']);
    grunt.registerTask('build', ['artifact']);
};
