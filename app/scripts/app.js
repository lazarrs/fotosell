'use strict';

/**
 * @ngdoc overview
 * @name fotosellApp
 * @description
 * # fotosellApp
 *
 * Main module of the application.
 */
angular
  .module('fotosellApp', [
    'ngRoute',
    'ngTouch',
    'fotosellApp.services'
  ])
  .config(function(AWSServiceProvider) {
    AWSServiceProvider.setArn('arn:aws:iam::115360261513:role/google-web-role');
  })
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

/*global gapi */

window.onLoadCallback = function() {
  angular.element(document).ready(function() {
    // bootstrap the oauth2 library
    gapi.client.load('oauth2', 'v2', function() {
      // finally, bootstrap our angular app
      angular.bootstrap(document, ['fotosellApp']);
    });
  });
};
