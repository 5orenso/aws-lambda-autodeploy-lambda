'use strict';

let http = require ('https'),
    querystring = require ('querystring');

let slackHookPath = process.env.SLACK_HOOK_PATH,
    slackChannel = process.env.SLACK_CHANNEL,
    slackUsername = process.env.SLACK_USERNAME,
    slackEmoji = process.env.SLACK_EMOJI || ':ghost:';

function post(message, params, opts) {
    return new Promise((resolve, reject) => {
        let messageJson = {
            channel: slackChannel,
            username: slackUsername,
            text: message,
            // jscs:disable
            icon_emoji: slackEmoji
            // jscs:enable
        };
        if (typeof params === 'object') {
            let keys = ['channel', 'username', 'icon_emoji'];
            for (let key of keys) {
                if (params.hasOwnProperty(key)) {
                    messageJson[key] = params[key];
                }
            }
        }
        let postData = querystring.stringify({
            payload: JSON.stringify(messageJson)
        });
        let options = {
            hostname: 'hooks.slack.com',
            port: 443,
            path: slackHookPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };
        if (typeof opts === 'object') {
            let keys = ['hostname', 'port', 'path'];
            for (let key of keys) {
                if (opts.hasOwnProperty(key)) {
                    options[key] = opts[key];
                }
            }
        }
        let req = http.request(options, res => {
            res.setEncoding('utf8');
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
        req.on('error', error => {
            reject(error.message);
        });
        req.write(postData);
        req.end();
    });
}

module.exports = {
    post: post
};
