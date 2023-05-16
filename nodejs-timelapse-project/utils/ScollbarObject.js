/* Focusable Object Class Interface */
function ScrollbarObject (x, y, width, height, padding) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.padding = padding;

    this.size = 1; /* Altered in implementations */

    this.index = 0;
}

/* Get the number of segments in the scrollbar */
ScrollbarObject.prototype.getSize = function () {
    return this.size;
}

/* Get the line gap between segments in the scrollbar */
ScrollbarObject.prototype.getLineGap = function () {
    return this.width / this.getSize();
}

/* Get the x-coordinate of the scrollbar in the canvas */
ScrollbarObject.prototype.getScrollbarLeft = function () {
    return -999;
}

/* Get the top-most y-coordinate of the scrollbar in the canvas */
ScrollbarObject.prototype.getScrollbarTop = function () {
    return -999;
}

/**
 * Get the x-coordinate of an index within the scrollbar
 * @param {number} index index within the scrollbar
 * @returns {number}
 */
ScrollbarObject.prototype.getPositionOfIndex = function (index) {
    return -999;
}

/* Get the index position x-coordinate of the scrollbar in the canvas */
ScrollbarObject.prototype.getMainPosition = function () {
    return -999;
}

/* Get the start position x-coordinate of the scrollbar in the canvas */
ScrollbarObject.prototype.getStartPosition = function () {
    return -999;
}

/* Get the end position x-coordinate of the scrollbar in the canvas */
ScrollbarObject.prototype.getEndPosition = function () {
    return -999;
}

/**
 * Check to see if the mouse is on the main position arrow
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
ScrollbarObject.prototype.checkMainPositionHit = function (mx) {
    return false;
}

/**
 * Check to see if the mouse is on the start position arrow or within the left empty area
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
ScrollbarObject.prototype.checkStartHit = function (mx) {
    return false;
}

/**
 * Check to see if the mouse is on the end position arrow or within the right empty area
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
ScrollbarObject.prototype.checEndHit = function (mx) {
    return false;
}

/**
 * Check to see if mouse is on the scrollbar
 * @param {number} mx x coordinate of cursor
 * @param {number} my y coordinate of cursor
 * @returns {boolean}
 */
ScrollbarObject.prototype.checkScollbarHit = function (mx, my) {
    return false;
}

/**
 * Update the number of segments displayed in the scrollbar.
 * @param {number} size number of segments
 */
ScrollbarObject.prototype.setSize = function (size) {
    this.size = size;
}

/**
 * Update the location parameters in the display.
 * @param {number} newX new x coordinate for the display
 * @param {number} newY new y coordinate for the display
 */
ScrollbarObject.prototype.setLocation = function (newX, newY) {
    this.x = newX;
    this.y = newY;
}

/**
 * Set the index of the display.
 * @param {number} index new image index
 */
ScrollbarObject.prototype.setIndex = function (index) {
    return;
}

/**
 * Set the start index
 * @param {number} index new start index
 */
ScrollbarObject.prototype.setStart = function (index) {
    return;
}

/**
 * Set the end index
 * @param {number} index new end index
 */
ScrollbarObject.prototype.setEnd = function (index) {
    return;
}