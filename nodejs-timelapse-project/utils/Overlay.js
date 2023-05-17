/* Application Overlay for Videos */
"use strict";
function Overlay (id, x, y, width, height, padding, scrollbarHeight, frames, timestamps, images, secondaryImages) {
    Display.apply(this, [id, x, y, width, height, padding, scrollbarHeight, frames, timestamps, images]);

    this.images = this.images.map(image => image.get());
    this.secondaryImages = secondaryImages.map(image => image.get());
    // this.secondaryImages.forEach(image => image.filter(THRESHOLD));
    this.secondarySize = this.secondaryImages.length;
    this.secondaryIndex = 0;

    this.opacity = "128";
}

Overlay.prototype = Object.create(Display.prototype);
Overlay.prototype.constructor = Overlay;

/* Get the number of secondary images in the overlay */
Overlay.prototype.getSecondarySize = function () {
    return this.secondarySize;
}

/**
 * Set the index of the display.
 * Affects both the scrollbar position and the images being displayed.
 * @param {number} index new image index
 */
Overlay.prototype.setIndex = function (index) {
    let saved = this.index;
    if (!this.locked) {
        let step = index - saved;
        this.index = index;
        if (this.index < this.start) {
            step = this.start - saved;
            this.index = this.start;
        } else if (this.index > this.end) {
            step = this.end - saved;
            this.index = this.end;
        }

        if (this.index < 0) {
            step = -saved;
            this.index = 0;
        } else if (this.index >= this.getSize()) {
            step = this.getSize() - 1 - saved;
            this.index = this.getSize() - 1;
        }

        let stepRatio = this.getSecondarySize() / this.getSize();
        this.secondaryIndex = this.secondaryIndex + (step * stepRatio);
        if (this.secondaryIndex < 0) {
            this.secondaryIndex = 0;
        } else if (this.secondaryIndex >= this.getSecondarySize()) {
            this.secondaryIndex = this.getSecondarySize() - 1;
        }
    }
}

/**
 * Set the start position
 * @param {number} index new start index
 */
Overlay.prototype.setStart = function (index) {
    if (!this.locked) {
        this.start = index;
        if (this.start < 0) this.start = 0;
        if (this.start >= this.end) this.start = this.end - 1;
        if (this.start > this.index) {
            this.setIndex(this.start);
        }
    }
}

/**
 * Set the end position
 * @param {number} index new end index
 */
Overlay.prototype.setEnd = function (index) {
    if (!this.locked) {
        this.end = index;
        if (this.end >= this.getSize()) this.end = this.getSize() - 1;
        if (this.end <= this.start) this.end = this.start + 1;
        if (this.end < this.index) {
            this.setIndex(this.end);
        }
    }
}

/**
 * Set the opacity level for the top layer images
 * @param {string} opacity opacity value of top layer of images
 */
Overlay.prototype.setOpacity = function (opacity) {
    this.opacity = opacity;
}