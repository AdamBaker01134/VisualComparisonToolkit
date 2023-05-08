function Display (id, x, y, width, height, padding, scrollbarHeight, frames, timestamps, images) {
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

    this.index = 0;
}

/**
 * Set the index of the display.
 * Affects both the scrollbar position and the image being displayed.
 * @param {number} index new image index
 */
Display.prototype.setIndex = function (index) {
    this.index = index;
}

/**
 * Check to see if mouse is on the scrollbar
 * @param {number} x x coordinate of cursor
 * @param {number} y y coordinate of cursor
 * @returns {boolean}
 */
Display.prototype.checkScrollbarHit = function (x, y) {
    return x > this.x + this.padding && y > this.y + this.padding + this.height &&
            x < this.x + this.padding + this.width && y < this.y + this.padding + this.height + this.scrollbarHeight;
}