/* eslint-disable no-unused-expressions */
import { expect } from 'chai';

import * as cornerstoneTools from '../src/index';

describe('A test that pulls in all modules', function () {
  it('pulls in all modules', function () {
    expect(cornerstoneTools).to.exist;
  });
});
