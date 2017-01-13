var config = module.exports;

config['My tests'] = {
    environment: 'node',
    rootPath: '../',
    tests: [
        'test/**/**/*.js'
    ],

    // buster-istanbul setup
    'buster-istanbul': {
        outputDirectory: 'coverage',
        format: 'lcov'
    },
    sources: [
        '*.js',
        'lib/**/*.js',
        '!Gruntfile.js'
    ],
    extensions: [
        require('buster-istanbul')
    ]
};
