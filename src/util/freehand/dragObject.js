import { freehand } from '../../imageTools/freehand.js';

export default function (currentHandle, data) {
  const config = freehand.getConfiguration();

  if (config.movingTextBox) {
    dragTextBox(currentHandle);
  }

  if (config.modifying) {
    dragHandle(currentHandle, data);
  }
}

function dragTextBox (currentHandle) {
  const config = freehand.getConfiguration();

  currentHandle.hasMoved = true;
  currentHandle.x = config.mouseLocation.handles.start.x;
  currentHandle.y = config.mouseLocation.handles.start.y;
}

function dragHandle (currentHandle, data) {
  const config = freehand.getConfiguration();

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
