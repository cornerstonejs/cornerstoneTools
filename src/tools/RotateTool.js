import external from './../externalModules.js';
import BaseTool from './base/BaseTool.js';
import angleBetweenPoints from '../util/angleBetweenPoints.js';
import MouseCursor from '../util/MouseCursor.js';
import mouseCursorPoints from '../util/mouseCursorPoints.js';

const rotateCursor = new MouseCursor(
  `
  <svg data-icon="pan" role="img" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1792 1792">
    <path fill="#ffffff" d="M1664 256v448q0 26-19 45t-45 19h-448q-42 0-59-40-17-39 14-69l138-138q-148-137-349-137-104 0-198.5 40.5t-163.5 109.5-109.5 163.5-40.5 198.5 40.5 198.5 109.5 163.5 163.5 109.5 198.5 40.5q119 0 225-52t179-147q7-10 23-12 15 0 25 9l137 138q9 8 9.5 20.5t-7.5 22.5q-109 132-264 204.5t-327 72.5q-156 0-298-61t-245-164-164-245-61-298 61-298 164-245 245-164 298-61q147 0 284.5 55.5t244.5 156.5l130-129q29-31 70-14 39 17 39 59z"/>
  </svg>
  `,
  mouseCursorPoints.center32
);

/**
 * @public
 * @class RotateTool
 * @memberof Tools
 *
 * @classdesc Tool for rotating the image.
 * @extends Tools.Base.BaseTool
 */
export default class RotateTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Rotate',
      strategies: {
        default: defaultStrategy,
        horizontal: horizontalStrategy,
        vertical: verticalStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.svgCursor = rotateCursor;

    this.initialConfiguration = initialConfiguration;
  }

  touchDragCallback(evt) {
    this.dragCallback(evt);
  }

  mouseDragCallback(evt) {
    this.dragCallback(evt);
  }

  postMouseDownCallback(evt) {
    this.initialRotation = evt.detail.viewport.rotation;
  }

  dragCallback(evt) {
    evt.detail.viewport.initialRotation = this.initialRotation;
    this.applyActiveStrategy(evt, this.configuration);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}

const defaultStrategy = evt => {
  const eventData = evt.detail;
  const { element, viewport } = eventData;
  const initialRotation = viewport.initialRotation;

  // Calculate the center of the image
  const rect = element.getBoundingClientRect(element);
  const { clientWidth: width, clientHeight: height } = element;

  const initialPoints = {
    x: eventData.startPoints.client.x,
    y: eventData.startPoints.client.y,
  };
  const { scale, translation } = viewport;
  const centerPoints = {
    x: rect.left + width / 2 + translation.x * scale,
    y: rect.top + height / 2 + translation.y * scale,
  };

  const currentPoints = {
    x: eventData.currentPoints.client.x,
    y: eventData.currentPoints.client.y,
  };

  const angleInfo = angleBetweenPoints(
    centerPoints,
    initialPoints,
    currentPoints
  );

  if (angleInfo.direction < 0) {
    angleInfo.angle = -angleInfo.angle;
  }

  viewport.rotation = initialRotation + angleInfo.angle;
};

const horizontalStrategy = evt => {
  const eventData = evt.detail;
  const { viewport, deltaPoints } = eventData;

  viewport.rotation += deltaPoints.page.x / viewport.scale;
};

const verticalStrategy = evt => {
  const eventData = evt.detail;
  const { viewport, deltaPoints } = eventData;

  viewport.rotation += deltaPoints.page.y / viewport.scale;
};
