// SUT
import ZoomMouseWheelTool from './ZoomMouseWheelTool.js';

// Setup
import external from './../externalModules.js';

jest.mock('./../externalModules.js');

describe('tools/ZoomMouseWheelTool.js', () => {
  describe('configuration', () => {
    // TODO: Updates min/max/invert when provided in configuration
  });

  describe('mouseWheelCallback', () => {
    it('has a mouseWheelCallback', () => {
      // SUT
      const tool = new ZoomMouseWheelTool();

      // Assert
      expect(tool.mouseWheelCallback).not.toEqual(undefined);
    });

    // Should these live on, and only on, a `changeViewportScale` test?
    // TODO: Cannot scale lower than minScale
    // TODO: Cannot scale larger than maxScale
    // TODO: Inverts scale when invert is true
    // TODO: the viewport to zoom out when the event's spinY is negative
    // TODO: the viewport to zoom in when the event's spinY is positive

    it('sets an updated viewport', () => {
      // Setup
      const tool = new ZoomMouseWheelTool();
      const fakeEvent = {
        detail: {
          element: '',
          viewport: {
            scale: 1,
          },
          spinY: -1,
        },
      };

      // SUT
      tool.mouseWheelCallback(fakeEvent);

      // Assert
      expect(external.cornerstone.setViewport).toHaveBeenCalled();
    });
  });
});
