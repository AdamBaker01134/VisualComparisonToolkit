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
}

/**
 * Check to see if mouse is in the scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {boolean}
 */
GlobalScrollbar.prototype.checkHit = function (mx, my) {
    return mx > this.x + this.padding && my > this.y + this.padding &&
            mx < this.x + this.padding + this.width && my < this.y + this.padding + this.width;
}