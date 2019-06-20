class RayCastRenderer extends ProgrammaticGenerator {
  // Last link in a chain, renders to the default frame buffer
  // using ray cast shader program
  //
  constructor(options={}) {
    super(options);
    this.canvas = options.canvas;
    this.rayCompositing = options.rayCompositing || 'integration';
    if (!this.rayCompositing in ['integration', 'maximum', 'minimum']) {
      console.error(`Unknown rayCompositing option ${this.rayCompositing}, using integration`);
      this.rayCompositing = 'integration';
    }
    this.maximumCompositingField = options.maximumCompositingField || 0;
    this.renderRequestTimeout = options.renderRequestTimeout || 100.;

    this.pendingRenderRequest = false; // a handle to the ongoing render
    this.requestAnotherRender = false; // trigger another when this completes

    this.syncReasons = {};
    this.syncReasons[this.gl.ALREADY_SIGNALED] = "ALREADY_SIGNALED";
    this.syncReasons[this.gl.TIMEOUT_EXPIRED] = "TIMEOUT_EXPIRED";
    this.syncReasons[this.gl.CONDITION_SATISFIED] = "CONDITION_SATISFIED";
    this.syncReasons[this.gl.WAIT_FAILED] = "WAIT_FAILED";
  }

  updateProgram() {
    // recreate the program and textures for the current field list
    super.updateProgram();
    let gl = this.gl;

    // recalculate center and bounds
    let large = Linear.LARGE_NUMBER;
    this.bounds = {min: [large, large, large], max: [-large, -large, -large]};
    this.inputFields.forEach(field => {
      [0,1,2].forEach(e => {
        this.bounds.min[e] = Math.min(this.bounds.min[e], field.bounds.min[e]);
        this.bounds.max[e] = Math.max(this.bounds.max[e], field.bounds.max[e]);
      });
    });
    this.center = [0,0,0];
    [0,1,2].forEach(e => {
      this.center[e] = (this.bounds.min[e] + this.bounds.max[e])/2;
    });
  }

  requestRender(view) {
    if (view) {
      this.view = view;
    }
    if (this.pendingRenderRequest) {
      console.log('skipping render - pending request');
      this.requestAnotherRender = true;
      return;
    }
    this.pendingRenderRequest = window.requestAnimationFrame(this._render.bind(this));
  }

  _render() {
    this.pendingRenderRequest = false;
    if (!this.gl) {
      console.log('skipping render - no gl context');
      return;
    }
    if (!this.view) {
      console.log('skipping render - no view');
      return;
    }

    // check to see if previous render is finished
    if (false) {
      let sync = this.gl.fenceSync(this.gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      let reason = this.gl.clientWaitSync(sync, this.gl.SYNC_FLUSH_COMMANDS_BIT, 1e6);
      if (reason == this.gl.TIMEOUT_EXPIRED) {
        // the previous render is not yet finished, so re-issue request
        this.requestRender();
        return;
      }
      console.log(this.syncReasons[String(reason)]);
    }

    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // draw to the main framebuffer!
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // the coordinate attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, this.renderImageCoordinatesBuffer);
    let coordinateLocation = gl.getAttribLocation(this.program, "coordinate");
    gl.enableVertexAttribArray( coordinateLocation );
    gl.vertexAttribPointer( coordinateLocation, 3, gl.FLOAT, false, 0, 0);

    // the textureCoordinate attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, this.renderImageTexureCoordinatesBuffer);
    let textureCoordinateLocation = gl.getAttribLocation(this.program, "textureCoordinate");
    gl.enableVertexAttribArray( textureCoordinateLocation );
    gl.vertexAttribPointer( textureCoordinateLocation, 2, gl.FLOAT, false, 0, 0);

    // the overall application uniforms, and the per-field uniforms
    Object.keys(this.uniforms).forEach(key=>{
      this._setUniform(key, this.uniforms[key]);
    });
    let uniforms = this.view.uniforms();
    Object.keys(uniforms).forEach(key=>{
      this._setUniform(key, uniforms[key]);
    });
    this.inputFields.forEach(field=>{
      let uniforms = field.uniforms();
      Object.keys(uniforms).forEach(key=>{
        this._setUniform(key, uniforms[key]);
      });
    });

    // activate any field textures
    this.inputFields.forEach(field=>{
      gl.activeTexture(gl.TEXTURE0+field.id);
      if (field.texture) {
        gl.bindTexture(gl.TEXTURE_3D, field.texture);
      }
    });

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // if an event requested a render while gl was working, request another
    if (this.requestAnotherRender) {
      this.requestAnotherRender = false;
      this.requestRender();
    }
  }

  perFieldSamplingShaderSource() {
    let perFieldSamplingShaderSource = '';
    this.inputFields.forEach(field=>{
      perFieldSamplingShaderSource += field.transformShaderSource();
      perFieldSamplingShaderSource += field.samplingShaderSource();
    });
    return(perFieldSamplingShaderSource);
  }

  perFieldCompositingShaderSource() {
    let source = '';
    this.inputFields.forEach(field=>{
      source += `
          if (visible${field.id} > 0) {
            // accumulate per-field opacities and lit colors
            sampleField${field.id}(textureUnit${field.id},
                                    samplePoint, gradientSize,
                                    sampleValue, normal, gradientMagnitude);
            transferFunction${field.id}(sampleValue, gradientMagnitude,
                                    color, fieldOpacity);
            colorSum += color;
            litColor += fieldOpacity * lightingModel(samplePoint, normal, color, viewPoint);
            opacity += fieldOpacity;
          }
      `;
    });
    return(source);
  }

  fieldCompositingShaderSource() {
    let fieldCompositingShaderSource = `
          vec3 normal;
          float gradientMagnitude;
          vec3 color;
          float opacity = 0.;
          vec3 litColor = vec3(0.);
          float fieldOpacity = 0.;
          vec3 fieldLitColor = vec3(0.);
          vec3 colorSum = vec3(0.);

          ${this.perFieldCompositingShaderSource()}

          // normalize back so that litColor is mean of all inputFields weighted by opacity
          litColor /= opacity;
    `;

    return(fieldCompositingShaderSource);
  }

  rayCompositingShaderSource() {
    if (this.rayCompositing == 'integration') {
      return (`
        // http://graphicsrunner.blogspot.com/2009/01/volume-rendering-101.html
        if (opacity > 0.) {
          opacity *= adjustedStep;
          integratedPixel.rgb += (1. - integratedPixel.a) * opacity * litColor;
          integratedPixel.a += (1. - integratedPixel.a) * opacity;
          integratedPixel = clamp(integratedPixel, 0.0001, 0.9999);
        }

        if (sliceMode == 1) {
          integratedPixel.rgb = colorSum;
          integratedPixel.a = 1.;
        }

        tCurrent += adjustedStep;
        if (
            tCurrent >= tFar  // stepped out of the volume
              ||
            tCurrent >= viewFar // far clip plane
              ||
            integratedPixel.a >= .99  // pixel is saturated
        ) {
          break; // we can stop now
        }
      `);
    } else if (this.rayCompositing == 'maximum') {
      return (`

        // MIP rendering using alpha to store max pixel value
        // - re-sample selected field
        // - if its r component is max, then use summed color for this sample point
        sampleField${this.maximumCompositingField}(textureUnit${this.maximumCompositingField},
                                samplePoint, gradientSize,
                                sampleValue, normal, gradientMagnitude);
        transferFunction${this.maximumCompositingField}(sampleValue, gradientMagnitude,
                                color, fieldOpacity);
        if (sampleValue > integratedPixel.a) {
          integratedPixel.rgb = colorSum;
          integratedPixel.a = sampleValue;
        }

        if (sliceMode == 1) {
          integratedPixel.rgb = colorSum;
          integratedPixel.a = 1.;
        }

        tCurrent += adjustedStep;
        if (
            tCurrent >= tFar  // stepped out of the volume
              ||
            tCurrent >= viewFar // far clip plane
        ) {
          integratedPixel.a = 1.; // always returns a fully opaque value of the max sample
          break; // we can stop now
        }
      `);
    }
  }

  _vertexShaderSource() {
    return (`${this.headerSource()}
      in vec3 coordinate;
      in vec2 textureCoordinate;
      out vec3 interpolatedTextureCoordinate;
      void main()
      {
        interpolatedTextureCoordinate = vec3(textureCoordinate, .5);
        gl_Position = vec4(coordinate, 1.);
      }
    `);
  }

  _fragmentShaderSource() {
    return (`${this.headerSource()}

      uniform vec3 pointLight;
      uniform vec3 viewPoint;
      uniform vec3 viewNormal;
      uniform vec3 viewRight;
      uniform vec3 viewUp;
      uniform float halfSinViewAngle;
      uniform vec3 viewBoxMin;
      uniform vec3 viewBoxMax;
      uniform float viewNear;
      uniform float viewFar;
      uniform float gradientSize;
      uniform int rayMaxSteps;
      uniform float sampleStep;
      uniform float renderCanvasWidth;
      uniform float renderCanvasHeight;
      uniform int sliceMode;
      uniform float Kambient; // TODO: move to per-field
      uniform float Kdiffuse;
      uniform float Kspecular;
      uniform float Shininess;

      bool intersectBox(const in vec3 rayOrigin, const in vec3 rayDirection,
                        const in vec3 boxMin, const in vec3 boxMax,
                        out float tNear, out float tFar)
        // intersect ray with a box
        // https://github.com/bozorgi/VTKMultiVolumeRayCaster/blob/master/README.pdf
        // http://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm
      {
          // compute intersection of ray with all six bbox planes
          vec3 invRay = vec3(1.) / rayDirection;
          vec3 tBot = invRay * (boxMin - rayOrigin);
          vec3 tTop = invRay * (boxMax - rayOrigin);

          // re-order intersections to find smallest and largest on each axis
          vec3 tMin = min(tTop, tBot);
          vec3 tMax = max(tTop, tBot);

          // find the largest tMin and the smallest tMax
          float largest_tMin = max(max(tMin.x, tMin.y), max(tMin.x, tMin.z));
          float smallest_tMax = min(min(tMax.x, tMax.y), min(tMax.x, tMax.z));

          tNear = largest_tMin;
          tFar = smallest_tMax;

          return smallest_tMax > largest_tMin;
      }

      vec3 lightingModel( in vec3 samplePoint, in vec3 normal, in vec3 color, in vec3 viewPoint )
      {
        // Phong lighting
        // http://en.wikipedia.org/wiki/Phong_reflection_model
        vec3 Cambient = color;
        vec3 Cdiffuse = color;
        vec3 Cspecular = vec3(1.,1.,1.);

        vec3 litColor = Kambient * Cambient;
        vec3 pointToEye = normalize(viewPoint - samplePoint);

        if (dot(pointToEye, normal) > 0.) {
          vec3 pointToLight = normalize(pointLight - samplePoint);
          float lightDot = dot(pointToLight,normal);
          vec3 lightReflection = reflect(pointToLight,normal);
          float reflectDot = dot(lightReflection,pointToEye);
          if (lightDot > 0.) {
            litColor += Kdiffuse * lightDot * Cdiffuse;
            litColor += Kspecular * pow( abs(reflectDot), Shininess ) * Cspecular;
          }
        }
        return clamp(litColor, 0., 1.);
      }

      // these are the function definitions for sampleVolume* and transferFunction*
      // that define a field at a sample point in space
      ${this.perFieldSamplingShaderSource()}

      // field ray caster - starts from the front and collects color and opacity
      // contributions until fully saturated.
      // Sample coordinate is 0->1 texture space
      //
      vec4 rayCast( in vec3 sampleCoordinate )
      {
        vec4 backgroundRGBA = vec4(.25, .25, .25, 1.);

        float aspect = renderCanvasWidth / renderCanvasHeight;
        vec2 normalizedCoordinate = 2. * (sampleCoordinate.st -.5);
        normalizedCoordinate.s *= aspect;

        // calculate eye ray in world space
        vec3 eyeRayDirection;

        // ||viewNormal + u * viewRight + v * viewUp||
        eyeRayDirection = normalize ( viewNormal
                                    + viewRight * halfSinViewAngle * normalizedCoordinate.x
                                    + viewUp * halfSinViewAngle * normalizedCoordinate.y );

        // should be right - TODO: doublecheck when trilinear interpolation is fixed
        float adjustment = dot (normalize(viewNormal), eyeRayDirection);
        float adjustedStep = sampleStep * adjustment;

        // find intersection with box, possibly terminate early
        float tNear, tFar;
        bool hit = intersectBox( viewPoint, eyeRayDirection, viewBoxMin, viewBoxMax, tNear, tFar );
        if (!hit) {
          return (backgroundRGBA);
        }

        tNear = max(tNear, 0.);
        tNear = max(tNear, viewNear); // near clipping plane
        tNear /= adjustment;

        // march along ray from front, accumulating color and opacity
        vec4 integratedPixel = vec4(0.);
        float tCurrent = tNear;
        float sampleValue;
        int rayStep;
        for(rayStep = 0; rayStep < rayMaxSteps; rayStep++) {

          vec3 samplePoint = viewPoint + eyeRayDirection * tCurrent;

          // this is the code that composites together samples
          // from all the inputFields in the space
          ${this.fieldCompositingShaderSource()}

          ${this.rayCompositingShaderSource()}
        }

        return(vec4(mix(backgroundRGBA.rgb, integratedPixel.rgb, integratedPixel.a), 1.));
      }

      in vec3 interpolatedTextureCoordinate;
      out vec4 fragmentColor;
      void main()
      {
        fragmentColor = rayCast(interpolatedTextureCoordinate);
      }

    `);
  }
}
