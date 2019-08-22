import CorrectionScissorsTool from './CorrectionScissorsTool';
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

describe('CorrectionScissorsTool.js', () => {
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
});
