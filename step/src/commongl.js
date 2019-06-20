class CommonGL {

  static pi() {
    return (`const float PI = 3.1415926;`);
  }

  static fibonacciSphere() {
    return (`
      // from:
      // https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere
      vec3 fibonacciSphere(in int rotationSample, in int rotationSamples)
      {
        const float pi = 3.1415926535897932384626433832795;
        const float increment = pi * (3. - sqrt(5.));
        float offset = 2. / float(rotationSamples);
        float offsetOverTwo = offset / 2.;

        float y = ((float(rotationSample) * offset) -1.) + offsetOverTwo;
        float r = sqrt(1. - pow(y,2.));
        float phi = float(rotationSample) * increment;

        return(vec3( r*cos(phi), y, r*sin(phi) ));
      }
    `);
  }

  static isoCorners() {
    return (`
      // the eight corners of an isocube indexed 0 to 7
      // with least significant bit being x
      vec3 isoCorners(in int corner)
      {
        corner = corner & 7;
        return( vec3((corner & 1) > 0 ? 1. : -1.,
                     (corner & 2) > 0 ? 1. : -1.,
                     (corner & 4) > 0 ? 1. : -1.) );
      }
    `);
  }

  // returns a mat3 rotation matrix where the first column
  // is the normized vector
  // and the second and third columns are mutually perpendicular
  // to the first.  Meant to be used as the direction cosines
  // for 3D convolutions
  static rotationFromVector() {
    return (`
      mat3 rotationFromVector(in vec3 vector) {
        vec3 normalizedVector = normalize(vector);
        vec3 axis = vec3(1.,0.,0.);
        if (dot(normalizedVector, axis) > .9) {
          vec3 axis = vec3(0., 1., 0.);
        }
        vec3 crossAxis = cross(normalizedVector, axis);
        vec3 crossAxis2 = cross(crossAxis, normalizedVector);
        return(mat3(normalizedVector, normalize(crossAxis), normalize(crossAxis2)));
      }
    `);
  }

  // returns a mat4 to rotate around a point
  // translate point to the origin, rotate, then translate back
  static rotateAroundPoint() {
    return (`
      mat4 rotateAroundPoint(in mat3 rotation, in vec3 point) {
        mat4 rotation4 = mat4(1.);
        rotation4[0] = vec4(rotation[0],1.);
        rotation4[1] = vec4(rotation[1],1.);
        rotation4[2] = vec4(rotation[2],1.);
        mat4 transform = mat4(1.);
        mat4 translate = mat4(1.);
        translate[3] = vec4(-1.*point, 1.);
        transform *= translate;
        transform *= rotation4;
        translate[3] = vec4(point, 1.);
        transform *= translate;
        return(transform);
      }
    `);
  }

  // returns the gabor filter kernel
  static gabor() {
    return(`

      const bool REAL=true;

      uniform float sigma;
      uniform float frequency;
      uniform float phase;

      // based on http://www.insight-journal.org/browse/publication/150
      float gaborEvaluate(in float u) {
        float envelope = exp( -0.5 * u/sigma * u/sigma );
        float angle = 2.0 * PI * frequency * u + phase;
        if (REAL) {
          return( envelope * cos(angle) );
        } else {
          return( envelope * sin(angle) );
        }
      }

      float gabor(in vec3 samplePoint, in vec3 center) {
        float gaussian, waves;

        gaussian = exp( -0.5 * ( pow(samplePoint.x - center.x, 2.) +
                               pow(samplePoint.y - center.y, 2.) +
                               pow(samplePoint.z - center.z, 2.) ) / sigma );

        waves = gaborEvaluate( samplePoint.x - center.x );

        return( gaussian * waves );
      }
    `);
  }
}
