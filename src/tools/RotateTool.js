import external from './../externalModules.js';
import BaseTool from './base/BaseTool.js';
import angleBetweenPoints from '../util/angleBetweenPoints.js';
import { rotateCursor } from './cursors/index.js';

/**
 * @public
 * @class RotateTool
 * @memberof Tools
 *
 * @classdesc Tool for rotating the image.
 * @extends Tools.Base.BaseTool
 */
export default class RotateTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Rotate',
      strategies: {
        default: defaultStrategy,
        horizontal: horizontalStrategy,
        vertical: verticalStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: rotateCursor,
    };

    super(props, defaultProps);
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
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}

function defaultStrategy(evt) {
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
}

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
