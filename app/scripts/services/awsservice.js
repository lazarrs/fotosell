'use strict';

/**
 * @ngdoc service
 * @name fotosellApp.AWSService
 * @description
 * # AWSService
 * Provider in the fotosellApp.
 */

/*global AWS */

angular.module('fotosellApp.services', [])
  .provider('AWSService', function() {
    var self = this;

    // Set defaults
    AWS.config.region = 'eu-west-1';

    self.arn = null;
    
    self.setArn = function(arn) {
      if (arn) { self.arn = arn; }
    };

    self.setRegion = function(region) {
      if (region) { AWS.config.region = region; }
    };
    
    self.$get = function($q, $cacheFactory) {
      var dynamoCache = $cacheFactory('dynamo'),
      s3Cache = $cacheFactory('s3Cache'),
      credentialsDefer = $q.defer(),
      credentialsPromise = credentialsDefer.promise;

      return {
	credentials: function() {
	  return credentialsPromise;
	},
	setToken: function(token, providerId) {
	  var config = {
	    RoleArn: self.arn,
	    WebIdentityToken: token,
	    RoleSessionName: 'web-id'
	  };
	  if (providerId) {
	    config.ProviderId = providerId;
	  }
	  self.config = config;
	  AWS.config.credentials = new AWS.WebIdentityCredentials(config);
	  credentialsDefer.resolve(AWS.config.credentials);
	},
	s3: function(params) {
	  var d = $q.defer();
	  credentialsPromise.then(function() {
	    var s3Obj = s3Cache.get(JSON.stringify(params));
	    if (!s3Obj) {
	      s3Obj = new AWS.S3(params);
	      s3Cache.put(JSON.stringify(params), s3Obj);
	    }
	    d.resolve(s3Obj);
	  });
	  return d.promise;
	},
	dynamo: function(params) {
	  var d = $q.defer();
	  credentialsPromise.then(function() {
	    var table = dynamoCache.get(JSON.stringify(params));
	    if (!table) {
	      table = new AWS.DynamoDB(params);
	      dynamoCache.put(JSON.stringify(params), table);
	    }
	    d.resolve(table);
	  });
	  return d.promise;
	}
      };
    };
  });
