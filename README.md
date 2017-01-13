## Auto deploy lambda functions from S3

Lambda handler to automatically publish Lambda functions when source is uploaded to S3.

## Important
Lambda function name has to be equal to base filename:   
__"hello-world.zip" will try to update a Lambda function with the name "hello-world"__

## Howto

### Install Node.js modules

```bash
$ npm install
```

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
