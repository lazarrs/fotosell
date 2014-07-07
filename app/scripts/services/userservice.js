'use strict';

/**
 * @ngdoc service
 * @name fotosellApp.UserService
 * @description
 * # UserService
 * Factory in the fotosellApp.
 */

/*global gapi */

angular.module('fotosellApp.userservice', ['fotosellApp.awsservice'])
  .factory('UserService', function (AWSService, $q) {
    var service = {
      _user: null,
      UsersTable: 'Users',
      UserItemsTable: 'UsersItems',
      UserIdsItemsTable: 'UserIdsItems',
      Bucket: 'fotosell',
      setCurrentUser: function(u) {
	if (u && !u.error) {
	  AWSService.setToken(u.id_token);
	  return service.currentUser();
	} else {
	  var d = $q.defer();
	  d.reject(u.error);
	  return d.promise;
	}
      },
      
      currentUser: function() {
	var d = $q.defer();
	if (service._user) {
	  d.resolve(service._user);
	} else {
	  // After we've loaded the credentials
	  AWSService.credentials().then(function() {
	    gapi.client.oauth2.userinfo.get()
	      .execute(function(e) {
		var email = e.email;
		// Get the dynamo instance for the UsersTable
		AWSService.dynamo({
		  params: {TableName: service.UsersTable}
		}).then(function(table) {
		  // find the user by email
		  table.getItem({
		    Key: {'User email': {S: email}}
		  }, function(err, data) {
		    if (Object.keys(data).length == 0) {
		      // User didn't previously exist
		      // so create an entry
		      var itemsParams = {
			Item: {
			  'User email': {S: email},
			  data: { S: JSON.stringify(e) }
			}
		      };
		      table.putItem(itemsParams, function(err, data) {
			service._user = e;
			d.resolve(e);
		      });
		    } else {
		      // The user already exists
		      service._user = JSON.parse(data.Item.data.S);
		      d.resolve(service._user);
		    }
		  });
		});
	      });
	  });
	}
	return d.promise;
      },
      
      itemsForSale: function() {
	var d = $q.defer();
	service.currentUser().then(function(user) {
          AWSService.dynamo({
            params: {TableName: service.UserIdsItemsTable}
          }).then(function(table) {
	    
	    // the DynamoDB ACLs disallow queries to foreign user ids (LeadingKeys)
            table.query({	      
              TableName: service.UserIdsItemsTable,
              KeyConditions: {
	    	userId: {
                  "ComparisonOperator": "EQ",
                  "AttributeValueList": [
                    {S: user.id}
                  ]
	    	}
              }
	    }, function(err, data) {
	      
              var items = [];
              if (data) {
//		AWSService.s3({ params: { Bucket: service.Bucket }}).then(function(s3) {
		  angular.forEach(data.Items, function(item) {
//		    var itemId = item.ItemId.S;
//		    var newUrl = s3.getSignedUrl('getObject', { Key: itemId });
		    var item = JSON.parse(item.data.S);
//		    item.itemUrl = newUrl;
                    items.push(item);
//		  });
		  d.resolve(items);
		});
              } else {
		d.reject(err);
              }
            })
          });
	});
	return d.promise;
      },

      deleteImage: function(image) {
	var d = $q.defer();
	service.currentUser().then(function(user) {
          AWSService.s3({
            params: {
              Bucket: service.Bucket
            }
          }).then(function(s3) {
            var params = {
              Key: image.itemId,
            }	    
            s3.deleteObject(params, function(err, data) {
	      if (err) {
		console.log(err);
		d.reject(err);
		return;
	      }
	      
	      AWSService.dynamo({
                params: {TableName: service.UserIdsItemsTable}
	      }).then(function(table) {
                var deleteParams = {
                  Key: {
		    userId: {
		      S: user.id
		    },
		    itemId: {
		      S: image.itemId
		    }
		  }
                };
                table.deleteItem(deleteParams, function(err, data) {
		  // @todo: handle err
		  console.log(err);
                  d.resolve(data);
                });
	      }); // AWSService
	      
	    });
	  })
	});
	return d.promise;
      },
      
      uploadItemForSale: function(items) {
	var d = $q.defer();
	service.currentUser().then(function(user) {
          AWSService.s3({
            params: {
              Bucket: service.Bucket
            }
          }).then(function(s3) {
            var file = items[0]; // only one at a time
            var params = {
              Key: file.name,
              Body: file,
              ContentType: file.type
            }
	    
            s3.putObject(params, function(err, data) {
	      // make this object world readable

	      // s3.putObjectAcl({
	      // 	Bucket: service.Bucket,
	      // 	Key: items[0].name,
	      // 	ACL: 'public-read'
	      // }, function(err, data) {
	      // 	console.log(err);
	      // });
	      
              // Also, let's get a url
	      if (!err) {
		var params = {
		  Bucket: service.Bucket, 
		  Key: file.name, 
		  Expires: 24*3600*365 // 1 year
		};
		s3.getSignedUrl('getObject', params, function (err, url) {
		  // now we have a url

		  AWSService.dynamo({
                    params: {TableName: service.UserIdsItemsTable}
		  }).then(function(table) {
                    var itemParams = {
                      Item: {
			itemId: {S: file.name},
			userId: {S: user.id}, 
			data: {
			  S: JSON.stringify({
                            itemId: file.name,
                            itemSize: file.size,
                            itemUrl: url
			  })
			}
                      }
                    };
                    table.putItem(itemParams, function(err, data) {
                      d.resolve(data);
                    });
		  }); // AWSService
		  
		});
	      }
            });
          });
	});
	return d.promise;
      }
      
    };
    return service;
  });
