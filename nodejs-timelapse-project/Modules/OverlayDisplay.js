"use strict";

/**
 * 
 * @param {string} id display id
 * @param {Array<p5.Image>} images array of loaded p5 images
 * @param {Array<p5.Image} mono_images array of loaded p5 monochrome images
 * @param {p5.Element} parent the intended parent element for the display
 * @param {number} width width dimension of the display
 * @param {number} height height dimension of the display
 */
function OverlayDisplay(id, images, mono_images, parent, width, height) {
    this.images = images;
    this.mono_images = mono_images;

    this.width = width;
    this.height = height;

    this.imgIdx = 0;
    this.monoIdx = 0;

    this.display = createElementWithID("div", "", id, "display");
    this.display.parent(parent);

    /* Image window to contain the currently displayed overlay images */
    this.imageWindow = createGraphics(this.width, this.height);
    this.imageWindow.parent(this.display);
    this.imageWindow.show();

    /* Overlay display custom scrollbar to control image indices */
    this.scrollbar = new Scrollbar(this.width, 30, this.id, this.display);
    for (let i = 0; i < this.images.length; i++) {
        this.scrollbar.addSegment(i);
    }
    this.scrollbar.updateParameters(this.width, 30);
}

/** Getter function for the object's id attribute. */
OverlayDisplay.prototype.getId = function () {
    return this.id;
}

/** Getter function for the object's imgIdx attribute. */
OverlayDisplay.prototype.getIndex = function () {
    return this.imgIdx;
}

/** Getter function for the object's monoIdx attribute. */
OverlayDisplay.prototype.getMonoIndex = function () {
    return this.monoIdx;
}

/** Setter function for the object's imgIdx attribute. */
OverlayDisplay.prototype.setIndex = function(newIndex) {
    if (newIndex < 0) {
        this.imgIdx = 0;
    } else if (newIndex >= this.images.length) {
        this.imgIdx = this.images.length - 1;
    } else {
        this.imgIdx = newIndex;
    }
    if (newIndex !== this.scrollbar.getIndex()) {
        this.scrollbar.setIndex(newIndex);
    }
}

/** Setter function for the objects monoIdx attribute. */
OverlayDisplay.prototype.setMonoIndex = function(newMonoIndex) {
    if (newMonoIndex < 0) {
        this.monoIdx = 0;
    } else if (newMonoIndex >= this.mono_images.length) {
        this.monoIdx = this.mono_images.length - 1;
    } else {
        this.monoIdx = newMonoIndex;
    }
}

/**
 * Set the indices of both image sets from the mouses position.
 * This includes the normalization of the monochrome images.
 * @param {number} mx x coordinate of the cursor.
 */
OverlayDisplay.prototype.setIndexFromMouse = function(mx = mouseX) {
    let oldIdx = this.scrollbar.getIndex();
    this.scrollbar.setIndexFromMouse(mx);
    this.setIndex(this.scrollbar.getIndex()); 

    let stepRatio = this.mono_images.length / this.images.length;
    let step = (this.scrollbar.getIndex() - oldIdx) * stepRatio;
    this.setMonoIndex(this.monoIdx + step);
}

/**
 * Report whether the mouse is in the overlay displays scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {boolean}
 */
OverlayDisplay.prototype.hasMouseInScrollbar = function(mx = mouseX, my = mouseY) {
    return this.scrollbar.hasMouseInScrollbar();
}

/**
 * Draw function called in every draw loop.
 */
OverlayDisplay.prototype.draw = function () {
    /* Draw bottom monochrome image layer */
    this.imageWindow.clear();
    this.imageWindow.tint(255, 255);
    this.imageWindow.noStroke();
    this.imageWindow.fill(255);
    this.imageWindow.image(this.mono_images[Math.floor(this.getMonoIndex())], 0, 0, this.width, this.height);

    /* Draw top image layer with opacity changes */
    this.imageWindow.tint(255, 50);
    this.imageWindow.image(this.images[this.getIndex()], 0, 0, this.width, this.height);

    this.scrollbar.draw();
}