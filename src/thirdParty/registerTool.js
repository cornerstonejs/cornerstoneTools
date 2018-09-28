import { tools } from './index.js';

/**
 * Register a tool.
 *
 * @param  {Object} NewTool The tool to register.
 * @param {string} name The name of the mixin.
 */
export default function (NewTool, name) {

  if (isToolNameRegistered(name)) {
    console.warn(`A tool with the name ${name} is already registered`);

    return;
  }

  tools[name] = NewTool;
}

function isToolNameRegistered (name) {
  return Object.keys(tools).some((toolName) => {
    return toolName === name;
  });
}
