import CorrectionScissorsTool from './CorrectionScissorsTool';
import { fill } from '../../util/segmentation/operations';
import store from '../../store';
import mixins from '../../mixins';
import mockEvt from '../../util/__mocks__/segmentationEvent.mock';

jest.mock('./../../externalModules.js');

jest.mock('../../mixins', () => ({
  ...(jest.requireActual('../../mixins')).default,
}));

jest.mock('../../util/segmentation/operations', () => ({
  fill: jest.fn(),
}));

jest.mock('../../store', () => {{
  return {
    ...(jest.requireActual('../../store')),
  };
}});

// Spies for Mixins
let _startOutliningRegion_Spy;
let _setHandlesAndUpdate_Spy;
let _applyStrategy_Spy;

function setMocksAndSpies(store) {
  // Brush Module Spies
  store.modules.brush.getters.getAndCacheLabelmap2D = jest.fn(() => (
    {
      labelmap3D: {
        labelmaps2D: [
          {
            invalidated: false,
            pixelData: []
          }
        ],
      },
      currentImageIdIndex: 0,
    }
  ));

  store.modules.brush.getters.brushColor = jest.fn();

  // Spies for Mixins
  _startOutliningRegion_Spy = jest.spyOn(mixins.freehandSegmentationMixin, '_startOutliningRegion');
  _setHandlesAndUpdate_Spy = jest.spyOn(mixins.freehandSegmentationMixin, '_setHandlesAndUpdate');
  _applyStrategy_Spy = jest.spyOn(mixins.freehandSegmentationMixin, '_applyStrategy');
}

function restoreMocksAndSpies(store) {
  // Brush Module Spies
  store.modules.brush.getters.getAndCacheLabelmap2D.mockRestore();
  store.modules.brush.getters.brushColor.mockRestore();

  // Spies for Mixins
  _startOutliningRegion_Spy.mockRestore();
  _setHandlesAndUpdate_Spy.mockRestore();
  _applyStrategy_Spy.mockRestore();
  fill.mockRestore();
}

describe('CorrectionScissorsTool.js', () => {

  beforeEach(() => {
    setMocksAndSpies(store);
  });

  afterEach(() => {
    restoreMocksAndSpies(store);
  });

  describe('Initialization', () => {
    it('Instantiate CorrectionScissorsTool Correctly', () => {
      const defaultName = 'CorrectionScissors';
      const instantiatedTool = new CorrectionScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new CorrectionScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('Events and Callbacks', () => {
    let instantiatedTool;

    beforeEach(() => {
      instantiatedTool = new CorrectionScissorsTool();
    });

    describe('Touch Events setup', () => {
      it('Calls right method on touchDragCallback ', () => {
        instantiatedTool.touchDragCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._setHandlesAndUpdate).toHaveBeenCalled();
      });

      it('Calls right method on postTouchStartCallback ', () => {
        instantiatedTool.postTouchStartCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._startOutliningRegion).toHaveBeenCalled();
      });

      it('Calls right method on touchEndCallback ', () => {
        instantiatedTool.touchEndCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._applyStrategy).toHaveBeenCalled();
      });
    });

    describe('Mouse Events setup', () => {
      it('Calls right method on postMouseDownCallback ', () => {
        instantiatedTool.postMouseDownCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._startOutliningRegion).toHaveBeenCalled();
      });

      it('Calls right method on mouseClickCallback ', () => {
        instantiatedTool.mouseClickCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._startOutliningRegion).toHaveBeenCalled();
      });

      it('Calls right method on mouseDragCallback ', () => {
        instantiatedTool.mouseDragCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._setHandlesAndUpdate).toHaveBeenCalled();
      });

      it('Calls right method on mouseMoveCallback ', () => {
        instantiatedTool.mouseMoveCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._setHandlesAndUpdate).toHaveBeenCalled();
      });

      it('Calls right method on mouseUpCallback ', () => {
        instantiatedTool.mouseUpCallback(mockEvt);
        expect(mixins.freehandSegmentationMixin._applyStrategy).toHaveBeenCalled();
      });
    });

    describe('Strategies set up', () => {
      it('Calls right default strategy callback', () => {
        instantiatedTool.mouseUpCallback(mockEvt);
        expect(fill).toHaveBeenCalledWith(
          'Correction',
          'default',
          mockEvt
        );
      });
    });

  });
});
