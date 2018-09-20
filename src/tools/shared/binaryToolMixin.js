function passiveCallback (element) {
  throw new Error('BinaryTool\'s may only be enabled or disabled.');
}

function activeCallback (element) {
  throw new Error('BinaryTool\'s may only be enabled or disabled.');
}

export default {
  passiveCallback,
  activeCallback
};
