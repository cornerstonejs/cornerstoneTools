jest.mock('./../../externalModules.js');
jest.mock('./../../stateManagement/toolState', () => ({
  __esModule: true,
  getToolState: jest.fn(),
}));
jest.mock('../../drawing/drawLinkedTextBox', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../drawing/drawLine', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../drawing/getNewContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../util/getPixelSpacing', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import { getToolState as getToolStateMocked } from '../../stateManagement/toolState';
import drawLinkedTextBoxMocked from '../../drawing/drawLinkedTextBox';
import drawLinkedMocked from '../../drawing/drawLine';
import getNewContextMocked from '../../drawing/getNewContext.js';
import getPixelSpacingMocked from '../../util/getPixelSpacing';

// eslint-disable-next-line import/first
import Tool from './BidirectionalTool';

describe('Bidirectional.js', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderToolData', () => {
    beforeAll(() => {
      getNewContextMocked.mockReturnValue({
        save: jest.fn(),
        restore: jest.fn(),
      });

      getPixelSpacingMocked.mockReturnValue({
        rowPixelSpacing: 1,
        colPixelSpacing: 1,
      });
    });
    describe('tool color', () => {
      const defaulColor = 'white';
      const activeColor = 'greenyellow';
      const mockEvent = {
        detail: {
          element: {},
          canvasContext: {
            canvas: {},
          },
          image: {},
        },
      };
      const instantiatedTool = new Tool('Bidirectional');

      const toolState = {
        data: [
          {
            visible: true,
            active: false,
            handles: {
              start: {
                x: 0,
                y: 10,
              },
              end: {
                x: 10,
                y: 10,
              },
              perpendicularStart: {
                x: 5,
                y: 0,
              },
              perpendicularEnd: {
                x: 5,
                y: 20,
              },
              textBox: {}, // Not used
            },
          },
        ],
      };
      const expectDrawWithColor = color => {
        expect(drawLinkedMocked).toBeCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          { color }
        );
        expect(drawLinkedTextBoxMocked).toBeCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          color,
          expect.anything(),
          expect.anything(),
          expect.anything()
        );
      };

      it('should be the default color when there is no color set', () => {
        toolState.data[0].active = false;
        getToolStateMocked.mockReturnValue(toolState);

        instantiatedTool.renderToolData(mockEvent);

        expectDrawWithColor(defaulColor);
      });

      it('should be the active color when there is no color set', () => {
        toolState.data[0].active = true;
        getToolStateMocked.mockReturnValue(toolState);

        instantiatedTool.renderToolData(mockEvent);

        expectDrawWithColor(activeColor);
      });

      describe('should be data color set when there is property color defined on data', () => {
        it.each([[true], [false]])(
          'and tool active property value is %b',
          activePropertyValue => {
            toolState.data[0].active = activePropertyValue;
            toolState.data[0].color = 'red';
            getToolStateMocked.mockReturnValueOnce(toolState);

            instantiatedTool.renderToolData(mockEvent);
            expectDrawWithColor(toolState.data[0].color);
          }
        );
      });
    });
  });
});
