import FreehandScissorsTool from './FreehandScissorsTool';
import store from '../../store';
import mixins from '../../mixins';
import mockEvt from '../../util/__mocks__/segmentationEvent.mock';

jest.mock('./../../externalModules.js');

jest.mock('../../mixins', () => ({
  ...jest.requireActual('../../mixins').default,
}));

jest.mock('../../store', () => ({
  ...jest.requireActual('../../store'),
}));

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
});
