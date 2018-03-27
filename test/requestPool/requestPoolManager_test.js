import { expect } from 'chai';
import requestPoolManager from '../../src/requestPool/requestPoolManager.js';

describe('clearRequestStack with an invalid type', function () {
  beforeEach(() => {
  });

  it('should throw an error when attempting to clear the request stack with an invalid type', function () {
    const nonExistantType = 'NotAnExistingType';
    expect(() => requestPoolManager.clearRequestStack(nonExistantType)).to.throw(Error, `Request type ${nonExistantType} is not defined`);
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

describe('putRequestPoolType', function () {
  beforeEach(() => {
  });

  it('should correctly put and modify requestPool types', function () {
    requestPoolManager.initDefaultRequestPoolTypes();
    
    const requestPoolTypes = requestPoolManager.getRequestPoolTypes();
    
    expect(requestPoolTypes[0].name).to.equal('interaction');
    expect(requestPoolTypes[1].name).to.equal('thumbnail');
    expect(requestPoolTypes[2].name).to.equal('prefetch');
    
    requestPoolManager.putRequestPoolType('thumbnail', 5, 0);
    requestPoolManager.putRequestPoolType('autoPrefetch', 0, function () {
      const maxSimultaneousRequests = cornerstoneTools.getMaxSimultaneousRequests();

      return Math.max(maxSimultaneousRequests -1, 1);
    });
    requestPoolManager.putRequestPoolType('wadoRsSerie', 40, function () {
      const maxSimultaneousRequests = cornerstoneTools.getMaxSimultaneousRequests();

      return Math.max(maxSimultaneousRequests -1, 1);
    });
    requestPoolManager.putRequestPoolType('wadoRsSerie', 40, 2);
    
    expect(requestPoolTypes[0].name).to.equal('wadoRsSerie');
    expect(requestPoolTypes[0].maxRequests).to.equal(2);
    expect(requestPoolTypes[1].name).to.equal('interaction');
    expect(requestPoolTypes[2].name).to.equal('prefetch');
    expect(requestPoolTypes[3].name).to.equal('thumbnail');
    expect(requestPoolTypes[3].maxRequests).to.equal(0);
    expect(requestPoolTypes[4].name).to.equal('autoPrefetch');
    
    expect(function () {
      requestPoolManager.putRequestPoolType('wadoRsSerie', 5, 2);
    }).to.throw('Can\'t give priority 5 to requestPool type wadoRsSerie, because type thumbnail already has this priority');
  });
});
