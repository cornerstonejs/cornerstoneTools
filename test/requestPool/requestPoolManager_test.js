import { expect } from 'chai';
import requestPoolManager from '../../src/requestPool/requestPoolManager.js';

describe('clearRequestStack with an invalid type', function () {
  beforeEach(() => {
  });

  it('should throw an error when attempting to clear the request stack with an invalid type', function () {
    const nonExistantType = 'NotAnExistingType';
    expect(() => requestPoolManager.clearRequestStack(nonExistantType)).to.throw(Error, 'Request type must be one of interaction, thumbnail, or prefetch');
  });
});

describe('addRequest', function () {
  beforeEach(() => {
  });

  it('should add the requests to the interaction stack, in the correct order', function () {
    requestPoolManager.addRequest({}, 'request1', 'interaction', false, function doneCallback() {}, function failCallback() {});
    requestPoolManager.addRequest({}, 'request2', 'interaction', false, function doneCallback() {}, function failCallback() {});
    requestPoolManager.addRequest({}, 'request3', 'interaction', false, function doneCallback() {}, function failCallback() {}, true);
    
    const interactionStack = requestPoolManager.getRequestPool()['interaction'];
    
    expect(interactionStack[0].imageId).to.equal('request3');
    expect(interactionStack[1].imageId).to.equal('request1');
    expect(interactionStack[2].imageId).to.equal('request2');
  });
});
