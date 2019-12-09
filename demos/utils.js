import 'whatwg-fetch';
import Cookie from 'js-cookie';
import {oc} from 'ts-optchain';
import debounce from 'lodash.debounce';
import {parse, stringify} from 'query-string';

import {
  DICOM_TYPE,
  DICOM_TYPE_INDEX,
  SNAME_TYPE_MAP,
  VR_SERIAL,
  WindowLevelValue,
} from './constants';

export const noop = function () {
  return null;
};

export const isProduction = function () {
  return process.env.NODE_ENV === 'production';
};

export const isOffline = function () {
  return process.env.PLT_ENV === 'offline';
};

export const setUrlParams = function (params, basePath = '/') {
  if (!Array.isArray (params)) {
    return;
  }

  const qs = parse (window.location.search);

  params.forEach (param => {
    qs[param.key] = param.value;
  });

  window.history.pushState (null, null, `${basePath}?${stringify (qs)}`);
};

export const removeUrlParam = function (params, basePath = '/') {
  if (!Array.isArray (params)) {
    return;
  }

  const qs = parse (window.location.search);

  params.forEach (param => {
    delete qs[param];
  });

  const str = stringify (qs);

  window.history.pushState (null, null, str ? `${basePath}?${str}` : basePath);
};

export const fireEvent = function (eventName, data, target = document.body) {
  const event = new CustomEvent (eventName, {
    detail: data,
    bubbles: true,
    cancelable: false,
  });

  target.dispatchEvent (event);
};

export const formatWindowLevelValue = function (val) {
  if (val > WindowLevelValue.VALUE_MAX) {
    return WindowLevelValue.VALUE_MAX;
  }

  if (val < WindowLevelValue.VALUE_MIN) {
    return WindowLevelValue.VALUE_MIN;
  }

  return val;
};

export const isLoggedIn = function () {
  return !!Cookie.get ('token');
};

export const getCaseId = function () {
  const globalScope = typeof window === 'undefined' ? self : window;
  return parse (globalScope.location.search).caseId;
};

export const disableHeader = function () {
  const globalScope = typeof window === 'undefined' ? self : window;
  return !!parse (globalScope.location.search).disableHeader;
};

export const bindResizeEvent = function (callback, noArgs) {
  const optimized = noArgs
    ? debounce (() => callback (), 100)
    : debounce (callback, 100);
  window.addEventListener ('resize', optimized);

  return function unbindResizeHandler () {
    window.removeEventListener ('resize', optimized);
  };
};

export const disableRefreshFromKeyboard = function (e) {
  const keycode = e.keyCode || e.which;

  if (keycode === 116) {
    e.preventDefault ();
  }
};

export const disableBackSpaceKeyboard = function (e) {
  const ev = e || window.event;
  const obj = ev.target || ev.srcElement;
  const t = obj.type || obj.getAttribute ('type');

  if (ev.keyCode === 8 && ['password', 'text', 'textarea'].indexOf (t) === -1) {
    ev.returnValue = false;
  }
};

export const disableMousewheelEvent = function () {
  const event = /Firefox/i.test (navigator.userAgent)
    ? 'DOMMouseScroll'
    : 'mousewheel';

  function scrollFunc (e = window.event) {
    if (e.wheelDelta && e.ctrlKey) {
      // IE/Opera/Chrome
      e.returnValue = false;
    } else if (e.detail) {
      // Firefox
      e.returnValue = false;
    }
  }

  if (typeof document.addEventListener === 'function') {
    document.addEventListener (event, scrollFunc, false);
  }

  window.onmousewheel = document.onmousewheel = scrollFunc;
};

// Copy from https://github.com/graingert/datauritoblob
export const dataURItoBlob = function (dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob (dataURI.split (',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split (',')[0].split (':')[1].split (';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer (byteString.length);
  const dv = new DataView (ab);

  for (let i = 0; i < byteString.length; i++) {
    dv.setUint8 (i, byteString.charCodeAt (i));
  }

  return new Blob ([ab], {type: mimeString});
};

export const isMac = function () {
  return navigator.platform.includes ('Mac');
};

export const isWebglAvailable = function () {
  try {
    const canvas = document.createElement ('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext ('webgl') ||
        canvas.getContext ('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

export const isOffscreenCanvasAvailable = function () {
  return 'OffscreenCanvas' in window;
};

export const getDefaultVrSerialShown = function () {
  if (!isWebglAvailable ()) {
    return [...VR_SERIAL].filter (i => i !== 'VR');
  }

  return [...VR_SERIAL];
};

export const is3DVr = function (selectedVrSerial) {
  return selectedVrSerial === VR_SERIAL[0];
};

export const getImageFromUrl = url => {
  // For Chrome 49 compatibility in Windows xp
  // https://developers.google.com/web/updates/2016/03/createimagebitmap-in-chrome-50
  if (!('createImageBitmap' in window)) {
    return new Promise (resolve => {
      const image = new Image ();

      image.onload = () => {
        resolve (image);
      };

      image.src = url;
    });
  }

  return new Promise (resolve => {
    fetch (url, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      method: 'GET',
      credentials: 'include',
    })
      .then (res => res.blob ())
      .then (blob => createImageBitmap (blob))
      .then (image => {
        resolve (image);
      });
  });
};

// 把 dicom 文件路径根据规则转换成对应的 png/jpg 文件路径
export const ppFromDp = function (dp) {
  return dp.replace (/_dcm/, '').replace (/\.dcm$/, '.png');
};

export const isValidIP = function (ip) {
  // eslint-disable-next-line
  const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  return reg.test (ip);
};

export const computeOrientation = function (direction) {
  const orientationX = +direction[0] > 0 ? 'L' : 'R';
  const orientationY = +direction[1] > 0 ? 'P' : 'A';
  const orientationZ = +direction[2] > 0 ? 'S' : 'I';
  let orientation = '';

  if (+direction[0] !== 0) {
    orientation += orientationX;
  }

  if (+direction[1] !== 0) {
    orientation += orientationY;
  }

  if (+direction[2] !== 0) {
    orientation += orientationZ;
  }

  return orientation;
};

export const computeDirection = function (directionCos) {
  const direction = ['L', 'R', 'P', 'A', 'S', 'I'];
  const Xdirection = directionCos.slice (0, 3);
  const Ydirection = directionCos.slice (3);

  const right = computeOrientation (Xdirection);
  const bottom = computeOrientation (Ydirection);
  let top = '';
  let left = '';

  for (let i = 0; i < right.length; i++) {
    const pos = direction.indexOf (right.charAt (i));

    if (pos % 2 === 0) {
      left += direction[pos + 1];
    } else {
      left += direction[pos - 1];
    }
  }

  for (let i = 0; i < bottom.length; i++) {
    const pos = direction.indexOf (bottom.charAt (i));

    if (pos % 2 === 0) {
      top += direction[pos + 1];
    } else {
      top += direction[pos - 1];
    }
  }

  return {
    left,
    right,
    top,
    bottom,
  };
};

export const getMeasureInfoPosition = function (
  currentShape,
  scale,
  sliceHeight,
  sliceWidth
) {
  // the size of measureInfo is 120 x 92
  // this.state.scale - slice, cpr
  // this.scale - straight, shortaxis
  const measureInfoSize = {
    width: 120,
    height: 92,
  };
  const shapeRight = Math.max (
    currentShape.x,
    currentShape.x + currentShape.width
  );
  const shapeLeft = Math.min (
    currentShape.x,
    currentShape.x + currentShape.width
  );
  const shapeTop = Math.min (
    currentShape.y,
    currentShape.y + currentShape.height
  );
  const shapeBottom = Math.max (
    currentShape.y,
    currentShape.y + currentShape.height
  );

  const shapeToRight = (sliceWidth - shapeRight) * scale;
  const shapeToLeft = shapeLeft * scale;
  const shapeToBottom = (sliceHeight - shapeBottom) * scale;

  let x;
  let y;

  if (shapeToRight >= measureInfoSize.width) {
    // right
    x = shapeRight;
  } else if (shapeToLeft >= measureInfoSize.width) {
    // left
    x = shapeLeft - (measureInfoSize.width + 10) / scale;
  } else {
    // inside the shape, by default at the right side
    x = shapeRight - (measureInfoSize.width + 10) / scale;
  }

  if (shapeToBottom >= measureInfoSize.height) {
    // bottom
    y = shapeBottom;
  } else {
    // top
    y = shapeTop;
  }

  return {x, y};
};

export const checkDicomInPrint = function (list, vessel, position, type) {
  if (list.size < 1) {
    return false;
  }

  let newType;
  let isVrSerial = false;

  switch (type) {
    case DICOM_TYPE.ORIGIN:
      newType = DICOM_TYPE_INDEX.ORIGIN_SERIES;
      break;
    case DICOM_TYPE.CPR:
      newType = DICOM_TYPE_INDEX.CPR_SERIES;
      break;
    case DICOM_TYPE.STRAIGHT:
      newType = DICOM_TYPE_INDEX.LUMEN_SERIES;
      break;
    case DICOM_TYPE.AXIS:
      newType = DICOM_TYPE_INDEX.XSECTION_SERIES;
      break;
    case 'STD':
      newType = DICOM_TYPE_INDEX.VR_SERIES;
      isVrSerial = true;
      break;
    case 'STD_MYO':
      newType = DICOM_TYPE_INDEX.VR_SERIES_MYO;
      isVrSerial = true;
      break;
    case 'MIP':
      newType = DICOM_TYPE_INDEX.VR_SERIES_MIP;
      isVrSerial = true;
      break;
    default:
      newType = DICOM_TYPE_INDEX.ORIGIN_SERIES;
      break;
  }

  const index = list.findIndex (obj => {
    if (type === DICOM_TYPE.ORIGIN || isVrSerial) {
      return obj.position === position && obj.type === newType;
    }

    return (
      obj.vessel === vessel && obj.position === position && obj.type === newType
    );
  });

  return index >= 0;
};

export const updatePrintList = function (
  list,
  vessel,
  position,
  type,
  printVrSetting
) {
  let newList = list;
  let isVrSerial = false;
  let newType;

  switch (type) {
    case DICOM_TYPE.ORIGIN:
      newType = DICOM_TYPE_INDEX.ORIGIN_SERIES;
      break;
    case DICOM_TYPE.CPR:
      newType = DICOM_TYPE_INDEX.CPR_SERIES;
      break;
    case DICOM_TYPE.STRAIGHT:
      newType = DICOM_TYPE_INDEX.LUMEN_SERIES;
      break;
    case DICOM_TYPE.AXIS:
      newType = DICOM_TYPE_INDEX.XSECTION_SERIES;
      break;
    case 'STD':
      newType = DICOM_TYPE_INDEX.VR_SERIES;
      isVrSerial = true;
      break;
    case 'STD_MYO':
      newType = DICOM_TYPE_INDEX.VR_SERIES_MYO;
      isVrSerial = true;
      break;
    case 'MIP':
      newType = DICOM_TYPE_INDEX.VR_SERIES_MIP;
      isVrSerial = true;
      break;
    default:
      return;
  }
  let index = -1;
  if (isVrSerial || type === DICOM_TYPE.ORIGIN) {
    index = newList.findIndex (
      obj => obj.position === position && obj.type === newType
    );
  } else {
    index = newList.findIndex (
      obj =>
        obj.vessel === vessel &&
        obj.position === position &&
        obj.type === newType
    );
  }
  // const caseId = getCaseId();

  if (index >= 0) {
    if (isVrSerial) {
      const vrlist = newList.filter (
        obj => obj.position === position && obj.type === newType
      );
      vrlist.forEach (() => {
        index = newList.findIndex (
          obj => obj.position === position && obj.type === newType
        );
        newList = newList.delete (index);
      });
    } else {
      newList = newList.delete (index);
    }
  } else {
    if (isVrSerial) {
      if (newType === DICOM_TYPE_INDEX.VR_SERIES_MIP) {
        newList = newList.push ({
          type: newType,
          vessel: '',
          position,
          name_display: '',
          transition: [1, 1, 0, 0, 0, 0],
        });
      } else {
        for (let i = 0; i < printVrSetting[newType].length; i++) {
          newList = newList.push ({
            type: newType,
            vessel: '',
            position,
            name_display: printVrSetting[newType][i], // NAME_DISPLAY 取值
            transition: [1, 1, 0, 0, 0, 0],
          });
        }
      }
    } else {
      newList = newList.push ({
        type: newType,
        vessel,
        position,
        name_display: '',
        transition: [1, 1, 0, 0, 0, 0],
      });
    }
  }
  newList = newList.map ((val, i) => {
    return {
      ...val,
      index: i,
      key: `${i}`,
      metaKey: `${val.name_display ? val.name_display : ''}-${val.position ? val.position : ''}-${val.type ? val.type : ''}-${val.vessel ? val.vessel : ''}`,
    };
  });
  return newList;
};

export const getInitVessel = function (meta) {
  const {original_report, report, vessels} = meta;
  const effectiveReport = report || original_report;
  const visibleVessel = vessels.find (v => v.visible);
  // 默认选中第一个血管
  const visibleVesselOC = oc (visibleVessel);
  const vesselsOC = oc (vessels[0]);
  let initVessel = visibleVesselOC.vessel () || vesselsOC.vessel () || '';

  if (!effectiveReport) {
    return initVessel;
  }

  // 获得可显示血管的显示顺序，从原始数据中按顺序寻找到第一个有病灶的血管
  for (const v of vessels) {
    if (!v.visible) {
      continue;
    }

    const ocReport = oc (effectiveReport);
    const ocV = oc (v);
    const item = ocReport.vessels[ocV.vessel ()] ();

    if (!item) {
      continue;
    }

    for (const subvessels of Object.values (item)) {
      for (const i of subvessels) {
        if (i.bridge || i.stent || i.plaque || i.straitness) {
          return v.vessel;
        }
      }
    }
  }

  return initVessel;
};

export const getTypeIndexFromType = function (type, vrSerial) {
  switch (type) {
    case DICOM_TYPE.AXIS:
      return DICOM_TYPE_INDEX.XSECTION_SERIES;
    case DICOM_TYPE.CPR:
      return DICOM_TYPE_INDEX.CPR_SERIES;
    case DICOM_TYPE.ORIGIN:
      return DICOM_TYPE_INDEX.ORIGIN_SERIES;
    case DICOM_TYPE.STRAIGHT:
      return DICOM_TYPE_INDEX.LUMEN_SERIES;
    case DICOM_TYPE.VR_MIP:
      switch (vrSerial) {
        case MIP_SERIAL[0]:
          return DICOM_TYPE_INDEX.VR_SERIES_MIP;
        case MIP_SERIAL[1]:
          return DICOM_TYPE_INDEX.VR_SERIES_INVERT_MIP;
        // no default
      }
      break;
    case DICOM_TYPE.VR_INVERT_MIP:
      return DICOM_TYPE_INDEX.VR_SERIES_INVERT_MIP;
    case DICOM_TYPE.DSA:
      return DICOM_TYPE_INDEX.DSA;
    case DICOM_TYPE.VR:
      switch (vrSerial) {
        case VR_SERIAL[1]:
          return DICOM_TYPE_INDEX.VR_SERIES_MYO;
        case VR_SERIAL[2]:
          return DICOM_TYPE_INDEX.VR_SERIES;
        case VR_SERIAL[3]:
          return DICOM_TYPE_INDEX.VR_SERIES_MIP;
        case VR_SERIAL[4]:
          return DICOM_TYPE_INDEX.VR_SERIES_INVERT_MIP;
        // no default
      }
      break;
    case DICOM_TYPE.COMBINE:
      return DICOM_TYPE_INDEX.COMBINE;
    case DICOM_TYPE.ROI:
      return DICOM_TYPE_INDEX.ROI;
    // no default
  }

  return -1;
};

export const getTypeFromTypeIndex = function (index) {
  switch (index) {
    case DICOM_TYPE_INDEX.VR_SERIES:
    case DICOM_TYPE_INDEX.VR_SERIES_MIP:
    case DICOM_TYPE_INDEX.VR_SERIES_MYO:
      return DICOM_TYPE.VR;
    default:
      return SNAME_TYPE_MAP[index];
  }
};

export const getPrintData = (printLayout, currentList) => {
  let i = 0;
  let start = 0;
  let printData = [];
  let end;
  do {
    const pageCapacity = printLayout[i]
      ? printLayout[i][0] * printLayout[i][1]
      : printLayout[printLayout.length - 1][0] *
          printLayout[printLayout.length - 1][1];
    const layout = printLayout[i]
      ? printLayout[i]
      : printLayout[printLayout.length - 1];
    end = start + pageCapacity <= currentList.length
      ? start + pageCapacity
      : currentList.length;
    const pageValue = currentList.slice (start, end);
    start = end;
    if (pageValue.length > 0) {
      printData.push ({
        value: pageValue,
        layout: layout,
      });
    }
    i++;
  } while (currentList.length > end);
  return printData;
};

export const getSliceCurrentPage = (index, printData) => {
  let page = -1;
  printData.forEach ((obj, i) => {
    if (obj.value.find (val => val.index === index)) {
      page = i;
    }
  });
  return page;
};
