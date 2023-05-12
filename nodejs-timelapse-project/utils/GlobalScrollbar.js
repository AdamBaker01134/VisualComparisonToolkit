/* Global Application Scrollbar */
function GlobalScrollbar (x, y, width, height, padding, size) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.padding = padding;

    this.size = size;

    this.index = 0;
}

/* Get the number of segments in the scrollbar */
GlobalScrollbar.prototype.getSize = function () {
    return this.size;
}

/* Get the line gap between segments in the scrollbar */
GlobalScrollbar.prototype.getLineGap = function () {
    return this.width / this.getSize();
}

/* Get the x-coordinate of the scrollbar in the canvas */
GlobalScrollbar.prototype.getScrollbarLeft = function () {
    return this.x + this.padding;
}

/* Get the y-coordinate of the scrollbar in the canvas */
GlobalScrollbar.prototype.getScrollbarTop = function () {
    return this.y + this.padding;
}

/**
 * Get the x-coordinate of an index within the scrollbar
 * @param {number} index index within the scrollbar
 */
GlobalScrollbar.prototype.getPositionOfIndex = function (index) {
    return this.getLineGap() * (0.5 + index) + this.getScrollbarLeft();
}

/* Get the index position x-coordinate of the scrollbar in the canvas */
GlobalScrollbar.prototype.getMainPosition = function () {
    return this.getPositionOfIndex(this.index);
}

/**
 * Check to see if the mouse is on the main position arrow
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
GlobalScrollbar.prototype.checkMainPositionHit = function (mx) {
    let pos = this.getMainPosition();
    return mx > pos - 5 && mx < pos + 5;
}

/** Currently no start position in global scrollbar **/
GlobalScrollbar.prototype.getStartPosition = function () {
    return -999;
}
GlobalScrollbar.prototype.checkStartHit = function () {
    return false;
}

/** Currently no end position in global scrollbar **/
GlobalScrollbar.prototype.getEndPosition = function () {
    return -999;
}
GlobalScrollbar.prototype.checkEndHit = function () {
    return false;
}

/**
 * Update the number of segments displayed in the global scrollbar.
 * @param {number} size number of segments
 */
GlobalScrollbar.prototype.setSize = function (size) {
    this.size = size;
}

/**
 * Update the location parameters for the scrollbar.
 * @param {number} newX new x coordinate for the scrollbar
 * @param {number} newY new y coordinate for the scrollbar
 */
GlobalScrollbar.prototype.setLocation = function (newX, newY) {
    this.x = newX;
    this.y = newY;
}

/**
 * Set the index in the scrollbar
 * @param {number} index new scrollbar index
 */
GlobalScrollbar.prototype.setIndex = function (index) {
    this.index = index;
    if (this.index < 0) {
        this.index = 0;
    } else if (this.index >= this.getSize()) {
        this.index = this.getSize() - 1;
    }
}

/**
 * Check to see if mouse is in the scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {boolean}
 */
GlobalScrollbar.prototype.checkScrollbarHit = function (mx, my) {
    return mx > this.x + this.padding && my > this.y + this.padding &&
            mx < this.x + this.padding + this.width && my < this.y + this.padding + this.height;
}