import { expect } from 'chai';
import panZoomSynchronizer from '../../src/synchronization/panZoomSynchronizer.js';
import Synchronizer from '../../src/synchronization/Synchronizer.js';
import external from '../../src/externalModules.js';


describe('#panZoomSynchronization', function() {

  beforeEach(function () {
    // Arrange
    this.element1 = document.createElement('div');
    this.element2 = document.createElement('div');

    const height = 256;
    const width = 128;

    const getPixelData = () => new Uint8Array([0, 255, 255, 0]);

    this.image = {
      imageId: 'exampleImageId',
      minPixelValue: 0,
      maxPixelValue: 255,
      slope: 1.0,
      intercept: 0,
      windowCenter: 127,
      windowWidth: 256,
      getPixelData,
      rows: height,
      columns: width,
      height,
      width,
      color: false,
      columnPixelSpacing: 1.0,
      rowPixelSpacing: 0.5,
      sizeInBytes: width * height * 2
    };

    this.viewport = {
      scale: 1.0,
      translation: {
        x: 0,
        y: 0
      },
      voi: {
        windowWidth: 256,
        windowCenter: 127
      },
      invert: false,
      pixelReplication: false,
      rotation: 0,
      hflip: false,
      vflip: false
    };
  });

  it('ensures that two viewers have their viewports synchronized using a panZoomSynchronizer', function() {
    
    // Arrange
    cornerstone.enable(this.element1);
    cornerstone.displayImage(this.element1, this.image);
    cornerstone.enable(this.element2);
    cornerstone.displayImage(this.element2, this.image);

    const enabledElement1 = cornerstone.getEnabledElement(this.element1);
    const enabledElement2 = cornerstone.getEnabledElement(this.element2);

    enabledElement1.canvas.width = 256;
    enabledElement1.canvas.height = 256;
    enabledElement2.canvas.width = 256;
    enabledElement2.canvas.height = 256;

    cornerstone.setViewport(this.element1, this.viewport);
    cornerstone.setViewport(this.element2, this.viewport);

    let currentViewport1 = cornerstone.getViewport(this.element1);
    let currentViewport2 = cornerstone.getViewport(this.element2);
    expect(currentViewport1.scale).to.equal(currentViewport2.scale);

    // Act
    // Change the viewport for the first viewer
    currentViewport1.scale /= 2;
    cornerstone.setViewport(this.element1, currentViewport1);
    // Manually trigger the rendering on the first viewport
    var event = new Event('cornerstoneimagerendered', {viewport:currentViewport1});
    this.element1.dispatchEvent(event);
    // Ensure the second viewer is not updated
    currentViewport2 = cornerstone.getViewport(this.element2);
    expect(currentViewport1.scale).not.to.equal(currentViewport2.scale);

    // Add the synchronizer
    let testPanZoomSynchronizer = new Synchronizer("cornerstoneimagerendered", panZoomSynchronizer);
    testPanZoomSynchronizer.add(this.element1);
    testPanZoomSynchronizer.add(this.element2);

    // Update the first viewport
    currentViewport1.scale /= 2;
    cornerstone.setViewport(this.element1, currentViewport1);
    event = new Event('cornerstoneimagerendered', {viewport:currentViewport1});
    this.element1.dispatchEvent(event);
    // Ensure the second viewer is updated
    currentViewport2 = cornerstone.getViewport(this.element2);
    expect(currentViewport1.scale).to.equal(currentViewport2.scale);

    // Disable the synchronizer and ensure the scale change is not propagated.
    testPanZoomSynchronizer.enabled = false;
    currentViewport1.scale /= 2;
    cornerstone.setViewport(this.element1, currentViewport1);
    event = new Event('cornerstoneimagerendered', {viewport:currentViewport1});
    this.element1.dispatchEvent(event);
    // Ensure the second viewer is not updated
    currentViewport2 = cornerstone.getViewport(this.element2);
    expect(currentViewport1.scale).not.to.equal(currentViewport2.scale);
  });
});
