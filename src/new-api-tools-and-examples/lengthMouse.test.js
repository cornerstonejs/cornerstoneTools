import LengthMouse from './lengthMouse.js';

const badMouseEventData = 'hello world';
const goodMouseEventData = {
  currentPoints: {
    image: {
      x: 0,
      y: 0
    }
  }
};

describe('lengthMouse.js', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.error.mockClear();
  });

  describe('default values', () => {
    it('has a default name of "lengthMouse"', () => {
      const instantiatedTool = new LengthMouse();

      expect(instantiatedTool.name).toEqual('lengthMouse');
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new LengthMouse();

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(console.error).toHaveBeenCalled();
      expect(console.error.mock.calls[0][0]).toContain(
        'required eventData not supplieed to tool'
      );
    });

    // Todo: create a more formal definition of a tool measurement object
    it('returns a tool measurement object', () => {
      const instantiatedTool = new LengthMouse();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it('returns a measurement with a start and end handle at the eventData\'s x and y', () => {
      const instantiatedTool = new LengthMouse();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );
      const startHandle = {
        x: toolMeasurement.handles.start.x,
        y: toolMeasurement.handles.start.y
      };
      const endHandle = {
        x: toolMeasurement.handles.end.x,
        y: toolMeasurement.handles.end.y
      };

      expect(startHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(startHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(endHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(endHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new LengthMouse();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement.handles.textBox).toBe(typeof {});
    });
  });

  describe('pointNearTool', () => {});
});
