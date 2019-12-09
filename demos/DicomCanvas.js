import React from 'react';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import * as dicomRender from '../../dicom-render/dist/dicomRender.js';
import * as dicomTools from '../dist/dicomTools.js';
import './dicomLoader.js';
dicomTools.external.cornerstone = dicomRender;
dicomTools.external.cornerstoneMath = cornerstoneMath;
dicomTools.external.Hammer = Hammer;
const divStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  color: 'white',
  overflow: 'hidden',
  background: '#000',
};
const bottomLeftStyle = {
  bottom: '5px',
  left: '5px',
  position: 'absolute',
  color: 'white',
};

const bottomRightStyle = {
  bottom: '5px',
  right: '5px',
  position: 'absolute',
  color: 'white',
};
class DicomCanvas extends React.Component {
  static defaultProps = {
    style: {},
  };

  constructor (props) {
    super (props);
    this.state = {
      viewport: dicomRender.getDefaultViewport(null, undefined),
      imageId: 'dicomLoader://',
      ctValue: 0,
    };
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (
      nextProps.dicomImageData !== this.props.dicomImageData ||
      nextProps.sliceWidth !== this.props.sliceWidth ||
      nextProps.sliceHeight !== this.props.sliceHeight
    ) {
      this.loadDicom (nextProps);
    }
  }

  componentDidMount() {
    document.oncontextmenu = () => false;
    this.loadDicom(this.props);
    const element = this.element;
    dicomTools.init({language: 'en-US'});
    dicomRender.enable(element);
    const PanTool = dicomTools.PanTool;
    dicomTools.addTool(PanTool);
    dicomTools.setToolActive('Pan', { mouseButtonMask: 1 });
    const ZoomTool = dicomTools.ZoomTool;
    dicomTools.addTool(ZoomTool);
    dicomTools.setToolActive('Zoom', { mouseButtonMask: 4 });
    const WwwcTool = dicomTools.WwwcTool;
    dicomTools.addTool(WwwcTool);
    dicomTools.setToolActive('Wwwc', { mouseButtonMask: 2 });
    element.addEventListener('cornerstoneimagerendered', this.onImageRendered);
    element.addEventListener('cornerstonenewimage', this.onNewImage);
    element.addEventListener('cornerstonectvalueupdate', this.onCTValueChanged);
  }

  componentWillUnmount () {
    const element = this.element;
    element.removeEventListener (
      'cornerstoneimagerendered',
      this.onImageRendered
    );

    element.removeEventListener ('cornerstonenewimage', this.onNewImage);

    dicomRender.disable (element);
  }

  loadDicom({ dicom, index }) {
    if (!this.element || !dicom) {
      return;
    }

    // const context = this.element.getContext('2d') as CanvasRenderingContext2D;

    // context.putImageData(dicom, 0, 0);
    this.displayImage(dicom, index);
  }

  onWindowResize = () => {
    if (this.element) {
      dicomRender.resize(this.element);
    }
  };

  onCTValueChanged = (event) => {
    console.log('CTvalue', event.detail)
    this.setState({ctValue: event.detail})
  }

  onImageRendered = () => {
    const viewport = dicomRender.getViewport(this.element);
    console.log('onImageRendered:', viewport)
    this.setState({
      viewport,
    });
  };

  onNewImage = () => {
    const enabledElement = dicomRender.getEnabledElement(this.element);
    this.setState({
      imageId: enabledElement.image.imageId,
    });
  };

  displayImage = (dicom, index) => {
    const element = this.element;
    if (!element) {
      return;
    }
    // load image and display it
    this.updateDicom(dicom, index);
  };

  updateDicom(dicom, index) {
    const element = this.element;
    // load image and display it
    const imageId = this.state.imageId + index;
    dicomRender.loadImage(imageId, dicom).then(function(image) {
      dicomRender.displayImage(element, image);
    });
  }

  render() {
    const { ctValue } = this.state;
    const { translation, scale, initScale, voi } = this.state.viewport;
    return (
      <div style={divStyle}>
        <div
          className="viewportElement"
          tabIndex={1}
          ref={input => {
            this.element = input;
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
        <div style={bottomLeftStyle}>Zoom: {scale}&nbsp;&nbsp;CT: {ctValue}</div>
        <div style={bottomRightStyle}>
          WW/WC: {voi.windowWidth} /{' '}
          {voi.windowCenter}
        </div>
      </div>
    );
  }
}

export default DicomCanvas;
