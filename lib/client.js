/*
  == BSD2 LICENSE ==
  Copyright (c) 2014, Tidepool Project
  
  This program is free software; you can redistribute it and/or modify it under
  the terms of the associated License, which is identical to the BSD 2-Clause
  License as published by the Open Source Initiative at opensource.org.
  
  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the License for more details.
  
  You should have received a copy of the License along with this program; if
  not, you can obtain one from Tidepool Project at tidepool.org.
  == BSD2 LICENSE ==
 */

/***
  Setup: require('seagull-client')(config, hostGetter, request);
  Params:
    config -- an object containing configuration parameters
    hostGetter -- an object from hakken
    request -- (optional) -- the result of require('request'). If not supplied a new one will be created.
  
  Generates an object with the members listed below.

  Heading: Members
 */


var util = require('util');

var _ = require('lodash');
var pre = require('amoeba').pre;

module.exports = function (hostGetter, config, httpClient) {
  if (config == null) {
    config = {};
  }

  pre.defaultProperty(config, 'pathPrefix', '');

  if (config.pathPrefix[config.pathPrefix.length - 1] === '/') {
    config.pathPrefix = config.pathPrefix.substr(0, config.pathPrefix.length - 1);
  }

  httpClient = httpClient.withConfigOverrides({ hostGetter: hostGetter });

  function makePath() {
    return config.pathPrefix + util.format.apply(util, Array.prototype.slice.call(arguments, 0));
  }

  return {
    /***
      Function: getProfile(userId, token, cb)
      Desc: Retrieves the user profile from metadata
      Args: userId -- the Tidepool-assigned userId
            token -- a server token or the user token
            cb(err, response) -- the callback
      CallbackArgs: err -- null if no error, else an object
            response -- result from the /metadata/:userid/profile api call
    **/
    getProfile: function (userId, token, cb) {
      this.getCollection(userId, 'profile', token, cb);
    },
    /***
      Function: getGroups(userId, token, cb)
      Desc: Retrieves the user group information from metadata
      Args: userId -- the Tidepool-assigned userId
            token -- a server token or the user token
            cb(err, response) -- the callback
      CallbackArgs: err -- null if no error, else an object
            response -- result from the /metadata/:userid/groups api call
    **/
    getGroups: function (userId, token, cb) {
      this.getCollection(userId, 'groups', token, cb);
    },
    /***
      Function: getPrivatePair(userId, hashName, token, cb)
      Desc: Gets a private pair from metadata
      Args: userId -- the Tidepool-assigned userId
            hashName -- the name of the particular pair value to retrieve
            token -- a server token (user token not valid)
            cb(err, response) -- the callback
      CallbackArgs: err -- null if no error, else an object
            response -- result from the /metadata/:userid/private api call
    **/
    getPrivatePair: function (userId, hashName, token, cb) {
      pre.notNull(userId, "Must specify a userId");
      pre.notNull(hashName, "Must specify the hash name");

      httpClient.requestToPath(makePath('/%s/private/%s', userId, hashName))
        .withToken(token)
        .whenStatusPassBody(200)
        .whenStatusPassNull(404)
        .go(cb);
    },
    /***
      Function: getCollection(userId, collectionName, token, cb)
      Desc: Retrieves arbitrary collection information from metadata
      Args: userId -- the Tidepool-assigned userId
            collectionName -- the collection being retrieved
            token -- a server token or the user token
            cb(err, response) -- the callback
      CallbackArgs: err -- null if no error, else an object
            response -- result from the /metadata/:userid/groups api call
    **/
    getCollection: function (userId, collectionName, token, cb) {
      pre.notNull(userId, "Must specify a userId");
      pre.notNull(collectionName, "Must specify the collectionName");
      pre.notNull(token, "Must specify a token");

      httpClient.requestToPath(makePath('/%s/%s', userId, collectionName))
        .withToken(token)
        .whenStatusPassBody(200)
        .whenStatusPassNull(404)
        .go(cb);
    }
  }
};