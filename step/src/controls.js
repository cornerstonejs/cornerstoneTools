class Controls {
  constructor(options={}) {
    this.mouseEvents = ['mousedown', 'mousemove', 'mouseup'];
    this.touchEvents = ['touchstart', 'touchmove', 'touchend'];
    this.startPoint = undefined;
    this.startWindow = undefined;
    this.gangWindow = false;
    this.tool = 'windowLevel';
    this.imageDisplayIndex = 0;
  }

  // TODO: currently the last field added, but should
  // come from a UI selection of the active tool and target image
  selectedImageField() {
    let field = undefined;
    step.renderer.inputFields.forEach(inputField=>{
      if(inputField.constructor.name == "ImageField" && inputField.visible) {
        field = inputField;
      }
    });
    return field;
  }

  toggleField(index) {
    step.renderer.inputFields[index].visible ^= 1; // xor equals toggles
  }

  randomColor() {
    this.selectedImageField().rgba = [Math.random(), Math.random(), Math.random(), 1.];
  }

  cycleVisibleImage(indexToDisplay) {
    if (indexToDisplay == undefined) {
      indexToDisplay = this.imageDisplayIndex;
      this.imageDisplayIndex++
      this.imageDisplayIndex = this.imageDisplayIndex % step.renderer.inputFields.length;
    }
    console.log("display: " + indexToDisplay);
    let index = 0;
    step.renderer.inputFields.forEach(inputField => {
      inputField.visible = Number(index == indexToDisplay);
      let description = inputField.dataset ? inputField.dataset.SeriesDescription : "";
      console.log(index, inputField.visible, description, inputField.constructor.name);
      index++;
    });
    step.renderer.requestRender(step.view);
  }

  allImagesVisible() {
    step.renderer.inputFields.forEach(inputField => {
      inputField.visible = true;
    });
    step.renderer.requestRender(step.view);
  }

  preventEventDefault(event) {
    event.preventDefault();
  }

  activate(options) {
    document.addEventListener("contextmenu", this.preventEventDefault);
    this.onWindowLevel = options.onWindowLevel;

    // TODO: step is global and defines the application that is being controlled
    this.mouseCallback = this.onMouseEvent.bind(this);
    this.mouseEvents.forEach(eventName => {
      step.renderer.canvas.addEventListener(eventName, this.mouseCallback, {passive:true});
    });
    this.touchCallback = this.onTouchEvent.bind(this);
    this.touchEvents.forEach(eventName => {
      step.renderer.canvas.addEventListener(eventName, this.touchCallback, {passive:true});
    });

    this.wheelCallback = this.onWheelEvent.bind(this);
    step.renderer.canvas.addEventListener('mousewheel', this.wheelCallback, {passive:true});
    this.keyboardCallback = this.onKeyboardEvent.bind(this);
    window.addEventListener('keydown', this.keyboardCallback, {passive:true});
  }

  deactivate() {
    document.removeEventListener("contextmenu", this.preventEventDefault);

    this.mouseEvents.forEach(eventName => {
      step.renderer.canvas.removeEventListener(eventName, this.mouseCallback);
    });
    this.touchEvents.forEach(eventName => {
      step.renderer.canvas.removeEventListener(eventName, this.touchCallback);
    });

    step.renderer.canvas.removeEventListener('mousewheel', this.wheelCallback);
    window.removeEventListener('keydown', this.keyboardCallback);
  }

  onTouchEvent(touchEvent) {
    touchEvent.buttons = 1;
    switch (touchEvent.type) {
      case 'touchstart': {
        touchEvent.type = 'mousedown';
      }
      break;
      case 'touchmove': {
        touchEvent.type = 'mousemove';
      }
      break;
      case 'touchend': {
        touchEvent.type = 'mouseup';
      }
      break;
    }
    this.mouseCallback(touchEvent);
  }

  onMouseEvent(mouseEvent) {
    let imageField = this.selectedImageField();
    if (!imageField) {
      return;
    }
    let point = [-1. + (2. * mouseEvent.clientX / step.renderer.canvas.width),
                 -1. + (2. * mouseEvent.clientY / step.renderer.canvas.height)];
    switch (mouseEvent.type) {
      case 'mousedown': {
        this.startPoint = point.slice();
        this.startWindow = [imageField.windowWidth, imageField.windowCenter].slice();
        this.startViewUp = step.view.viewUp.slice();
        this.startViewPoint = step.view.viewPoint.slice();
        this.startViewTarget = step.view.target();
      }
      break;
      case 'mousemove': {
        if (this.startPoint) {
          let pointDelta = [0,1].map(e=>point[e]-this.startPoint[e]);
          if (mouseEvent.buttons == 1) {
            switch (this.tool) {
              case 'windowLevel': {
                // W/L
                // TODO: figure out a good way to automatically determine the gain
                imageField.windowWidth = this.startWindow[0] + pointDelta[0] * 1500.;
                imageField.windowWidth = Math.max(imageField.windowWidth, 1.);
                imageField.windowCenter = this.startWindow[1] + pointDelta[1] * 1500.;
                if (this.gangWindow) {
                  step.renderer.inputFields.forEach(field => {
                    if (field.constructor.name == 'ImageField') {
                      field.windowWidth = imageField.windowWidth;
                      field.windowCenter = imageField.windowCenter;
                    }
                  });
                }
                if (this.onWindowLevel) {
                  this.onWindowLevel();
                }
              }
              break;
              case 'trackball': {
                step.view.look({
                  from: this.startViewPoint,
                  at: this.startViewTarget,
                  up: this.startViewUp,
                });
                step.view.orbit(pointDelta[0]*-90., pointDelta[1]*-90.);
              }
              break;
            }
          }
          if (mouseEvent.buttons == 4) {
            // PAN
            let gain = 200.;
            let rightward = [0, 1, 2].map(e=>{
              return(-1 * gain * pointDelta[0] * step.view.viewRight[e]);
            });
            let upward = [0, 1, 2].map(e=>{
              return(gain * pointDelta[1] * step.view.viewUp[e]);
            });
            let viewPoint = Linear.vplus(this.startViewPoint, rightward);
            viewPoint = Linear.vplus(viewPoint, upward);
            let target = Linear.vplus(this.startViewTarget, rightward);
            target = Linear.vplus(target, upward);
            step.view.look({from: viewPoint, at: target});
          }
          if (mouseEvent.buttons == 2) {
            // ZOOM
            let gain = 500.;
            let viewPoint = [0, 1, 2].map(e=>{
              return(this.startViewPoint[e] + step.view.viewNormal[e] * gain * pointDelta[1]);
            });
            step.view.look({from: viewPoint});
          }
          step.renderer.requestRender(step.view);
        }
      }
      break;
      case 'mouseup': {
        this.startPoint = undefined;
      }
    }
  }

  onWheelEvent(wheelEvent) {
    let gain = 5.;
    if (wheelEvent.wheelDelta < 0) {
      gain *= -1;
    }
    let target = step.view.target();
    let viewPoint = [0, 1, 2].map(e=>{
      return(step.view.viewPoint[e] - gain * step.view.viewNormal[e]);
    });
    step.view.look({from: viewPoint, at: target});
    step.renderer.requestRender(step.view);
  }

  onKeyboardEvent(keyboardEvent) {
    let key = keyboardEvent.key;
    if (key == "") {
      key = String.fromCharCode(keyboardEvent.keyCode);
      if (key.length == 1) {
        key = key.toLowerCase();
      }
    }
    if (key.match(/[0-9]/)) { // isdigit
      this.toggleField(Number(key));
    } else {
      switch (key) {
        case "ArrowUp": {
          step.view.orbit(0, 1);
        }
        break;
        case "ArrowRight": {
          step.view.orbit(1, 0);
        }
        break;
        case "ArrowLeft": {
          step.view.orbit(-1, 0);
        }
        break;
        case "ArrowDown": {
          step.view.orbit(0, -1);
        }
        break;
        case "a": {
          step.view.slice({plane: "axial", offset: 0.5, thickness: 1});
          step.uniforms.sliceMode.value = 1;
        }
        break;
        case "s": {
          step.view.slice({plane: "sagittal", offset: 0.5, thickness: 1});
          step.uniforms.sliceMode.value = 1;
        }
        break;
        case "c": {
          step.view.slice({plane: "coronal", offset: 0.5, thickness: 1});
          step.uniforms.sliceMode.value = 1;
        }
        break;
        case "v": {
          step.view.viewNear = 0;
          step.view.viewFar = Linear.LARGE_NUMBER;
          step.uniforms.sliceMode.value = 0;
        }
        break;
        case "t": {
          if (this.tool == "trackball") {
            this.tool = "windowLevel";
          } else {
            this.tool = "trackball";
          }
        }
        break;
        case "f": {
          step.view.look({at: step.renderer.center, bounds: step.renderer.bounds});
        }
        break;
        case "R": {
          this.allImagesVisible();
        }
        break;
        case "r": {
          this.cycleVisibleImage();
        }
        break;
        case "y": {
          this.randomColor();
        }
        case " ": { // Space
          animateTransform(); // global
        }
        break;
        case ".": {
          console.log('.');
          step.renderer.inputFields.forEach(field => field.transformGain = 1);
          step.renderer.requestRender();
        }
        break;
        case ",": {
          step.renderer.inputFields.forEach(field => field.transformGain = 0);
          step.renderer.requestRender();
        }
        break;
        case "Shift": {
          // no op
        }
        break;
        default : {
          console.log(`No mapping for "${key}"`);
        }
      }
    }
    step.renderer.requestRender(step.view);
  }
}
