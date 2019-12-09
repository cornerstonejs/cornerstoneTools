import React from 'react';
import ReactDOM from 'react-dom';
// import {loadDicom} from './dicom';
// import dicomParser from 'dicom-parser';

import DicomUnit from './DicomUnit';

const imageId =
  // 'http://localhost:8000/files/slices/0000.dcm';
  'wadouri:http://localhost:8000/files/1.dcm';

const divStyle = {
  width: '80%',
  height: '500px',
  position: 'relative',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
};

class CornerstoneElement extends React.Component {
  render () {
    return (
      <div
        style={divStyle}
        ref={input => {
          this.element = input;
        }}
      >
        <DicomUnit />
      </div>
    );
  }
}

const App = () => (
  <div>
    <h2>DicomTools React Component Example</h2>
    <CornerstoneElement />
  </div>
);

const container = document.createElement ('div');
document.body.appendChild (container);

ReactDOM.render (<App />, container);
