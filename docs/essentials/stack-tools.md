# Stack Tools

An image stack is collection of one or more images that are closely related.

The best example of this is a CT or MRI series. A stack can include all images in a series or a subset of them. A stack can even include images from different series in different studies. When changing images in a stack, Cornerstone will apply the existing viewport settings to the new image as well as any stack specific tool data. This would allow a user to zoom in on an image in a stack and then cine to subsequent images and stay zoomed in.


## Creating a stack

A Stack in Cornerstone is defined as an object with the following properties:

Property | Type | Meaning
------------ | ------------- | -------------
imageIds | Array | Array of Cornerstone imageIds
currentImageIdIndex | Number | Current index in the stack. This can be used to retrieve which slice the user is currently viewing.
Options | Stack Options (*optional*) | Options for the current Stack

### Stack Options
The list of available stack options are:

Property | Type | Meaning
------------ | ------------- | -------------
opacity | Number <br> (*optional*, default: 1) | The global alpha-level opacity of the images in the Stack. When set, this will change the display of the current stack.
visible | Boolean <br> (*optional*, default: true) | Whether or not the current stack should be visible when displayed in a composite set of images
name | String <br> (*optional*) | The name of the current stack, to be used when creating a new Cornerstone Layer for displaying this stack.
viewport | Viewport (*optional*) | Initial viewport settings for the current stack when displayed in a composite set of imageIds

### Usage
````javascript

// Define an array of Image IDs
const imageIds = [
    'example://1',
    'example://2',
    'example://3'
];

// Define the Stack object
const stack = {
    currentImageIdIndex : 0,
    imageIds: imageIds
};

// Enable the DOM Element for use with Cornerstone
cornerstone.enable(element);

// Load the first image in the stack
cornerstone.loadImage(imageIds[0]).then(function(image) {
    // Display the first image
    cornerstone.displayImage(element, image);

    // Add the stack tool state to the enabled element
    cornerstoneTools.addStackStateManager(element, ['stack']);
    cornerstoneTools.addToolState(element, 'stack', stack);
});
````
