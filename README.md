## Auto deploy lambda functions from S3

[![Build Status](https://travis-ci.org/5orenso/aws-lambda-autodeploy-lambda.svg?branch=master)](https://travis-ci.org/5orenso/aws-lambda-autodeploy-lambda)
[![Coverage Status](https://coveralls.io/repos/github/5orenso/aws-lambda-boilerplate/badge.svg?branch=master)](https://coveralls.io/github/5orenso/aws-lambda-boilerplate?branch=master)

Lambda handler to automatically publish Lambda functions when source is uploaded to S3.


## Important

Lambda function name has to be equal to base filename:   
__"hello-world.zip" will try to update a Lambda function with the name "hello-world"__


## Howto

### Install Node.js modules

```bash
$ npm install
```


## Travis setup

To get auto deployment to S3 working you need to integrate with Travis CI.


### Steps

1. Connect your Github.com repo to your Travis CI account.
2. Add `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` to your Travis CI environment.
3. Edit `.travis.yml` to match your `bucket`, `upload-dir` and `region`.

Next time you push to your master branch Travis will run your tests and if all is green
deploy the code to your S3 bucket.

Isn't this great? :D


### Run Grunt watcher when you develop

```bash
$ cp ./bin/set-env-dist.sh ./bin/set-env.sh
$ . ./bin/set-env.sh
$ grunt watch
```


### Build a new release

```bash
# Build file:
$ grunt build
```


### CloudFormation

```bash
# To create a new stack:
$ bash ./bin/create-stack.sh

# To update a current stack:
$ bash ./bin/create-stack.sh -u
```


### Howto check for vulnerabilities in modules

```bash
# Install Node Security Platform CLI
$ npm install nsp --global  

# From inside your project directory
$ nsp check  
```


### Howto upgrade modules

```bash
$ npm install -g npm-check-updates
$ ncu -u
$ npm install --save --no-optional
```
