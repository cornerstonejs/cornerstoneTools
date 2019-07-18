import CircleScissorsTool from './CircleScissorsTool';
import { fill } from '../../util/segmentation/operations';
import store from '../../store';
import mixins from '../../mixins';
import mockEvt from '../../util/__mocks__/segmentationEvent.mock';

jest.mock('./../../externalModules.js');

jest.mock('../../mixins', () => ({
  ...jest.requireActual('../../mixins').default,
}));

jest.mock('../../util/segmentation/operations', () => ({
  fill: jest.fn(),
}));

jest.mock('../../store', () => ({
  ...jest.requireActual('../../store'),
}));

// Spies for Mixins
let startOutliningRegionSpy;
let setHandlesAndUpdateSpy;
let applyStrategySpy;

function setMocksAndSpies(store) {
  // Brush Module Spies
  store.modules.brush.getters.getAndCacheLabelmap2D = jest.fn(() => ({
    labelmap3D: {
      labelmaps2D: [
        {
          invalidated: false,
          pixelData: [],
        },
      ],
    },
    currentImageIdIndex: 0,
  }));

  store.modules.brush.getters.brushColor = jest.fn();

  // Spies for Mixins
  startOutliningRegionSpy = jest.spyOn(
    mixins.circleSegmentationMixin,
    '_startOutliningRegion'
  );
  setHandlesAndUpdateSpy = jest.spyOn(
    mixins.circleSegmentationMixin,
    '_setHandlesAndUpdate'
  );
  applyStrategySpy = jest.spyOn(
    mixins.circleSegmentationMixin,
    '_applyStrategy'
  );
}

function restoreMocksAndSpies(store) {
  // Brush Module Spies
  store.modules.brush.getters.getAndCacheLabelmap2D.mockRestore();
  store.modules.brush.getters.brushColor.mockRestore();

  // Spies for Mixins
  startOutliningRegionSpy.mockRestore();
  setHandlesAndUpdateSpy.mockRestore();
  applyStrategySpy.mockRestore();
  fill.mockRestore();
}

describe('CircleScissorsTool.js', () => {
  beforeEach(() => {
    setMocksAndSpies(store);
  });

  afterEach(() => {
    restoreMocksAndSpies(store);
  });

  describe('Initialization', () => {
    it('Instantiate CircleScissorsTool Correctly', () => {
      const defaultName = 'CircleScissors';
      const instantiatedTool = new CircleScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new CircleScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('Events and Callbacks', () => {
    let instantiatedTool;

    beforeEach(() => {
      instantiatedTool = new CircleScissorsTool();
    });

    describe('Touch Events setup', () => {
      it('Calls right method on touchDragCallback ', () => {
        instantiatedTool.touchDragCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._setHandlesAndUpdate
        ).toHaveBeenCalled();
      });

      it('Calls right method on postTouchStartCallback ', () => {
        instantiatedTool.postTouchStartCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._startOutliningRegion
        ).toHaveBeenCalled();
      });

      it('Calls right method on touchEndCallback ', () => {
        instantiatedTool.touchEndCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._applyStrategy
        ).toHaveBeenCalled();
      });
    });

    describe('Mouse Events setup', () => {
      it('Calls right method on postMouseDownCallback ', () => {
        instantiatedTool.postMouseDownCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._startOutliningRegion
        ).toHaveBeenCalled();
      });

      it('Calls right method on mouseClickCallback ', () => {
        instantiatedTool.mouseClickCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._startOutliningRegion
        ).toHaveBeenCalled();
      });

      it('Calls right method on mouseDragCallback ', () => {
        instantiatedTool.mouseDragCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._setHandlesAndUpdate
        ).toHaveBeenCalled();
      });

      it('Calls right method on mouseMoveCallback ', () => {
        instantiatedTool.mouseMoveCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._setHandlesAndUpdate
        ).toHaveBeenCalled();
      });

      it('Calls right method on mouseUpCallback ', () => {
        instantiatedTool.mouseUpCallback(mockEvt);
        expect(
          mixins.circleSegmentationMixin._applyStrategy
        ).toHaveBeenCalled();
      });
    });

    describe('Strategies set up', () => {
      it('Calls right default strategy callback', () => {
        instantiatedTool.mouseUpCallback(mockEvt);

        expect(fill).toHaveBeenCalledWith('Circle', 'FILL_INSIDE', mockEvt);
      });

      it('FILL_INSIDE', () => {
        instantiatedTool.changeStrategy('FILL_INSIDE');
        instantiatedTool.mouseUpCallback(mockEvt);

        expect(fill).toHaveBeenCalledWith('Circle', 'FILL_INSIDE', mockEvt);
      });

      it('ERASE_INSIDE', () => {
        instantiatedTool.changeStrategy('ERASE_INSIDE');
        instantiatedTool.mouseUpCallback(mockEvt);

        expect(fill).toHaveBeenCalledWith('Circle', 'ERASE_INSIDE', mockEvt);
      });

      it('FILL_OUTSIDE', () => {
        instantiatedTool.changeStrategy('FILL_OUTSIDE');
        instantiatedTool.mouseUpCallback(mockEvt);

        expect(fill).toHaveBeenCalledWith('Circle', 'FILL_OUTSIDE', mockEvt);
      });

      it('ERASE_OUTSIDE', () => {
        instantiatedTool.changeStrategy('ERASE_OUTSIDE');
        instantiatedTool.mouseUpCallback(mockEvt);

        expect(fill).toHaveBeenCalledWith('Circle', 'ERASE_OUTSIDE', mockEvt);
      });
    });
  });
});
