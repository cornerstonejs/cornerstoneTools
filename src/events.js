const EVENTS = {
  // Mouse events
  MOUSE_DOWN: 'cornerstonetoolsmousedown',
  MOUSE_UP: 'cornerstonetoolsmouseup',
  MOUSE_DOWN_ACTIVATE: 'cornerstonetoolsmousedownactivate',
  MOUSE_DRAG: 'cornerstonetoolsmousedrag',
  MOUSE_MOVE: 'cornerstonetoolsmousemove',
  MOUSE_CLICK: 'cornerstonetoolsmouseclick',
  MOUSE_DOUBLE_CLICK: 'cornerstonetoolsmousedoubleclick',
  MOUSE_WHEEL: 'cornerstonetoolsmousewheel',

  // Touch events
  TOUCH_START: 'cornerstonetoolstouchstart',
  TOUCH_START_ACTIVE: 'cornerstonetoolstouchstartactive',
  TOUCH_END: 'cornerstonetoolstouchend',
  TOUCH_DRAG: 'cornerstonetoolstouchdrag',
  TOUCH_DRAG_END: 'cornerstonetoolstouchdragend',
  TOUCH_PINCH: 'cornerstonetoolstouchpinch',
  TOUCH_ROTATE: 'cornerstonetoolstouchrotate',
  TOUCH_PRESS: 'cornerstonetoolstouchpress',
  TAP: 'cornerstonetoolstap',
  DOUBLE_TAP: 'cornerstonetoolsdoubletap',
  MULTI_TOUCH_START: 'cornerstonetoolsmultitouchstart',
  MULTI_TOUCH_START_ACTIVE: 'cornerstonetoolsmultitouchstartactive',
  MULTI_TOUCH_DRAG: 'cornerstonetoolsmultitouchdrag',

  // Keyboard events
  KEY_DOWN: 'cornerstonetoolskeydown',
  KEY_UP: 'cornerstonetoolskeyup',
  KEY_PRESS: 'cornerstonetoolskeypress',

  // Measurement / tool events
  MEASUREMENT_ADDED: 'cornerstonetoolsmeasurementadded',
  MEASUREMENT_MODIFIED: 'cornerstonetoolsmeasurementmodified',
  MEASUREMENT_REMOVED: 'cornerstonemeasurementremoved',
  MEASUREMENT_COMPLETED: 'cornerstonemeasurementcompleted',
  TOOL_DEACTIVATED: 'cornerstonetoolstooldeactivated',
  CLIP_STOPPED: 'cornerstonetoolsclipstopped',
  STACK_SCROLL: 'cornerstonestackscroll', // Should be renamed

  LINE_SAMPLE_UPDATED: 'cornerstonelinesampleupdated'
};

export default EVENTS;
