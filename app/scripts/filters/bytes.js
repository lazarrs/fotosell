'use strict';

/**
 * @ngdoc filter
 * @name fotosellApp.filter:bytes
 * @function
 * @description
 * # bytes
 * Filter in the fotosellApp.
 */
angular.module('fotosellApp')
  .filter('bytes', function () {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
      if (typeof precision === 'undefined') precision = 1;
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
  });
