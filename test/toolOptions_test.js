import { expect } from 'chai';

import * as toolOptions from '../src/toolOptions';

/**
 * Mirrors the API of toolOptions, but stores the options in an inefficient yet
 * simple way. Mirrored calls modify the model's internal state, make the
 * corresponding call to toolOptions, and then ensures that the model's internal
 * state matches the global toolOptions state at every toolType and element.
 */
class toolOptionsModel {

  constructor () {
    this.options = [];
    this.elements = [];
    for (let i = 0; i < 100; i++) {
      this.options[i] = {};
    }
    for (let i = 0; i < 10; i++) {
      this.elements[i] = document.createElement('div');
    }
    this.check();
  }

  toolTypeName (i) {
    return 'toolType' + i;
  }

  ixOf (toolType, element) {
    return toolType*10 + element;
  }

  check () {
    for (let toolType = 0; toolType < 10; toolType++) {
      for (let element = 0; element < 10; element++) {
        expect(this.options[this.ixOf(toolType, element)]).to.deep.equal(
          toolOptions.getToolOptions(this.toolTypeName(toolType), this.elements[element])
        );
      }
    }
  }

  getToolOptions (toolType, element) {
    var ret = this.options[this.ixOf(toolType, element)];
    expect(ret).to.deep.equal(
      toolOptions.getToolOptions(this.toolTypeName(toolType), this.elements[element])
    );
    this.check();
    return ret;
  }

  setToolOptions (toolType, element, options) {
    toolOptions.setToolOptions(this.toolTypeName(toolType), this.elements[element], options);
    this.options[this.ixOf(toolType, element)] = options;
    this.check();
  }

  clearToolOptions (toolType, element) {
    toolOptions.clearToolOptions(this.toolTypeName(toolType), this.elements[element]);
    this.options[this.ixOf(toolType, element)] = {};
    this.check();
  }

  clearToolOptionsByToolType (toolType) {
    toolOptions.clearToolOptionsByToolType(this.toolTypeName(toolType));
    for (let element = 0; element < 10; element++) {
      this.options[this.ixOf(toolType, element)] = {};
    }
    this.check();
  }

  clearToolOptionsByElement (element) {
    toolOptions.clearToolOptionsByElement(this.elements[element]);
    for (let toolType = 0; toolType < 10; toolType++) {
      this.options[this.ixOf(toolType, element)] = {};
    }
    this.check();
  }

}

describe('toolOptions manipulation', function () {

  var model;

  beforeEach(function () {
    model = new toolOptionsModel();
  });

  it('has expected effects', function () {
    model.setToolOptions(1, 2, {foo: 'bar'});
    model.setToolOptions(1, 4, {foo: 'baz'});
    model.setToolOptions(1, 6, {foo: 'quux'});
    model.setToolOptions(4, 1, {a: 'b', w: 'x'});
    model.setToolOptions(4, 2, {b: 'c', x: 'y'});
    model.setToolOptions(4, 4, {c: 'd', y: 'z'});
    model.setToolOptions(5, 5, {bar: 'foo'});
    model.setToolOptions(1, 2, {foo: 'quux'});
    var options = model.getToolOptions(1, 2);
    options.abc = 'xyz';
    model.setToolOptions(1, 2, options);
    expect(model.getToolOptions(1, 2).abc).to.equal('xyz');
    model.clearToolOptions(1, 2);
    expect(model.getToolOptions(1, 2)).to.deep.equal({});
    model.clearToolOptionsByElement(2);
    model.clearToolOptionsByToolType(1);
    model.getToolOptions(1, 6);
    model.clearToolOptionsByToolType(4);
    model.getToolOptions(4, 4);
  });

});
