/* Application Overlay for Videos */
"use strict";
function Overlay(id, x, y, width, height, padding, scrollbarHeight, display, secondaryDisplay) {
    Display.apply(this, [id, x, y, width, height, padding, scrollbarHeight, display.frames, display.timestamps, display.images, secondaryDisplay.filters]);

    this.images = this.images.slice(display.start, display.end);
    this.secondaryImages = secondaryDisplay.images.slice(secondaryDisplay.start, secondaryDisplay.end);
    // this.secondarySize = this.secondaryImages.length;
    // this.secondaryIndex = 0;

    this.scrollbars = [];
    let scrollbar1 = new Scrollbar(
        `${this.id}-0`,
        this.x + this.padding,
        this.y + this.padding + this.height,
        this.width,
        this.scrollbarHeight,
        this.images.length,
        display.getMainScrollbar().annotations,
    );
    display.getMainScrollbar().addLink(scrollbar1);

    let scrollbar2 = new Scrollbar(
        `${this.id}-1`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight,
        this.width,
        this.scrollbarHeight,
        this.secondaryImages.length,
        secondaryDisplay.getMainScrollbar().annotations,
    );
    secondaryDisplay.getMainScrollbar().addLink(scrollbar2);

    this.scrollbars.push(scrollbar1, scrollbar2, new Scrollbar(
        `${this.id}-2`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight * 2,
        this.width,
        this.scrollbarHeight,
        Math.max(this.images.length, this.secondaryImages.length),
        [],
        [scrollbar1, scrollbar2]
    ));
    this.mainScrollbarIndex = 2;

    this.secondaryFilter = secondaryDisplay.filter;

    this.opacity = "128";
}

Overlay.prototype = Object.create(Display.prototype);
Overlay.prototype.constructor = Overlay;

/* Set the overlays secondary images */
Overlay.prototype.setSecondaryImages = function (images, filter = "") {
    this.secondaryImages = images;
    this.scrollbars[1].setSize(this.secondaryImages.length);
    this.secondaryFilter = filter;
}

// /* Get the number of secondary images in the overlay */
// Overlay.prototype.getSecondarySize = function () {
//     return this.secondarySize;
// }

// /**
//  * Set the index of the display.
//  * Affects both the scrollbar position and the images being displayed.
//  * @param {number} index new image index
//  */
// Overlay.prototype.setIndex = function (index) {
//     let saved = this.index;
//     if (!this.locked) {
//         let step = index - saved;
//         this.index = index;
//         if (this.index < this.start) {
//             step = this.start - saved;
//             this.index = this.start;
//         } else if (this.index > this.end) {
//             step = this.end - saved;
//             this.index = this.end;
//         }

//         if (this.index < 0) {
//             step = -saved;
//             this.index = 0;
//         } else if (this.index >= this.getSize()) {
//             step = this.getSize() - 1 - saved;
//             this.index = this.getSize() - 1;
//         }

//         let stepRatio = this.getSecondarySize() / this.getSize();
//         this.secondaryIndex = this.secondaryIndex + (step * stepRatio);
//         if (this.secondaryIndex < 0) {
//             this.secondaryIndex = 0;
//         } else if (this.secondaryIndex >= this.getSecondarySize()) {
//             this.secondaryIndex = this.getSecondarySize() - 1;
//         }
//     }
// }

// /**
//  * Set the start position
//  * @param {number} index new start index
//  */
// Overlay.prototype.setStart = function (index) {
//     if (!this.locked) {
//         this.start = index;
//         if (this.start < 0) this.start = 0;
//         if (this.start >= this.end) this.start = this.end - 1;
//         if (this.start > this.index) {
//             this.setIndex(this.start);
//         }
//     }
// }

// /**
//  * Set the end position
//  * @param {number} index new end index
//  */
// Overlay.prototype.setEnd = function (index) {
//     if (!this.locked) {
//         this.end = index;
//         if (this.end >= this.getSize()) this.end = this.getSize() - 1;
//         if (this.end <= this.start) this.end = this.start + 1;
//         if (this.end < this.index) {
//             this.setIndex(this.end);
//         }
//     }
// }

/**
 * Set the opacity level for the top layer images
 * @param {string} opacity opacity value of top layer of images
 */
Overlay.prototype.setOpacity = function (opacity) {
    this.opacity = opacity;
}

/* Convert overlay to JSON */
Overlay.prototype.toJSON = function () {
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        paddding: this.padding,
        scrollbarHeight: this.scrollbarHeight,
        frames: [],
        timestamps: [],
        images: [],
        secondaryImages: [],
        filters: this.filters,
        filter: this.filter,
        secondaryFilter: this.secondaryFilter,
        viewportX: this.viewportX,
        viewportY: this.viewportY,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        scrollbars: this.scrollbars.map(scrollbar => scrollbar.toJSON()),
        mainScrollbarIndex: this.mainScrollbarIndex,
        locked: this.locked,
        opacity: this.opacity,
    }
}

/* Load overlay from JSON */
Overlay.prototype.fromJSON = function (json) {
    this.id = json.id;
    this.x = json.x;
    this.y = json.y;
    this.width = json.width;
    this.height = json.height;
    this.padding = json.padding;
    this.scrollbarHeight = json.scrollbarHeight;
    this.frames = json.frames;
    this.timestamps = json.timestamps;
    this.images = json.images;
    this.secondaryImages = json.secondaryImages;
    this.filters = json.filters;
    this.filter = json.filter;
    this.secondaryFilter = json.secondaryFilter;
    this.viewportX = json.viewportX;
    this.viewportY = json.viewportY;
    this.viewportWidth = json.viewportWidth;
    this.viewportHeight = json.viewportHeight;
    this.scrollbars = json.scrollbars.map(scrollbar => scrollbar.fromJSON());
    this.mainScrollbarIndex = json.mainScrollbarIndex;
    this.locked = json.locked;
    this.opacity = json.opacity;
    return this;
}