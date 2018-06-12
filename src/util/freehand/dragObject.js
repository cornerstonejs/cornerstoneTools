import { freehand } from '../../imageTools/freehand.js';
import freeHandIntersect from './freeHandIntersect.js';

/**
* Moves a part of the freehand tool whilst it is dragged by the mouse.
*
* @param {Object} currentHandle - The handle being dragged.
* @param {Object} data - The data associated with the freehand tool being modified.
* @modifies {currentHandle|data}
*/
export default function (currentHandle, data) {
  const config = freehand.getConfiguration();

  if (config.movingTextBox) {
    dragTextBox(currentHandle);
  }

  if (config.modifying) {
    dragHandle(currentHandle, data);
  }
}

/**
* Moves a freehand tool's textBox whilst it is dragged by the mouse.
*
* @param {Object} currentHandle - The handle being dragged.
* @modifies {currentHandle}
*/
function dragTextBox (currentHandle) {
  const config = freehand.getConfiguration();

  currentHandle.hasMoved = true;
  currentHandle.x = config.mouseLocation.handles.start.x;
  currentHandle.y = config.mouseLocation.handles.start.y;
}

/**
* Moves a handle of the freehand tool whilst it is dragged by the mouse.
*
* @param {Object} currentHandle - The handle being dragged.
* @param {Object} data - The data associated with the freehand tool being modified.
* @modifies {data}
*/
function dragHandle (currentHandle, data) {
  const config = freehand.getConfiguration();

  data.handles.invalidHandlePlacement = freeHandIntersect.modify(data.handles, currentHandle);
  data.active = true;
  data.highlight = true;
  data.handles[currentHandle].x = config.mouseLocation.handles.start.x;
  data.handles[currentHandle].y = config.mouseLocation.handles.start.y;
  if (currentHandle) {
    const lastLineIndex = data.handles[currentHandle - 1].lines.length - 1;
    const lastLine = data.handles[currentHandle - 1].lines[lastLineIndex];

    lastLine.x = config.mouseLocation.handles.start.x;
    lastLine.y = config.mouseLocation.handles.start.y;
  }
}
