var url = require('url');
var util = require('util');

var _ = require('lodash');
var pre = require('amoeba').pre;

module.exports = function (hostGetter, config, request) {
  if (config == null) {
    config = {};
  }
  if (request == null) {
    request = require('request');
  }

  pre.defaultProperty(config, 'pathPrefix', '');

  if (config.pathPrefix[config.pathPrefix.length - 1] === '/') {
    config.pathPrefix = config.pathPrefix.substr(0, config.pathPrefix.length - 1);
  }

  function doRequest(path, options, cb) {
  }

  function requestTo(path) {
    var options = {
      method: 'GET',
      headers: {}
    };

    var statusHandlers = {};

    return {
      withMethod: function(method){
        options.method = method;
        return this;
      },
      withHeader: function(header, value) {
        options.headers[header] = value;
        return this;
      },
      withToken: function(token) {
        return this.withHeader('x-tidepool-session-token', token);
      },
      withBody: function(body) {
        options.body = body;
        return this;
      },

      /**
       * Registers a function to handle a specific response status code.
       *
       * The return value of the function will be passed to the callback provided on the go() method
       *
       * @param status either a numeric status code or an array of numeric status codes.
       * @param fn A function(response, body){} to use to extract the value from the response
       * @returns {exports}
       */
      whenStatus: function(status, fn) {
        if (Array.isArray(status)) {
          for (var i = 0; i < status.length; ++i) {
            this.whenStatus(status[i], fn);
          }
          return this;
        }

        statusHandlers[status] = fn;
        return this;
      },

      /**
       * Issues the request and calls the given callback.
       * @param cb An idiomatic function(error, result){} callback
       * @returns {*}
       */
      go: function(cb) {
        var hostSpecs = hostGetter.get();
        if (hostSpecs.length < 1) {
          return cb({ statusCode: 503, message: "No hosts found" }, null);
        }
        options.url = util.format('%s%s%s', url.format(hostSpecs[0]), config.pathPrefix, path);

        request(options, function (err, res, body) {
          if (err != null) {
            return cb(err);
          } else if (statusHandlers[res.statusCode] != null) {
            return cb(null, statusHandlers[res.statusCode](res, body));
          } else {
            return cb({ statusCode: res.statusCode, message: util.inspect(body) });
          }
        });
      }
    }
  }

  function parseJson(res, body) {
    return JSON.parse(body);
  }

  return {
    getProfile: function (userId, token, cb) {
      this.getCollection(userId, 'profile', token, cb);
    },
    getGroups: function (userId, token, cb) {
      this.getCollection(userId, 'groups', token, cb);
    },
    getHash: function (userId, hashName, token, cb) {
      pre.notNull(userId, "Must specify a userId");
      pre.notNull(hashName, "Must specify the hash name");

      requestTo(util.format('/%s/private/%s', userId, hashName))
        .withToken(token)
        .whenStatus(200, parseJson)
        .go(cb);
    },
    getCollection: function (userId, collectionName, token, cb) {
      pre.notNull(userId, "Must specify a userId");
      pre.notNull(collectionName, "Must specify the collectionName");
      pre.notNull(token, "Must specify a token");

      requestTo(util.format('/%s/%s', userId, collectionName))
        .withToken(token)
        .whenStatus(200, parseJson)
        .go(cb);
    }
  }
};