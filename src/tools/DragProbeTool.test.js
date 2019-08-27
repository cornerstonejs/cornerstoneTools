import DragProbeTool from './DragProbeTool.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    updateImage: jest.fn(),
  },
}));

const mockEventRender = {
  detail: {
    element: {},
  },
};
const mockEventDrag = {
  detail: {
    element: {},
    currentPoints: {
      x: 100,
      y: 123,
    },
  },
};

describe('DragProbeTool.js', () => {
  describe('default values', () => {
    it('has a default name of "DragProbe"', () => {
      const defaultName = 'DragProbe';
      const instantiatedTool = new DragProbeTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new DragProbeTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('_movingEventCallback', () => {
    it('should set dragEventData and update image', () => {
      const instantiatedTool = new DragProbeTool();

      external.cornerstone.updateImage = jest.fn();
      instantiatedTool._movingEventCallback(mockEventDrag);

      expect(instantiatedTool.dragEventData).toEqual(mockEventDrag.detail);
      expect(external.cornerstone.updateImage).toHaveBeenCalled();
    });
  });

  describe('_endMovingEventCallback', () => {
    it('should set dragEventData and update image', () => {
      const instantiatedTool = new DragProbeTool();

      external.cornerstone.updateImage = jest.fn();
      instantiatedTool._endMovingEventCallback(mockEventDrag);

      expect(instantiatedTool.dragEventData).toEqual({});
      expect(external.cornerstone.updateImage).toHaveBeenCalled();
    });
  });

  describe('renderToolData', () => {
    it('should apply strategy if currentPoint are stored', function() {
      const instantiatedTool = new DragProbeTool();

      instantiatedTool.applyActiveStrategy = jest.fn();
      instantiatedTool.dragEventData.currentPoints = {
        x: 0,
        y: 1,
      };

      instantiatedTool.renderToolData(mockEventRender);
      expect(instantiatedTool.applyActiveStrategy).toHaveBeenCalled();
    });
  });
});
