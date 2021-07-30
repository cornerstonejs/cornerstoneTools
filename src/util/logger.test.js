import { getLogger } from './logger.js';

describe('ult/logger.js', () => {
  describe('getLogger', () => {
    it('creates a logger within the cornerstoneTools namespace', () => {
      const l = getLogger('test');

      expect(l.log.namespace).toBe('cornerstoneTools:test');
    });

    it('emits an error', () => {
      const spy = jest.spyOn(global.console, 'error');
      const l = getLogger('test');
      const message = 'Something broke';

      l.error(message);
      expect(spy).toBeCalledWith('Something broke');
    });
  });
});
