import * as toolOptions from './toolOptions.js';

/**
 * Mirrors the API of toolOptions, but stores the options in an inefficient yet
 * simple way. Mirrored calls modify the model's internal state, make the
 * corresponding call to toolOptions, and then ensures that the model's internal
 * state matches the global toolOptions state at every toolName and element.
 */
class ToolOptionsModel {
  constructor() {
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

  toolNameValue(i) {
    return `toolName${i}`;
  }

  ixOf(toolName, element) {
    return toolName * 10 + element;
  }

  check() {
    for (let toolName = 0; toolName < 10; toolName++) {
      for (let element = 0; element < 10; element++) {
        expect(this.options[this.ixOf(toolName, element)]).toEqual(
          toolOptions.getToolOptions(
            this.toolNameValue(toolName),
            this.elements[element]
          )
        );
      }
    }
  }

  getToolOptions(toolName, element) {
    const ret = this.options[this.ixOf(toolName, element)];

    expect(ret).toEqual(
      toolOptions.getToolOptions(
        this.toolNameValue(toolName),
        this.elements[element]
      )
    );
    this.check();

    return ret;
  }

  setToolOptions(toolName, element, options) {
    toolOptions.setToolOptions(
      this.toolNameValue(toolName),
      this.elements[element],
      options
    );
    this.options[this.ixOf(toolName, element)] = options;
    this.check();
  }

  clearToolOptions(toolName, element) {
    toolOptions.clearToolOptions(
      this.toolNameValue(toolName),
      this.elements[element]
    );
    this.options[this.ixOf(toolName, element)] = {};
    this.check();
  }

  clearToolOptionsByToolName(toolName) {
    toolOptions.clearToolOptionsByToolName(this.toolNameValue(toolName));
    for (let element = 0; element < 10; element++) {
      this.options[this.ixOf(toolName, element)] = {};
    }
    this.check();
  }

  clearToolOptionsByElement(element) {
    toolOptions.clearToolOptionsByElement(this.elements[element]);
    for (let toolName = 0; toolName < 10; toolName++) {
      this.options[this.ixOf(toolName, element)] = {};
    }
    this.check();
  }
}

describe('toolOptions manipulation', function() {
  let model;

  beforeEach(function() {
    model = new ToolOptionsModel();
  });

  it('has expected effects', function() {
    model.setToolOptions(1, 2, { foo: 'bar' });
    model.setToolOptions(1, 4, { foo: 'baz' });
    model.setToolOptions(1, 6, { foo: 'quux' });
    model.setToolOptions(4, 1, {
      a: 'b',
      w: 'x',
    });
    model.setToolOptions(4, 2, {
      b: 'c',
      x: 'y',
    });
    model.setToolOptions(4, 4, {
      c: 'd',
      y: 'z',
    });
    model.setToolOptions(5, 5, { bar: 'foo' });
    model.setToolOptions(1, 2, { foo: 'quux' });
    const options = model.getToolOptions(1, 2);

    options.abc = 'xyz';
    model.setToolOptions(1, 2, options);
    expect(model.getToolOptions(1, 2).abc).toEqual('xyz');
    model.clearToolOptions(1, 2);
    expect(model.getToolOptions(1, 2)).toEqual({});
    model.clearToolOptionsByElement(2);
    model.clearToolOptionsByToolName(1);
    model.getToolOptions(1, 6);
    model.clearToolOptionsByToolName(4);
    model.getToolOptions(4, 4);
  });
});
