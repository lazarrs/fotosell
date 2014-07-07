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

      var reader = new FileReader();

      reader.onload = function(e) {
	$scope.$apply(function() {
	  $scope.uploaded_image = files[0];
	  $scope.uploaded_image.src = e.target.result;
	});
      }
      reader.readAsDataURL(files[0]);
      return;

    };

    $scope.uploadImage = function(file) {
      UserService.uploadItemForSale(file)
	.then(function(data) {
	  $scope.uploaded_image = null;
	  // Refresh the current items for sale
	  getItemsForSale();
	});      
    }
    
    $scope.signedIn = function(oauth) {
      UserService.setCurrentUser(oauth)
	.then(function(user) {
	  $scope.user = user;
	});
    };
  });
