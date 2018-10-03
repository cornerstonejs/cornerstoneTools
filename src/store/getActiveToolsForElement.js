export default function (element, tools, handlerType) {
  return tools.filter(
    (tool) =>
      tool.element === element &&
      tool.mode === 'active' &&
      (handlerType === undefined || tool.options[`is${handlerType}Active`])
  );
}
