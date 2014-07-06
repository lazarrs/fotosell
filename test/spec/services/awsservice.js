'use strict';

describe('Service: AWSService', function () {

  // load the service's module
  beforeEach(module('fotosellApp'));

  // instantiate service
  var AWSService;
  beforeEach(inject(function (_AWSService_) {
    AWSService = _AWSService_;
  }));

  it('should do something', function () {
    expect(!!AWSService).toBe(true);
  });

});
