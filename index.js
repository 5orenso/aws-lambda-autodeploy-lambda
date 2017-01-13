'use strict';
/**
 * @fileOverview Lambda handler for S3 upload events to our Lambda function bucket.
 * @name Lambda handler
 */
let lambda = require('./lib/lambda'),
    slack = require('./lib/slack');

/**
 * Lambda handler.
 * @param {object} event - Object passed on from AWS Lambda.
 * @param {object} context - Object passed on from AWS Lambda.
 * @param {function} callback - Function passed on from AWS Lambda. `callback(error, result)`
 */
exports.handler = (event, context, callback) => {
    let params = {
        key: event.Records[0].s3.object.key,
        bucket: event.Records[0].s3.bucket.name,
        version:event.Records[0].s3.object.versionId
    };
    lambda.updateFunction(params)
        .then(slack.post)
        .then(result => {
            callback(null, result);
        })
        .catch(error => {
            callback(error);
        });
};
