'use strict';

/**
 * @ngdoc directive
 * @name fotosellApp.directive:fileUpload
 * @description
 * # fileUpload
 */
angular.module('fotosellApp')
  .directive('fileUpload', function () {
    return {
      scope: { fileUpload: '&' },
      template: '<input type="file" id="file" />',
      replace: true,
      restrict: 'A',
      link: function postLink(scope, ele, attrs) {
	ele.bind('change', function() {
	  var file = ele[0].files;
	  if (file) {
	    scope.fileUpload({files: file});
	  }
	});	
      }
    };
  });
