import {MESSAGE_TYPE} from './constants';
// @ts-ignore
import DicomWorker from './dicom.worker.js';
import {fireEvent} from './utils';

const worker = new DicomWorker ();

worker.onmessage = event => {
  const {index, msgType, nameDisplay, type, vessel} = event.data;

  switch (msgType) {
    case MESSAGE_TYPE.PARSE_ERROR:
      // 解析 dicom 过程中出错
      console.error ('Parse dicom error:', event.data);
      break;
    case MESSAGE_TYPE.PARSE_SUCCESS:
      //  已解析完 dicom 数据
      if (!window.__SK_DICOM_DATA__[type]) {
        window.__SK_DICOM_DATA__[type] = {};
      }

      if (!vessel) {
        window.__SK_DICOM_DATA__[type][index] = event.data.dicom;
      } else {
        if (!window.__SK_DICOM_DATA__[type][vessel]) {
          window.__SK_DICOM_DATA__[type][vessel] = {};
        }

        if (!nameDisplay) {
          window.__SK_DICOM_DATA__[type][vessel][index] = event.data.dicom;
        } else {
          if (!window.__SK_DICOM_DATA__[type][vessel][nameDisplay]) {
            window.__SK_DICOM_DATA__[type][vessel][nameDisplay] = {};
          }

          window.__SK_DICOM_DATA__[type][vessel][nameDisplay][index] =
            event.data.dicom;
        }
      }

      fireEvent ('dicomloaded', {index, nameDisplay, type, vessel, msgType});
      break;
    // no default
  }
};

export const loadDicom = ({index, nameDisplay, path, type, vessel}) => {
  worker.postMessage ({
    index,
    nameDisplay,
    path,
    type,
    vessel,
  });
};
