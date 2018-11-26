// SUT
import setShadow from './setShadow.js';

describe('drawing/setShadow.js', () => {
  beforeEach(() => {});

  it("does not set context's shadow options if options are undefined", () => {
    const context = {};
    const options = undefined;

    setShadow(context, options);

    expect(context.shadowColor).toEqual(undefined);
  });

  it("does not set context's shadow options if options.shadow is false", () => {
    const context = {};
    const options = { shadow: false };

    setShadow(context, options);

    expect(context.shadowColor).toEqual(undefined);
  });

  it('sets default shadow values when options.shadow is true, but no other shadow options are provided', () => {
    const context = {};
    const options = { shadow: true };

    setShadow(context, options);

    const expectedContext = {
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
    };

    expect(expectedContext).toEqual(context);
  });

  it('sets passed in shadow options for the provided context', () => {
    const context = {};
    const options = {
      shadow: true,
      shadowColor: 'red',
      shadowBlur: 100,
      shadowOffsetX: 0,
      shadowOffsetY: 1000,
    };

    setShadow(context, options);

    const expectedContext = {
      shadowColor: 'red',
      shadowBlur: 100,
      shadowOffsetX: 0,
      shadowOffsetY: 1000,
    };

    expect(expectedContext).toEqual(context);
  });
});
