/* Application Display for Videos */
"use strict";
function Display(id, x, y, width, height, padding, scrollbarHeight, frames, timestamps, images, filters) {
    this.id = id;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.padding = padding;

    this.scrollbarHeight = scrollbarHeight;

    this.frames = frames;
    this.timestamps = timestamps;
    this.images = images;

    // this.annotations = [];
    this.filters = filters;
    this.filter = "";

    this.viewportX = this.x + this.padding;
    this.viewportY = this.y + this.padding;
    this.viewportWidth = this.width;
    this.viewportHeight = this.height;

    this.scrollbars = [];
    this.scrollbars.push(new Scrollbar(
        this.x + this.padding,
        this.y + this.padding + this.height,
        this.width,
        this.scrollbarHeight,
        this.images.length
    ));

    // this.index = 0;

    // this.start = 0;
    // this.end = this.getSize() - 1;

    this.locked = false;
}

/* Set the displays images */
Display.prototype.setImages = function (images, filter="") {
    this.images = images;
    this.scrollbars[0].setSize(this.images.length);
    this.filter = filter;
}

/**
 * Get the index of one of the displays scrollbars
 * @param {number} scrollbarPos index of the desired scrollbar
 * @returns {number}
 */
Display.prototype.getIndex = function (scrollbarPos) {
    if (scrollbarPos >= 0 && scrollbarPos < this.scrollbars.length) {
        return this.scrollbars[scrollbarPos].index;
    }
    return -1;
}

// /* Get the number of segments in the scrollbar */
// Display.prototype.getSize = function () {
//     return this.images.length;
// }

// /* Get the line gap between segments in the scrollbar */
// Display.prototype.getLineGap = function () {
//     return this.width / this.getSize();
// }

// /* Get the x-coordinate of the scrollbar in the canvas */
// Display.prototype.getScrollbarLeft = function () {
//     return this.x + this.padding;
// }

// /* Get the top-most y-coordinate of the scrollbar in the canvas */
// Display.prototype.getScrollbarTop = function () {
//     return this.y + this.padding + this.height;
// }

// /**
//  * Get the x-coordinate of an index within the scrollbar
//  * @param {number} index index within the scrollbar
//  */
// Display.prototype.getPositionOfIndex = function (index) {
//     return this.getLineGap() * (0.5 + index) + this.getScrollbarLeft();
// }

// /* Get the index position x-coordinate of the scrollbar in the canvas */
// Display.prototype.getMainPosition = function () {
//     return this.getPositionOfIndex(this.index);
// }

// /* Get the start position x-coordinate of the scrollbar in the canvas */
// Display.prototype.getStartPosition = function () {
//     return this.getPositionOfIndex(this.start);
// }

// /* Get the end position x-coordinate of the scrollbar in the canvas */
// Display.prototype.getEndPosition = function () {
//     return this.getPositionOfIndex(this.end);
// }

// /**
//  * Set the index of the display.
//  * Affects both the scrollbar position and the image being displayed.
//  * @param {number} index new image index
//  */
// Display.prototype.setIndex = function (index) {
//     if (this.locked) return;
//     this.index = index;
//     if (this.index < this.start) {
//         this.index = this.start;
//     } else if (this.index > this.end) {
//         this.index = this.end;
//     }

//     if (this.index < 0) {
//         this.index = 0;
//     } else if (this.index >= this.getSize()) {
//         this.index = this.getSize() - 1;
//     }
// }

// /**
//  * Set the start position
//  * @param {number} index new start index
//  */
// Display.prototype.setStart = function (index) {
//     if (this.locked) return;
//     this.start = index;
//     if (this.start < 0) this.start = 0;
//     if (this.start >= this.end) this.start = this.end - 1;
//     if (this.start > this.index) this.index = this.start;
// }

// /**
//  * Set the end position
//  * @param {number} index new end index
//  */
// Display.prototype.setEnd = function (index) {
//     if (this.locked) return;
//     this.end = index;
//     if (this.end >= this.getSize()) this.end = this.getSize() - 1;
//     if (this.end <= this.start) this.end = this.start + 1;
//     if (this.end < this.index) this.index = this.end;
// }

/**
 * Set the lock state of the display.
 * @param {boolean} locked lock value
 */
Display.prototype.setLocked = function (locked) {
    this.locked = locked;
    this.scrollbars.forEach(scrollbar => scrollbar.setLocked(locked));
}

/**
 * Check to see if mouse is on the image
 * @param {number} mx x coordinate of cursor
 * @param {number} my y coordinate of cursor
 * @returns {boolean}
 */
Display.prototype.checkImageHit = function (mx, my) {
    return mx > this.x + this.padding && my > this.y + this.padding &&
        mx < this.x + this.padding + this.width && my < this.y + this.padding + this.height;
}

/**
 * Update the dimensions of the display.
 * @param {number} newWidth new width for the display
 * @param {number} newHeight new height for the display
 */
Display.prototype.setDimensions = function (newWidth, newHeight) {
    let dw = newWidth - this.width;
    let dh = newHeight - this.height;
    this.width = newWidth;
    this.height = newHeight;
    this.viewportWidth += dw;
    this.viewportHeight += dh;
    this.scrollbars.forEach(scrollbar => scrollbar.setDimensions(newWidth, newHeight));
}

/**
 * Update the location parameters in the display.
 * @param {number} newX new x coordinate for the display
 * @param {number} newY new y coordinate for the display
 */
Display.prototype.setLocation = function (newX, newY) {
    if (isNaN(newX) || isNaN(newY)) return;
    let dx = newX - this.x;
    let dy = newY - this.y;
    this.x = newX;
    this.y = newY;
    this.viewportX += dx;
    this.viewportY += dy;
    this.scrollbars.forEach(scrollbar => scrollbar.setLocation(scrollbar.x + dx, scrollbar.y + dy));
}

/**
 * Pan the image viewport.
 * @param {number} dx change to x coordinate of the viewport
 * @param {number} dy change to y coordinate of the viewport
 */
Display.prototype.pan = function (dx, dy) {
    if (this.locked) return;

    const left = this.x + this.padding;
    const right = this.x + this.padding + this.width;
    const top = this.y + this.padding;
    const bottom = this.y + this.padding + this.height;
    const hPadding = this.viewportWidth * 2 / 3;
    const vPadding = this.viewportHeight * 2 / 3;

    /* Horizontal viewport calculations */
    this.viewportX += dx;
    if (this.viewportX < left - hPadding) {
        this.viewportX = left - hPadding;
    } else if (this.viewportX + this.viewportWidth > right + hPadding) {
        this.viewportX = right + hPadding - this.viewportWidth;
    }

    /* Vertical viewport calculations */
    this.viewportY += dy;
    if (this.viewportY < top - vPadding) {
        this.viewportY = top - vPadding;
    } else if (this.viewportY + this.viewportHeight > bottom + vPadding) {
        this.viewportY = bottom + vPadding - this.viewportHeight
    }
}

/**
 * Update the displays zoom.
 * @param {number} delta zoom size
 */
Display.prototype.zoom = function (delta) {
    if (this.locked) return;

    const minWidth = this.width / 2;
    const maxWidth = this.width * 2;
    const minHeight = this.height / 2;
    const maxHeight = this.height * 2;
    const zoomRatio = -delta / 1000;

    this.viewportWidth += (this.viewportWidth * zoomRatio);
    if (this.viewportWidth < minWidth) this.viewportWidth = minWidth;
    else if (this.viewportWidth > maxWidth) this.viewportWidth = maxWidth;

    this.viewportHeight += (this.viewportHeight * zoomRatio);
    if (this.viewportHeight < minHeight) this.viewportHeight = minHeight;
    else if (this.viewportHeight > maxHeight) this.viewportHeight = maxHeight;
}

/**
 * Check to see if mouse is on a scrollbar
 * @param {number} mx x coordinate of cursor
 * @param {number} my y coordinate of cursor
 * @returns {number} index of scrollbar (-1 if not on a scrollbar)
 */
Display.prototype.checkScrollbarHit = function (mx, my) {
    for (let i = 0; i < this.scrollbars.length; i++) {
        if (this.scrollbars[i].checkScrollbarHit(mx, my)) return i;
    }
    return -1;
}

/**
 * Check to see if the mouse is on the main position arrow of a scrollbar
 * @param {number} mx x coordinate of cursor
 * @returns {number} index of scrollbar (-1 if not on a scrollbar)
 */
Display.prototype.checkMainPositionHit = function (mx) {
    for (let i = 0; i < this.scrollbars.length; i++) {
        if (this.scrollbars[i].checkMainPositionHit(mx)) return i;
    }
    return -1;
}

/**
 * Check to see if the mouse is on the start position arrow or within the left empty area of a scrollbar
 * @param {number} mx x coordinate of cursor
 * @returns {number} index of scrollbar (-1 if not on a scrollbar)
 */
Display.prototype.checkStartHit = function (mx) {
    for (let i = 0; i < this.scrollbars.length; i++) {
        if (this.scrollbars[i].checkStartHit(mx)) return i;
    }
    return -1;
}

/**
 * Check to see if the mouse is on the end position arrow or within the right empty area of a scrollbar
 * @param {number} mx x coordinate of cursor
 * @returns {number} index of scrollbar (-1 if not on a scrollbar)
 */
Display.prototype.checkEndHit = function (mx) {
    for (let i = 0; i < this.scrollbars.length; i++) {
        if (this.scrollbars[i].checkEndHit(mx)) return i;
    }
    return -1;
}

/**
 * Add an annotation to a scrollbar.
 * @param {number} scrollbarPos index of the desired scrollbar
 * @param {string} name customized annotation name
 * @param {number} index index of annotation
 */
Display.prototype.addAnnotation = function (scrollbarPos, name, index) {
    if (scrollbarPos >= 0 && scrollbarPos < this.scrollbars.length) {
        this.scrollbars[scrollbarPos].addAnnotation(name, index);
    }
}