const _handlers = {};

export function publishHandleDoneMovingEvent(toolName, args) {
  if (_handlers[toolName]) {
    _handlers[toolName].forEach(handler => {
      handler(args);
    });
  }
}

export function subscribeHandleDoneMovingEvent(toolName, handler) {
  if (!_handlers[toolName]) {
    _handlers[toolName] = [];
  }

  _handlers[toolName].push(handler);
}

export function unSubscribeHandleDoneMovingEvent(toolName, handler) {
  const toolHandlers = _handlers[toolName];

  if (!toolHandlers) {
    return;
  }

  for (let index = toolHandlers.length - 1; index >= 0; index--) {
    if (toolHandlers[index] === handler) {
      toolHandlers.splice(index, 1);
    }
  }
}
