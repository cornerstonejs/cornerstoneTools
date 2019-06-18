import FreehandScissorsTool from './FreehandScissorsTool';

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    updateImage: () => {},
  },
}));

const mockEvt = {
  detail: {
    element: {},
    currentPoints: {
      image: {
        x: 1,
        y: 1,
      },
    },
  },
};

describe('FreehandScissorsTool.js', () => {
  describe('Initialization', () => {
    it('Instantiate FreehandScissorsTool Correctly', () => {
      const defaultName = 'FreehandScissors';
      const instantiatedTool = new FreehandScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new FreehandScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('Events and Callbacks', () => {
    let instantiatedTool;

    beforeEach(() => {
      instantiatedTool = new FreehandScissorsTool();
    });

    it('Calls right method on postMouseDownCallback ', () => {
      const _startOutliningRegion = jest.spyOn(
        instantiatedTool,
        '_startOutliningRegion'
      );

      instantiatedTool.postMouseDownCallback(mockEvt);

      setTimeout(() => {
        expect(_startOutliningRegion).toHaveBeenCalled();
      }, 2);
    });
  });
});
