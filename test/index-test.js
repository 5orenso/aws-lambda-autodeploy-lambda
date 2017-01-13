'use strict';
var buster = require('buster'),
    assert = buster.assert;

var index = require('../index');
var event = require('./aws-s3-put-event.json');
let updateFunctionCodeResult = {
    CodeSha256: '55555544444443333333322222221111111aaaaabbb=',
    CodeSize: 898,
    Description: 'Hello World',
    FunctionArn: 'arn:aws:lambda:eu-west-1:100000000000:function:helloWorld',
    FunctionName: 'helloWorld',
    Handler: 'index.handler',
    LastModified: '2016-01-27T09:46:13.244+0000',
    MemorySize: 128,
    Role: 'arn:aws:iam::100000000000:role/lambda-deployment-runner',
    Runtime: 'nodejs',
    Timeout: 3,
    Version: '$LATEST'
};
let getFunctionResult = {
    Configuration: {
        FunctionName: 'helloWorld',
        FunctionArn: 'arn:aws:lambda:eu-west-1:100000000000:function:helloWorld',
        Runtime: 'nodejs',
        Role: 'arn:aws:iam::100000000000:role/lambda-deployment-runner',
        Handler: 'index.handler',
        CodeSize: 898,
        Description: 'Hello World',
        Timeout: 3,
        MemorySize: 128,
        LastModified: '2016-01-27T12:03:26.076+0000',
        CodeSha256: '55555544444443333333322222221111111aaaaabbb=',
        Version: '$LATEST'
    },
    Code: {
        RepositoryType: 'S3',
        Location: 'https://awslambda-eu-west-1-tasks.s3-eu-west-1.amazonaws.com/'
    }
};

var AWS = require('aws-sdk-mock');
AWS.mock('Lambda', 'updateFunctionCode', function (params, callback) {
    if (params.FunctionName.match(/updateFunctionBoom/)) {
        callback('updateFunction BOOM!');
    }
    callback(null, updateFunctionCodeResult);
});

AWS.mock('Lambda', 'getFunction', function (params, callback) {
    if (params.FunctionName.match(/getFunctionBoom/)) {
        callback('getFunction BOOM!');
    }
    callback(null, getFunctionResult);
});

var http = require ('https'),
    qs = require('querystring');

buster.testCase('Index module testCase', {
    setUp: function () {
        this.timeout = 2000;
        this.sandbox = buster.sinon.sandbox.create();
        this.sandbox.stub(http, 'request', function (param, callback) {
            const EventEmitter = require('events');
            // Response emitter
            class ResEmitter extends EventEmitter {
                // jscs:disable
                setEncoding() {}
                // jscs:enable
            }
            const resEmitter = new ResEmitter();
            // Request emitter
            class ReqEmitter extends EventEmitter {
                write(data) {
                    if (data.match(/BOOM/)) {
                        this.emit('error', { message: 'BOOM!' });
                    }
                    var dataObj = Object.assign(JSON.parse(qs.parse(data).payload), param);
                    resEmitter.emit('data', JSON.stringify(dataObj));
                }
                end() {
                    resEmitter.emit('end');
                }
            }
            const reqEmitter = new ReqEmitter();
            callback(resEmitter);
            return reqEmitter;
        });
    },
    tearDown: function () {
        this.sandbox.restore();
    },
    'module tests': {
        'should resolve with a valid JSON output from lambda': function (done) {
            index.handler(event, null, (error, result) => {
                if (typeof result === 'string') {
                    let resultObject = JSON.parse(result);
                    assert.equals(resultObject.path, process.env.SLACK_HOOK_PATH);
                    assert.equals(resultObject.channel, process.env.SLACK_CHANNEL);
                    assert.equals(resultObject.username, process.env.SLACK_USERNAME);
                    assert.match(resultObject.text, /Deployment of "helloWorld"/);
                    done();
                } else {
                    console.log('No result object, error:', error);
                }
            });
        }

    }
});
