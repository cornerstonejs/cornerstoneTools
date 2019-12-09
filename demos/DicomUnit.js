import React from 'react';
import ReactDOM from 'react-dom';
import { ImageGenerator } from '@sk/dicom-parser';
import * as dicomRender from '../../dicom-render/dist/dicomRender.js';
import * as dicomTools from '../dist/dicomTools.js';
import './dicomLoader';
import './imageLoader';

import DicomCanvas from './DicomCanvas';
import {
  DICOM_STATE,
  DICOM_TYPE,
  DICOM_TYPE_INDEX,
  MESSAGE_TYPE,
  NAME_DISPLAY_DEFAULT,
} from './constants';
import { loadDicom } from './dicom';
import {
  fireEvent,
  formatWindowLevelValue,
  getCaseId,
  getImageFromUrl,
} from './utils';

window.__SK_DICOM_DATA__ = {};
window.__SK_DICOM_STATE__ = {};
const defaultImgUrl = 'images/shukun@3x.png';

class DicomUnit extends React.Component {
  state = {
    dicomImageData: null,
    dicom: null,
    dicomMeta: [],
    scale: 1,
    sliceHeight: 512,
    sliceWidth: 512,
    outerHeight: 512,
    outerWidth: 512,
    windowCenter: 300,
    windowWidth: 800,
    x: 0.5,
    y: 0.5,
    zoom: true,
    showSeg: true,
    ctvalue: true,
  };

  cacheCanvas;
  commonKeys = {
    esc: 27,
  };
  caseId = getCaseId();
  initScale = 1;
  dicomCanvas = React.createRef();
  container = React.createRef();
  element = React.createRef();

  componentDidMount() {
    document.addEventListener('dicomloaded', this.onDicomLoaded);
    document.addEventListener(
      'batchAdjustWindowLevel',
      this.onWindowLevelUpdated
    );
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener(
      'getTransitionAndWWWL',
      this.getCurrentListTransitionAndWWWL
    );

    // if (this.props.metaLoaded) {
    this.checkDicomFile();
    // }

    if (this.cacheCanvas) {
      this.setSliceWidthHeight(this.cacheCanvas.width, this.cacheCanvas.height);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.metaLoaded !== this.props.metaLoaded ||
      prevProps.position !== this.props.position ||
      prevProps.type !== this.props.type ||
      prevProps.name_display !== this.props.name_display ||
      prevProps.vessel !== this.props.vessel
    ) {
      this.checkDicomFile();
    }

    if (this.props.filmSize !== prevProps.filmSize) {
      this.initZoomScale(true);
    }

    if (this.props.currentLayout !== prevProps.currentLayout) {
      this.initZoomScale(true);
    }

    if (
      this.props.isPreview &&
      prevState.sliceWidth !== this.state.sliceWidth &&
      prevState.sliceHeight !== this.state.sliceHeight
    ) {
      this.initPreviewZoomScale();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('dicomloaded', this.onDicomLoaded);
    document.removeEventListener(
      'batchAdjustWindowLevel',
      this.onWindowLevelUpdated
    );
    document.removeEventListener(
      'getTransitionAndWWWL',
      this.getCurrentListTransitionAndWWWL
    );

    if (this.removeResizeEvent) {
      this.removeResizeEvent();
    }

    if (
      this.props.isPreview &&
      (this.props.slice.wl !== this.state.windowCenter ||
        this.props.slice.ww !== this.state.windowWidth)
    ) {
      fireEvent('getTransitionAndWWWL', null);
    }
  }

  componentWillReceiveProps(nextprops) {
    if (
      this.props.slice.wl !== nextprops.slice.wl ||
      this.props.slice.ww !== nextprops.slice.ww
    ) {
      this.setWindowLevel(nextprops.slice.wl, nextprops.slice.ww);
      this.setState({
        windowCenter: nextprops.slice.wl,
        windowWidth: nextprops.slice.ww,
      });
    }
  }

  setWindowLevel = (wc, ww) => {
    // 对于 VR，只有 MIP 可以调窗宽窗位
    if (
      this.props.type === DICOM_TYPE_INDEX.VR_SERIES ||
      this.props.type === DICOM_TYPE_INDEX.VR_SERIES_MYO
    ) {
      return;
    }
    this.setState({ windowCenter: wc, windowWidth: ww });
    this.generateAndDrawImage(this.props.vessel, this.props.name_display);
  };

  onWindowLevelUpdated = event => {
    if (!this.checkSliceIsActive(this.props.slice)) {
      return;
    }

    const { diffX, diffY } = event.detail;
    const windowCenter = formatWindowLevelValue(
      this.state.windowCenter - diffY
    );
    const windowWidth = formatWindowLevelValue(
      Math.max(this.state.windowWidth + diffX, 1)
    );

    this.setWindowLevel(windowCenter, windowWidth);
  };

  onDicomLoaded = event => {
    const { index, nameDisplay, type, vessel, msgType } = event.detail;
    const convertedType = 'slices';
    if (type === convertedType && index === 0) {
      let stateArr = window.__SK_DICOM_STATE__[type];

      if (msgType === MESSAGE_TYPE.PARSE_SUCCESS) {
        stateArr[index] = DICOM_STATE.COMPLETE;

        this.generateAndDrawImage(vessel, nameDisplay);
      } else {
        stateArr[index] = DICOM_STATE.ERROR;

        this.setState({ dicomImageData: null });
      }
    }
  };

  setSliceWidthHeight(width, height) {
    if (this.state.sliceWidth !== width || this.state.sliceHeight !== height) {
      this.setState({ sliceWidth: width, sliceHeight: height });
    }

    if (
      this.cacheCanvas.width !== width ||
      this.cacheCanvas.height !== height
    ) {
      this.cacheCanvas.width = width;
      this.cacheCanvas.height = height;
    }
  }

  generateAndDrawImage(vessel, nameDisplay) {
    const convertedType = 'slices';
    let arr = [];

    if (!vessel) {
      if (window.__SK_DICOM_DATA__[convertedType]) {
        arr = window.__SK_DICOM_DATA__[convertedType];
      }
    } else if (!nameDisplay) {
      if (
        window.__SK_DICOM_DATA__[convertedType] &&
        window.__SK_DICOM_DATA__[convertedType][vessel]
      ) {
        arr = window.__SK_DICOM_DATA__[convertedType][vessel];
      }
    } else if (
      window.__SK_DICOM_DATA__[convertedType] &&
      window.__SK_DICOM_DATA__[convertedType][vessel] &&
      window.__SK_DICOM_DATA__[convertedType][vessel][nameDisplay]
    ) {
      arr = window.__SK_DICOM_DATA__[convertedType][vessel][nameDisplay];
    }

    const dicom = arr[0];

    if (!dicom) {
      return;
    }

    if (!this.cacheCanvas) {
      // this.cacheCanvas = document.createElement ('canvas');
    }

    // this.setSliceWidthHeight (dicom.Columns, dicom.Rows);

    // if (!this.lut) {
    //   this.lut = ImageGenerator.generateLut (
    //     this.state.windowCenter,
    //     this.state.windowWidth
    //   );
    // }

    // const context = this.cacheCanvas.getContext ('2d');
    // const imageData = context.createImageData (
    //   this.cacheCanvas.width,
    //   this.cacheCanvas.height
    // );

    // ImageGenerator.generateImageData (dicom, imageData, this.lut);
    this.setState({ dicom: dicom });
    this.addEventListenerToElement();
  }

  addEventListenerToElement = () => {
    const element = this.dicomCanvas.element;
    const _this = this;
    document.getElementById('reset').addEventListener('click', function(e) {
      dicomRender.reset(element);
    });
    document.getElementById('select').addEventListener('click', function(e) {
      const SelectTool = dicomTools.SelectTool;
      dicomTools.addToolForElement(element, SelectTool);
      // Activate first tool
      dicomTools.setToolActive('Select', {
        mouseButtonMask: 1,
        isTouchActive: true,
      });
    });
    document.getElementById('unselect').addEventListener('click', function(e) {
      const UnSelectTool = dicomTools.UnSelectTool;
      dicomTools.addToolForElement(element, UnSelectTool);
      // Activate first tool
      dicomTools.setToolActive('UnSelect', {
        mouseButtonMask: 1,
        isTouchActive: true,
      });
    });
    document.getElementById('choose').addEventListener('click', function(e) {
      const PanTool = dicomTools.PanTool;
      dicomTools.addToolForElement(element, PanTool);
      // Activate first tool
      dicomTools.setToolActive('Pan', {
        mouseButtonMask: 1,
        isTouchActive: true,
      });
    });
    document.getElementById('length').addEventListener('click', function(e) {
      const LengthTool = dicomTools.LengthTool;
      dicomTools.addToolForElement(element, LengthTool);
      // Activate first tool
      dicomTools.setToolActive('Length', {
        mouseButtonMask: 1,
        isTouchActive: true,
        configuration: {
          suffix: 'mm',
        },
      });
    });
    document
      .getElementById('EllipticalRoi')
      .addEventListener('click', function(e) {
        const EllipticalRoiTool = dicomTools.EllipticalRoiTool;
        dicomTools.addToolForElement(element, EllipticalRoiTool);
        // Activate first tool
        dicomTools.setToolActive('EllipticalRoi', {
          mouseButtonMask: 1,
          isTouchActive: true,
        });
      });
    document
      .getElementById('RectangleRoi')
      .addEventListener('click', function(e) {
        const RectangleRoiTool = dicomTools.RectangleRoiTool;
        dicomTools.addToolForElement(element, RectangleRoiTool);
        // Activate first tool
        dicomTools.setToolActive('RectangleRoi', {
          mouseButtonMask: 1,
          isTouchActive: true,
          configuration: {
            isSquare: true,
            isShowTextBox: false,
          },
        });
      });
    document.getElementById('eraser').addEventListener('click', function(e) {
      const EraserTool = dicomTools.EraserTool;
      dicomTools.addToolForElement(element, EraserTool);
      // Activate first tool
      dicomTools.setToolActive('Eraser', {
        mouseButtonMask: 1,
        isTouchActive: true,
      });
    });
    document
      .getElementById('ArrowAnnotate')
      .addEventListener('click', function(e) {
        const ArrowAnnotateTool = dicomTools.ArrowAnnotateTool;
        dicomTools.addToolForElement(element, ArrowAnnotateTool);
        // Activate first tool
        dicomTools.setToolActive('ArrowAnnotate', {
          mouseButtonMask: 1,
          isTouchActive: true,
        });
      });

    document.getElementById('invert').addEventListener('click', function(e) {
      const viewport = dicomRender.getViewport(element);
      viewport.invert = !viewport.invert;
      dicomRender.setViewport(element, viewport);
    });

    document.getElementById('zoom').addEventListener('click', function(e) {
      // const ZoomTool = dicomTools.ZoomTool;
      // dicomTools.addToolForElement(element, ZoomTool, {
      //   mouseButtonMask: 1
      // });
      if (_this.state.zoom) {
        // Activate first tool
        dicomTools.setToolActive('Zoom', {
          mouseButtonMask: 4,
          isTouchActive: true,
        });
      } else {
        // Passive first tool
        dicomTools.setToolPassive('Zoom', {
          mouseButtonMask: 4,
          isTouchActive: true,
        });
      }
      _this.setState({ zoom: !_this.state.zoom });
    });
    document.getElementById('ct').addEventListener('click', function(e) {
      const CtTool = dicomTools.CtTool;
      dicomTools.addToolForElement(element, CtTool);
      if (_this.state.ctvalue) {
        dicomTools.setToolActive('CT', {
          isMouseMoveActive: true,
        });
      } else {
        dicomTools.setToolPassive('CT');
      }
      _this.setState({ ctvalue: !_this.state.ctvalue });
    });

    document.getElementById('seg').addEventListener('click', function(e) {
      const imageId = 'imageLoader://1';
      const viewport = dicomRender.getViewport(element);
      getImageFromUrl('./files/seg/0000.png').then(image => {
        // dicomRender.enable(element);
        dicomRender.loadImage(imageId, image).then(function(image) {
          const layerId = dicomRender.addLayer(element, image);

          dicomRender.updateImage(element);
        });
      });
    });

    document.getElementById('next').addEventListener('click', function(e) {
      loadDicom({
        index: 1,
        path: './files/slices/0001.pb',
        type: 'slices',
        vessel: null,
      });
    });
  };

  checkDicomFile() {
    const t = 'slices';
    let state;

    switch (t) {
      case DICOM_TYPE.ORIGIN:
        if (!window.__SK_DICOM_STATE__[t]) {
          window.__SK_DICOM_STATE__[t] = Array(4).fill(DICOM_STATE.UNLOAD);
        }

        state = window.__SK_DICOM_STATE__[t][0];

        switch (state) {
          case DICOM_STATE.UNLOAD:
            loadDicom({
              index: 0,
              path: './files/slices/0000.pb',
              type: t,
              vessel: null,
            });
            window.__SK_DICOM_STATE__[t][0] = DICOM_STATE.LOADING;
            break;
          case DICOM_STATE.COMPLETE:
            this.generateAndDrawImage();
            break;
          case DICOM_STATE.ERROR:
            break;
          // no default
        }
        break;
      case DICOM_TYPE.VR:
        if (!window.__SK_DICOM_STATE__[t]) {
          window.__SK_DICOM_STATE__[t] = {};
        }

        if (!window.__SK_DICOM_STATE__[t][vessel]) {
          window.__SK_DICOM_STATE__[t][vessel] = {};

          for (let i = 1; i <= 3; ++i) {
            // NAME_DISPLAY 取值范围是在 1 - 3 之间
            window.__SK_DICOM_STATE__[t][vessel][i] = Array(
              meta.getDicomFileCount(t, vessel)
            ).fill(DICOM_STATE.UNLOAD);
          }
        }

        name_display = name_display || NAME_DISPLAY_DEFAULT;

        state = window.__SK_DICOM_STATE__[t][vessel][name_display][position];

        switch (state) {
          case DICOM_STATE.UNLOAD:
            loadDicom({
              index: position,
              nameDisplay: name_display,
              path: meta.getDicomFilePath(t, vessel, position, name_display),
              type: t,
              vessel,
            });
            window.__SK_DICOM_STATE__[t][vessel][name_display][position] =
              DICOM_STATE.LOADING;
            break;
          case DICOM_STATE.COMPLETE:
            this.generateAndDrawImage(vessel, name_display);
            break;
          case DICOM_STATE.ERROR:
            break;
          // no default
        }
        break;
      default:
        if (!window.__SK_DICOM_STATE__[t]) {
          window.__SK_DICOM_STATE__[t] = {};
        }

        if (!window.__SK_DICOM_STATE__[t][vessel]) {
          window.__SK_DICOM_STATE__[t][vessel] = Array(
            meta.getDicomFileCount(t, vessel)
          ).fill(DICOM_STATE.UNLOAD);
        }

        state = window.__SK_DICOM_STATE__[t][vessel][position];

        switch (state) {
          case DICOM_STATE.UNLOAD:
            loadDicom({
              index: position,
              path: meta.getDicomFilePath(t, vessel, position),
              type: t,
              vessel,
            });
            window.__SK_DICOM_STATE__[t][vessel][position] =
              DICOM_STATE.LOADING;
            this.setState({ dicomImageData: null, dicom: null });
            break;
          case DICOM_STATE.COMPLETE:
            this.generateAndDrawImage(vessel);
            break;
          case DICOM_STATE.ERROR:
            this.setState({ dicomImageData: null, dicom: null });
            break;
          // no default
        }
    }
  }

  // handleDoubleClick = () => {
  //   if (!this.state.dicomImageData) {
  //     return;
  //   }
  //   fireEvent ('getTransitionAndWWWL', null);
  //   this.props.openImgPreview (this.props.index);
  //   this.props.dispatch (
  //     printActions.changeSelectedSlices ([this.props.slice])
  //   );
  //   this.props.dispatch (
  //     printActions.changeLastClickSlices ([this.props.slice])
  //   );
  // };

  checkSliceIsActive(slice) {
    return (
      this.props.printSlice.selectedSlices.findIndex(
        item => item.key === slice.key
      ) >= 0
    );
  }

  onPanzoomUpdated = event => {
    if (!this.checkSliceIsActive(this.props.slice)) {
      return;
    }
    const { x, y, scale } = event.detail;
    const scale1 = this.state.scale + scale;
    const dx = x / (this.state.outerWidth * this.state.scale);
    const dy = y / (this.state.outerHeight * this.state.scale);
    this.setState({
      x: this.state.x + dx,
      y: this.state.y + dy,
      scale: scale1,
    });
  };

  getCurrentListTransitionAndWWWL = () => {
    const { printSlice, index, slice } = this.props;
    const { currentList } = printSlice;

    if (
      typeof index === 'number' &&
      currentList.size > 0 &&
      this.state.sliceHeight > 0 &&
      this.state.sliceWidth > 0
    ) {
      const matrix = this.getMatrix();
      const cur = currentList.get(index);
      if (
        JSON.stringify(matrix) !== JSON.stringify(cur.transition) ||
        slice.ww !== this.state.windowWidth ||
        slice.wl !== this.state.windowCenter
      ) {
        const newList = currentList.update(index, val => {
          val.transition = matrix;
          val.ww = this.state.windowWidth;
          val.wl = this.state.windowCenter;
          val.xyscale = [this.state.x, this.state.y, this.state.scale];
          return val;
        });
        this.props.dispatch(printActions.changeCurrentList(newList));
      }
    }
  };

  transformPoint(x, y, scale) {
    const { sliceHeight, sliceWidth, outerWidth } = this.state;
    const { printSlice, index } = this.props;
    const { currentList } = printSlice;
    if (!currentList.get(index) || !this.container.current) {
      return { x: 0, y: 0 };
    }
    if (this.props.isPreview) {
      const transition = currentList.get(index).transition;
      const sc = outerWidth / transition[4];
      return {
        x: transition[2] * sc,
        y: transition[3] * sc,
      };
    }
    const { clientHeight, clientWidth } = this.container.current;
    const sc = Math.min(clientWidth / sliceWidth, clientHeight / sliceHeight);
    this.initScale = sc;
    const x1 =
      (0.5 + scale * (0.5 - x)) * clientWidth - sliceWidth * scale * 0.5;
    const y1 =
      (0.5 + scale * (0.5 - y)) * clientHeight - sliceHeight * scale * 0.5;
    const x2 = 0.5 * clientWidth - sliceWidth * this.initScale * 0.5;
    const y2 = 0.5 * clientHeight - sliceHeight * this.initScale * 0.5;
    const x3 = (sliceWidth / 2) * (scale - this.initScale);
    const y3 = (sliceHeight / 2) * (scale - this.initScale);
    return {
      x: x1 - x2 + x3,
      y: y1 - y2 + y3,
    };
  }

  getMatrix() {
    if (!this.container.current || this.props.isPreview) {
      return;
    }
    const { x, y, scale } = this.state;
    const { clientHeight, clientWidth } = this.container.current;
    if (this.state.dicomImageData && scale && this.initScale) {
      const p1 = this.transformPoint(x, y, scale);
      return [
        scale / this.initScale,
        scale / this.initScale,
        p1.x,
        p1.y,
        clientWidth,
        clientHeight,
      ];
    } else {
      return [1, 1, 0, 0, clientWidth, clientHeight];
    }
  }

  initZoomScale = isResize => {
    const { sliceHeight, sliceWidth } = this.state;
    if (!this.container.current || this.props.isPreview) {
      return;
    }

    const { clientHeight, clientWidth } = this.container.current;
    this.setState({ outerWidth: clientWidth, outerHeight: clientHeight });

    const sc = Math.min(clientWidth / sliceWidth, clientHeight / sliceHeight);
    if (sc === Infinity) {
      return;
    }
    this.initScale = sc;
    const { slice, printSlice } = this.props;
    const { currentList } = printSlice;
    const i = currentList.findIndex(item => item.key === slice.key);
    const tmp = currentList.get(i).transition;
    const xyscale = currentList.get(i).xyscale;
    if (isResize) {
      this.setState({ x: 0.5, y: 0.5, scale: sc });
    }
    if (
      tmp &&
      clientWidth === tmp[4] &&
      clientHeight === tmp[5] &&
      typeof xyscale[0] === 'number' &&
      typeof xyscale[1] === 'number' &&
      typeof xyscale[2] === 'number'
    ) {
      this.setState({ x: xyscale[0], y: xyscale[1], scale: xyscale[2] });
    } else {
      this.setState({ scale: sc });
    }
  };

  render() {
    const {
      dicom,
      dicomImageData,
      sliceHeight,
      sliceWidth,
      outerHeight,
      outerWidth,
    } = this.state;
    const { operation, isPreview } = this.props;
    // const {metas} = this.props.printSlice;
    // const p1 = this.transformPoint (x, y, scale);
    // const isActive = this.checkSliceIsActive (slice);
    return (
      <div
        style={{
          width: `100%`,
          height: `100%`,
        }}
        ref={input => {
          this.container = input;
        }}
        onDoubleClick={this.handleDoubleClick}
        onMouseDown={e => (operation !== 'drag' ? e.preventDefault() : null)}
      >
        <button id="reset" type="button" className="btn btn-default">
          Reset
        </button>
        <button id="choose" type="button" className="btn btn-default">
          选择
        </button>
        <button id="select" type="button" className="btn btn-default">
          框选
        </button>
        <button id="unselect" type="button" className="btn btn-default">
          减选
        </button>
        <button id="length" type="button" className="btn btn-default">
          长度测量
        </button>
        <button id="EllipticalRoi" type="button" className="btn btn-default">
          区域测量
        </button>
        <button id="ArrowAnnotate" type="button" className="btn btn-default">
          箭头
        </button>
        <button id="RectangleRoi" type="button" className="btn btn-default">
          矩形
        </button>
        <button id="eraser" type="button" className="btn btn-default">
          橡皮擦
        </button>
        <button id="seg" type="button" className="btn btn-default">
          分割
        </button>
        <button id="invert" type="button" className="btn btn-default">
          Invert
        </button>
        <button id="zoom" type="button" className="btn btn-default">
          Zoom
        </button>
        <button id="ct" type="button" className="btn btn-default">
          CT值
        </button>
        <button id="next" type="button" className="btn btn-default">
          下一张
        </button>

        {dicom ? (
          <DicomCanvas
            ref={input => {
              this.dicomCanvas = input;
            }}
            dicom={dicom}
            sliceWidth={sliceWidth}
            sliceHeight={sliceHeight}
          />
        ) : (
          <img
            className="dicom-unit-placeholder"
            src={defaultImgUrl}
            alt="Dicom Unit"
          />
        )}
      </div>
    );
  }
}

export default DicomUnit;
