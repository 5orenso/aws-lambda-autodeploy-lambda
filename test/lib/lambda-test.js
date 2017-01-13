'use strict';
let buster = require('buster'),
    assert = buster.assert;

let lambda = require('../../lib/lambda');
let event = require('../aws-s3-put-event.json');
let functionName = 'aws-lambda-autodeploy-lambda';
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

let AWS = require('aws-sdk-mock');
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

buster.testCase('Lambda module testCase', {
    setUp: function () {
        this.timeout = 2000;
    },
    tearDown: function () {
    },
    'module tests': {
        'should resolve with a valid JSON output from lambda': function (done) {
            let params = {
                key: event.Records[0].s3.object.key,
                bucket: event.Records[0].s3.bucket.name,
                version:event.Records[0].s3.object.versionId
            };
            lambda.updateFunction(params)
                .then(result => {
                    assert.match(result, `${functionName}: Deployment of "helloWorld" successful`);
                    done();
                }, error => {
                    console.log(error);
                }).catch(error => {
                    console.error(error);
                });
        },
        'should blow up on lambda.getFunction': function (done) {
            let params = {
                bucket: 'your-lambda-function-bucket',
                key: 'getFunctionBoom.zip'
            };
            lambda.updateFunction(params)
                .then(function (result) {
                    console.log(result);
                }, error => {
                    assert.equals(error, `${functionName}: Error trying to getFunction: "getFunctionBoom": ` +
                        'getFunction BOOM!');
                    done();
                }).catch(error => {
                    console.error(error);
                });
        },
        'should blow up on lambda.updateFunction': function (done) {
            let params = {
                bucket: 'your-lambda-function-bucket',
                key: 'updateFunctionBoom.zip'
            };
            lambda.updateFunction(params)
                .then(result => {
                    console.log(result);
                }, error => {
                    assert.equals(error, `${functionName}: Error trying to updateFunctionCode: ` +
                        'updateFunction BOOM!');
                    done();
                }).catch(error => {
                    console.error(error);
                });
        },
        'should skip files with wrong extension': function (done) {
            let params = {
                bucket: 'your-lambda-function-bucket',
                key: 'FileWithWrongExtension.txt'
            };
            lambda.updateFunction(params)
                .then(result => {
                    assert.equals(result, `${functionName}: Skipping "FileWithWrongExtension.txt" in bucket ` +
                        '"your-lambda-function-bucket" with version "undefined"');
                    done();
                }, error => {
                    console.error(error);
                }).catch(error => {
                    console.error(error);
                });
        }

    }
});
