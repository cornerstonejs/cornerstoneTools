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
      configuration: {
        roundAngles: false,
        flipHorizontal: false,
        flipVertical: false,
      },
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
  const { roundAngles } = this.configuration;
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

  if (roundAngles) {
    angleInfo.angle = Math.ceil(angleInfo.angle);
  }
  if (angleInfo.direction < 0) {
    angleInfo.angle = -angleInfo.angle;
  }

  viewport.rotation = initialRotation + angleInfo.angle;
}

function horizontalStrategy(evt) {
  const { roundAngles, flipHorizontal } = this.configuration;
  const eventData = evt.detail;
  const { viewport, deltaPoints } = eventData;

  let angle = deltaPoints.page.x / viewport.scale;

  if (roundAngles) {
    angle = Math[angle > 0 ? 'ceil' : 'floor'](angle);
  }
  if (flipHorizontal) {
    angle = -angle;
  }

  viewport.rotation += angle;
}

function verticalStrategy(evt) {
  const { roundAngles, flipVertical } = this.configuration;
  const eventData = evt.detail;
  const { viewport, deltaPoints } = eventData;

  let angle = deltaPoints.page.y / viewport.scale;

  if (roundAngles) {
    angle = Math[angle > 0 ? 'ceil' : 'floor'](angle);
  }
  if (flipVertical) {
    angle = -angle;
  }

  viewport.rotation += angle;
}
