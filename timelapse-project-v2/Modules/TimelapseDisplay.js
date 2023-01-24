"use strict";

/**
 * 
 * @param {string} name name of the dataset
 * @param {string} id display id
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 * @param {p5.Element} parent the intended parent element for the display
 * @param {number} width width dimension of the display
 * @param {number} height height dimension of the display
 * @param {number} offset offset of the master slider upon creation
 */
function TimelapseDisplay(name, id, frames, timestamps, images, parent, width, height, offset=0) {
    this.name = name;
    this.id = id;
    this.frames = frames;
    this.timestamps = timestamps;
    this.images = images;

    this.width = width;
    this.height = height;
    this.imgIdx = 0;
    this.offset = offset;

    this.display = createElementWithID("div", "", id, "display");
    this.display.parent(parent);

    let density = window.pixelDensity();

    /* Dataset name text p5 element */
    this.nameText = createGraphics(this.width * density, 30 * density);
    this.nameText.fill(0);
    this.nameText.textAlign(LEFT);
    this.nameText.textSize(24);
    this.nameText.strokeWeight(1);
    this.nameText.stroke(255);
    this.nameText.text("/"+ this.name, 10, 22);

    /* Current timestamp text p5 element */
    this.timestamp = createGraphics(this.width * density, 30 * density);
    this.timestamp.fill(0);
    this.timestamp.textAlign(RIGHT);
    this.timestamp.textSize(24);
    this.timestamp.strokeWeight(1);
    this.timestamp.stroke(255);

    /* Title bar p5 element to contain dataset name and current timestamp */
    this.titleBar = createGraphics(this.width, 30);
    this.titleBar.parent(this.display);
    this.titleBar.show();

    /* Image window to contain currently displayed image */
    this.imageWindow = createGraphics(this.width, this.height);
    this.imageWindow.parent(this.display);
    this.imageWindow.show();

    /* Timelapse display slider to control image index */
    this.slider = createInput("", "range");
    this.slider.class("slider");
    this.slider.input((e) => this.setIndex(parseInt(e.target.value)));
    this.slider.elt.max = this.images.length - 1;
    this.slider.parent(this.display);

    this.setIndex(0);
}

/** Getter function for the object's name attribute. */
TimelapseDisplay.prototype.getName = function () {
    return this.name;
}

/** Getter function for the object's id attribute. */
TimelapseDisplay.prototype.getId = function () {
    return this.id;
}

/** Setter function for the object's imgIdx attribute. */
TimelapseDisplay.prototype.setIndex = function(newIndex) {
    if (newIndex < 0) {
        this.imgIdx = 0;
    } else if (newIndex >= this.images.length) {
        this.imgIdx = this.images.length - 1;
    } else {
        this.imgIdx = newIndex;
    }
    this.slider.value(this.imgIdx);
    this.timestamp.clear();
    this.timestamp.text(this.timestamps[this.imgIdx], this.width, 22);
}

/**
 * Update the image index using a slider offset.
 * Used to give state mutability to master slider.
 * @param {number} offset offset value to compare with the displays current offset value.
 */
TimelapseDisplay.prototype.setIndexFromOffset = function(offset) {
    this.setIndex(this.imgIdx + (offset - this.offset));
    this.offset = offset;
}

/**
 * Draw function called in every draw loop.
 */
TimelapseDisplay.prototype.draw = function () {
    /* Draw titleBar */
    this.titleBar.clear();
    this.titleBar.image(this.nameText, 0, 0, this.width, 30);
    this.titleBar.image(this.timestamp, this.width / 2, 0, this.width, 30);

    /* Draw imageWindow */
    this.imageWindow.clear();
    this.imageWindow.noStroke();
    this.imageWindow.fill(255);
    this.imageWindow.image(this.images[this.imgIdx], 0, 0, this.width, this.height);
}