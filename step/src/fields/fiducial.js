class Fiducial {
  constructor(options={}) {
    this.point = options.point || [0.,0.,0.];
    this.radius = options.radius || 10.;
    this.thickness = options.thickness || 5.5;
  }
}

class FiducialField extends Field {
  constructor(options={}) {
    super(options);
    this.gradientOpacityScale = options.gradientOpacityScale || 1.;
    this.fiducials = options.fiducials || [];
    this.analyze();
  }

  analyze() {
    super.analyze();
    let large = Linear.LARGE_NUMBER;
    this.bounds = {min: [large, large, large], max: [-large, -large, -large]};
    this.center = [];
    this.fiducials.forEach(fiducial => {
      [0,1,2].forEach(e => {
        this.bounds.min[e] = Math.min(fiducial.point[e]-fiducial.radius,
                                      this.bounds.min[e]);
        this.bounds.max[e] = Math.max(fiducial.point[e]+fiducial.radius,
                                      this.bounds.max[e]);
        this.center[e] = 0.5 * (this.bounds.min[e] + this.bounds.max[e]);
      });
    });
  }

  uniforms() {
    let u = super.uniforms();
    return(u);
  }

  fiducialsSource() {
    let source = '';
    this.fiducials.forEach(fiducial => {
      source += `

        centerToSample = samplePoint - vec3(
                ${fiducial.point[0]}, ${fiducial.point[1]}, ${fiducial.point[2]} );
        distanceFromCenter = length(centerToSample);
        distanceFromSurface = distanceFromCenter - ${fiducial.radius};
        if (abs(distanceFromSurface) < ${fiducial.thickness}) {
          sampleValue += abs((abs(distanceFromSurface) - ${fiducial.thickness})) * ${this.rgba[3]};
          normal += sign(distanceFromSurface) * normalize(centerToSample);
        }
      `;
    });
    return(source);
  }

  samplingShaderSource() {

    let source = `

      uniform vec4 rgba${this.id};
      uniform float gradientOpacityScale${this.id};
      void transferFunction${this.id} (const in float sampleValue,
                                       const in float gradientMagnitude,
                                       out vec3 color,
                                       out float opacity)
      {
          color = vec3(rgba${this.id});
          opacity = gradientOpacityScale${this.id} * gradientMagnitude *
                    sampleValue * rgba${this.id}.a;
      }

      uniform ${this.samplerType} textureUnit${this.id};
      uniform int visible${this.id};

      void sampleField${this.id} (const in ${this.samplerType} textureUnit,
                                  const in vec3 samplePointPatient,
                                  const in float gradientSize,
                                  out float sampleValue,
                                  out vec3 normal,
                                  out float gradientMagnitude)
      {
        // TODO: transform should be associated with the sampling, not the ray point
        //       so that gradient is calculated incorporating transform
        vec3 samplePoint = transformPoint${this.id}(samplePointPatient);

        vec3 centerToSample;
        float distanceFromCenter;
        float distanceFromSurface;

        // default if sampleValue is not in any fiducial
        sampleValue = 0.;
        normal = vec3(0,0,0);

        ${this.fiducialsSource()}

        gradientMagnitude = length(normal);
        normal = normalize(normal);

      }
    `;

    return(source);
  }

  fieldToTexture(gl) {
    // allocate and fill a dummy texture
    let needsUpdate = super.fieldToTexture(gl);

    if (needsUpdate) {
      let imageFloat32Array = Float32Array.from([0]);

      let [w,h,d] = [1,1,1];
      gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R32F, w, h, d);
      gl.texSubImage3D(gl.TEXTURE_3D,
                       0, 0, 0, 0, // level, offsets
                       w, h, d,
                       gl.RED, gl.FLOAT, imageFloat32Array);
      this.updated();
    }
  }
}
