#!/bin/bash

# The path is the last part from the url:
# https://hook.slack.com/services/my/slack-hook/path
#          This part    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
# To find you hook url you need to set up webhooks inside your slack account.
export SLACK_HOOK_PATH='/services/my/slack-hook/path'
export SLACK_CHANNEL='#my-slack-channel'
export SLACK_USERNAME='my-slack-username'
export SLACK_EMOJI=':ghost:'

export LAMBDA_FUNCTION_NAME='aws-lambda-autodeploy-lambda'
export LAMBDA_S3_BUCKET='aws-lambda-static'
export LAMBDA_S3_AUTODEPLOY_BUCKET='aws-lambda-autodeploy-lambda'
