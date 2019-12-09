import 'whatwg-fetch';
import {DicomDataLoader} from '@sk/dicom-parser';

import {MESSAGE_TYPE} from './constants';

const dicomDataLoader = new DicomDataLoader ();

dicomDataLoader.onload = data => {
  self.postMessage ({
    ...data,
    msgType: MESSAGE_TYPE.PARSE_SUCCESS,
  });
};

dicomDataLoader.onerror = data => {
  self.postMessage ({
    ...data,
    msgType: MESSAGE_TYPE.PARSE_ERROR,
  });
};

self.onmessage = event => {
  const {index, nameDisplay, path, type, vessel} = event.data;

  fetch (path, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    method: 'GET',
    credentials: 'include',
  }).then (data => {
    if (data.status === 404) {
      self.postMessage ({
        error: `影像未找到，路径为 ${path}`,
        index,
        nameDisplay,
        type,
        vessel,
        msgType: MESSAGE_TYPE.PARSE_ERROR,
      });
    } else {
      data.arrayBuffer ().then (dicom => {
        dicomDataLoader.load (dicom, {
          index,
          nameDisplay,
          type,
          vessel,
        });
      });
    }
  });
};
