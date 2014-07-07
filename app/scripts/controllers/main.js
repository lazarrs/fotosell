'use strict';

/**
 * @ngdoc function
 * @name fotosellApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the fotosellApp
 */
angular.module('fotosellApp')
  .controller('MainCtrl', function ($scope, UserService) {

    var getItemsForSale = function() {
      UserService.itemsForSale()
      .then(function(images) {
	$scope.images = images;
      });
    };
    // Load the user's list initialy
    getItemsForSale();

    $scope.delete = function(image) {
      UserService.deleteImage(image)
      .then(function(data) {
	// Refresh the current items for sale
	getItemsForSale();	
      });
    }
    
    $scope.onFile = function(files) {
      UserService.uploadItemForSale(files)
      .then(function(data) {
	// Refresh the current items for sale
	getItemsForSale();
	});
    };
    $scope.signedIn = function(oauth) {
      UserService.setCurrentUser(oauth)
	.then(function(user) {
	  $scope.user = user;
	});
    };
  });
