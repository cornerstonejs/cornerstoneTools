import toolStyle from './toolStyle.js';

const globalLineWidth = 10;
toolStyle.setToolWidth(globalLineWidth);

describe('getToolWidth', () => {
  describe('without data', () => {
    it('returns defaultWidth from toolStyle', () => {
      expect(toolStyle.getToolWidth()).toBe(globalLineWidth);
    });
  });

  describe('with data', () => {
    it('returns lineWidth from data', () => {
      const data = {
        lineWidth: 20,
      };

      expect(toolStyle.getToolWidth(data)).toBe(data.lineWidth);
    });
  });
});
