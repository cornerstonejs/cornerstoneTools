export default function(evt, toolData, handle, interactionType = 'mouse') {
  if (interactionType === 'touch') {
    this.handleSelectedTouchCallback(evt);
  } else {
    this.handleSelectedMouseCallback(evt);
  }
}
