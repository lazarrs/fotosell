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
      UserService.currentUser()
	.then(function(user) {
	  $scope.user = user;
	  UserService.itemsForSale()
	    .then(function(images) {
	      $scope.images = images;
	    });
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
      var image = new Image();

      reader.onload = function(e) {
	image.src = e.target.result;
	image.onload = function() {
	  var canvas = document.createElement('canvas');
	  var maxWidth = 800; // @todo make it configurable somehow
	  
	  if (image.width > maxWidth) {
	    // resize needed
	    canvas.width = maxWidth;
	    canvas.height = image.height / image.width * maxWidth;
	  } else {
	    canvas.width = image.width;
	    canvas.height = image.height;
	  }
	  var ctx = canvas.getContext("2d");
	  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	  var dataUrl = canvas.toDataURL("image/jpeg");
	  
	  $scope.$apply(function() {
	    $scope.uploadedImage = image;
	    $scope.uploaded_image = files[0];
	    $scope.uploaded_image.src = dataUrl;
	  });
	};
      }
      reader.readAsDataURL(files[0]);

    };

    $scope.getImageUrl = function(itemId) {
      return 'http://s3-eu-west-1.amazonaws.com/fotosell/'+
	$scope.user.id+'/'+encodeURIComponent(itemId);
    };
    
    function dataURItoBlob(dataURI) {
      var byteString, 
      mimestring 
      
      if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
        byteString = atob(dataURI.split(',')[1])
      } else {
        byteString = decodeURI(dataURI.split(',')[1])
      }
      
      mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0]
      
      var content = new Array();
      for (var i = 0; i < byteString.length; i++) {
        content[i] = byteString.charCodeAt(i)
      }
      
      return new Blob([new Uint8Array(content)], {type: mimestring});
    }

    $scope.uploadImage = function(file) {
      
      UserService.uploadItemForSale(file, dataURItoBlob($scope.uploaded_image.src))
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
