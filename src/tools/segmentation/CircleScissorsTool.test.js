import CircleScissorsTool from './CircleScissorsTool';
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

describe('CircleScissorsTool.js', () => {
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
});
