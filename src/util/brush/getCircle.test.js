import getCircle from './getCircle.js';

describe('getCircle.js', function() {
  beforeEach(() => {});

  it('returns an empty array when there are no rows or columns', () => {
    const brushRadius = 10;
    const rows = 0;
    const columns = 0;

    // SUT
    const actualCircle = getCircle(brushRadius, rows, columns);

    const emptyArray = [];

    expect(actualCircle).toEqual(emptyArray);
  });

  it('returns an array of all points when brush covers entire area', () => {
    const brushRadius = 10;
    const xAndY = 5;
    const rows = 10;
    const columns = 10;

    // SUT
    const actualCircle = getCircle(brushRadius, rows, columns, xAndY, xAndY);

    expect(actualCircle.length).toEqual(110);
  });
});
