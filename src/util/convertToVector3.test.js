import convertToVector3 from './convertToVector3.js';
import external from '../externalModules.js';

jest.mock('../externalModules.js', () => {
  const cornerstoneMath = require('cornerstone-math');

  return {
    cornerstoneMath: {
      Vector3: cornerstoneMath.Vector3,
    },
  };
});

describe('util/convertToVector3.js', function() {
  const exampleVec3 = new external.cornerstoneMath.Vector3(1, 2, 3);

  it('should return the same object if a Vector3 is passed in', function() {
    const converted = convertToVector3(exampleVec3);

    expect(converted).toBe(exampleVec3);
  });

  it('should return an similar Vector3 if a Vector3-like object is passed in', function() {
    const { x, y, z } = exampleVec3;
    const vec3LikeObject = { x, y, z };
    const converted = convertToVector3(vec3LikeObject);

    expect(vec3LikeObject).not.toBe(converted);
    expect(vec3LikeObject.x).toEqual(converted.x);
    expect(vec3LikeObject.y).toEqual(converted.y);
    expect(vec3LikeObject.z).toEqual(converted.z);
  });

  it('should return an similar Vector3 if an Array is passed in', function() {
    const { x, y, z } = exampleVec3;
    const array = [x, y, z];
    const converted = convertToVector3(array);

    expect(array).not.toBe(converted);
    expect(array[0]).toEqual(converted.x);
    expect(array[1]).toEqual(converted.y);
    expect(array[2]).toEqual(converted.z);
  });
});
