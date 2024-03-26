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

// jshint -W030

'use strict';

var fs = require('fs');

var expect = require('salinity').expect;

describe('lib/client.js', function(){
  var port = 21002;
  var hostGetter = {
    get: function() { return [{ protocol: 'https', host: 'localhost:' + port }]; }
  };

  var httpClient = require('amoeba').httpClient();
  var client = require('../lib/client.js')(hostGetter, {}, httpClient);

  var server = require('restify').createServer(
    {
      name: 'test',
      key: fs.readFileSync('./test/resources/private.pem'),
      cert: fs.readFileSync('./test/resources/cert.pem')
    }
  );
  var handler = null;

  before(function(done){
    var theFn = function (req, res, next) {
      handler(req, res, next);
    };
    server.get('/*', theFn);
    server.post('/*', theFn);
    server.put('/*', theFn);
    server.del('/*', theFn);
    server.on('uncaughtException', function(req, res, route, err){
      throw err;
    });
    server.listen(port, function(err){
      console.log('Test server listening on port', port);
      done();
    });
  });

  after(function(){
    server.close();
  });

  beforeEach(function(){
    handler = null;
  });

  it('should get whatever collection I ask for', function(done){
    var retVal = { something: 1 };
    handler = function(req, res, next) {
      expect(req.path()).equals('/userId/aCollection');
      expect(req.method).equals('GET');
      expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
      res.send(200, retVal);
      next();
    };
    console.log('test!');
    client.getCollection('userId', 'aCollection', '1234', function(err, res){
      console.log('yay!');
      expect(err).to.not.exist;
      expect(res).deep.equals(retVal);
      done();
    });
  });

  it('should get profile on getProfile', function(done){
    var retVal = { something: 1 };
    handler = function(req, res, next) {
      expect(req.path()).equals('/userId/profile');
      expect(req.method).equals('GET');
      expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
      res.send(200, retVal);
      next();
    };
    client.getProfile('userId', '1234', function(err, res){
      expect(err).to.not.exist;
      expect(res).deep.equals(retVal);
      done();
    });
  });

  it('should return null on 404 from getProfile', function(done){
    handler = function(req, res, next) {
      expect(req.path()).equals('/userId/profile');
      expect(req.method).equals('GET');
      expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
      res.send(404);
      next();
    };
    client.getProfile('userId', '1234', function(err, res){
      expect(err).to.not.exist;
      expect(res).to.not.exist;
      done();
    });
  });

  it('should get groups on getGroups', function(done){
    var retVal = { something: 1 };
    handler = function(req, res, next) {
      expect(req.path()).equals('/userId/groups');
      expect(req.method).equals('GET');
      expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
      res.send(200, retVal);
      next();
    };
    client.getGroups('userId', '1234', function(err, res){
      expect(err).to.not.exist;
      expect(res).deep.equals(retVal);
      done();
    });
  });

  it('should get private on getPrivatePair', function(done){
    var retVal = { something: 1 };
    handler = function(req, res, next) {
      expect(req.path()).equals('/userId/private/hashName');
      expect(req.method).equals('GET');
      expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
      res.send(200, retVal);
      next();
    };
    client.getPrivatePair('userId', 'hashName', '1234', function(err, res){
      expect(err).to.not.exist;
      expect(res).deep.equals(retVal);
      done();
    });
  });

  it('should return null if 404 on getPrivatePair', function(done){
    handler = function(req, res, next) {
      expect(req.path()).equals('/userId/private/hashName');
      expect(req.method).equals('GET');
      expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
      res.send(404);
      next();
    };
    client.getPrivatePair('userId', 'hashName', '1234', function(err, res){
      expect(err).to.not.exist;
      expect(res).to.not.exist;
      done();
    });
  });
});