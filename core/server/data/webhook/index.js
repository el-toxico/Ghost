var _               = require('lodash'),
    https            = require('https'),
    querystring     = require('querystring'),
    config          = require('../../config'),
    errors          = require('../../errors'),
    events          = require('../../events'),
    i18n            = require('../../i18n'),
    req,
    req_options,
    pingHost;

// ToDo: Make this configurable

function ping(post) {
    var post_data,
        pingHost;

    if (!config.webhook) {
	return;
    }


    // Don't ping for the welcome to ghost post.
    // This also handles the case where during ghost's first run
    // models.init() inserts this post but permissions.init() hasn't
    // (can't) run yet.
    if (post.slug === 'welcome-to-ghost') {
        return;
    }

    // Build query string
    post_data = querystring.stringify( post );

    req_options = {
        hostname: config.webhook.host,
        path: config.webhook.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    req = https.request(req_options);
    req.write(post_data);
    req.on('error', function handleError(error) {
		    errors.logError(
				    error,
				    i18n.t('errors.data.webhook.pingUpdateFailed.error'),
				    i18n.t('errors.data.webhook.pingUpdateFailed.help', {url: 'http://support.ghost.org'})
				   );
		    }
	  );
    req.end();
}

function listener(model) {
    ping(model.toJSON());
}

function listen() {
    events.on('post.published', listener);
    events.on('post.published.edited', listener);
}

module.exports = {
    listen: listen
};
