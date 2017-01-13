'use strict';
let AWS = require('aws-sdk'),
    functionName = 'aws-lambda-autodeploy-lambda';

/**
 * Get function name based on input filename.
 * @param {string} key - Filename of code package.
 * @returns {string} functionName
 */
function getFunctionName(key) {
    let functionName = key.replace(/\.zip$/i, '');
    functionName = functionName.replace(/^.+\//, '');
    return functionName;
}

/**
 * Update Lambda function when files are uploaded to S3 in our Lambda folder.
 * !Important: Lambda function name has to be equal to base filename.
 *      "hello-world.zip" will try to update a Lambda function with the name
 *      "hello-world"
 * @param {object} params
 * @property {string} key - Filename.
 * @property {string} bucket - Bucket name.
 * @property {string} version - File version.
 * @returns {function} promise - Returns a promise which resolves or rejects with the response
 * from AWS lambda.updateFunctionCode or resolves with a skip message.
 */
function updateFunction(params) {
    if (params.hasOwnProperty('bucket') && params.key.match(/\.zip$/i)) {
        let functionName = getFunctionName(params.key);
        let lambdaParams = {
            FunctionName: functionName,
            S3Key: params.key,
            S3Bucket: params.bucket,
            S3ObjectVersion: params.version
        };
        return getLambdaFunction(lambdaParams)
            .then(updateLambdaFunction);
    } else {
        let message = `${functionName}: Skipping "${params.key}" in bucket "${params.bucket}" ` +
            `with version "${params.version}"`;
        return Promise.resolve(message);
    }
}

/**
 * Promisifying the AWS lambda.updateFunctionCode
 * @param lambdaParams
 * @property {string} FunctionName
 * @property {string} S3Key
 * @property {string} S3Bucket
 * @property {string} S3ObjectVersion
 * @returns {function} promise - Returns a promise which resolves or rejects with the response
 * from AWS lambda.updateFunctionCode
 */
function updateLambdaFunction(lambdaParams) {
    let lambda = new AWS.Lambda({
        region: 'eu-west-1'
    });
    return new Promise((resolve, reject) => {
        lambda.updateFunctionCode(lambdaParams, err => {
            if (err) {
                return reject(`${functionName}: Error trying to updateFunctionCode: ${err}`);
            }
            resolve(`${functionName}: Deployment of "${lambdaParams.FunctionName}" successful!`);
        });
    });
}

/**
 * Promisifying the AWS lambda.getFunction
 * @param functionName
 * @returns {function} promise - Returns a promise which resolves or rejects with the response
 * from AWS lambda.getFunction
 */
function getLambdaFunction(lambdaParams) {
    let lambda = new AWS.Lambda({
        region: 'eu-west-1'
    });
    return new Promise((resolve, reject) => {
        lambda.getFunction({FunctionName: lambdaParams.FunctionName}, err => {
            if (err) {
                return reject(`${functionName}: Error trying to getFunction: ` +
                    `"${lambdaParams.FunctionName}": ${err}`);
            }
            resolve(lambdaParams);
        });
    });
}

module.exports = {
    updateFunction: updateFunction
};
