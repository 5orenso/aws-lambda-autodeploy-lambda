'use strict';
var buster = require('buster'),
    assert = buster.assert;

var http = require ('https'),
    qs = require('querystring'),
    slack = require('../../lib/slack');
var testMessage = 'Foobar';
buster.testCase('Slack module testCase', {
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
        'default post should resolve with the response our http.request mock': function (done) {
            slack.post(testMessage)
                .then(result => {
                    var resObj = JSON.parse(result);
                    assert.equals(resObj.text, testMessage);
                    assert.equals(resObj.channel, process.env.SLACK_CHANNEL);
                    assert.equals(resObj.username, process.env.SLACK_USERNAME);
                    done();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },
        'test-channel post should resolve with the response our http.request mock': function (done) {
            slack.post(testMessage, { channel: '#test' })
                .then(result => {
                    var resObj = JSON.parse(result);
                    assert.equals(resObj.text, testMessage);
                    assert.equals(resObj.channel, '#test');
                    assert.equals(resObj.username, process.env.SLACK_USERNAME);
                    done();
                }).catch(error => {
                    console.error('Error:', error);
                });
        },
        'this should reject with BOOM!': function (done) {
            slack.post('BOOM')
                .then(result => {
                    console.log(result);
                }, error => {
                    assert.equals(error, 'BOOM!');
                    done();
                }).catch(error => {
                    console.error('Error:', error);
                });
        },
        'post with other options should resolve with the response our http.request mock': function (done) {
            slack.post(testMessage, {}, { path: '/test/foobar', port: 123, hostname: 'foo.bar.gomle' })
                .then(result => {
                    var resObj = JSON.parse(result);
                    assert.equals(resObj.text, testMessage);
                    assert.equals(resObj.channel, process.env.SLACK_CHANNEL);
                    assert.equals(resObj.username, process.env.SLACK_USERNAME);
                    assert.equals(resObj.path, '/test/foobar');
                    assert.equals(resObj.port, 123);
                    assert.equals(resObj.hostname, 'foo.bar.gomle');
                    done();
                }).catch(error => {
                    console.error('Error:', error);
                });
        }
    }
});
