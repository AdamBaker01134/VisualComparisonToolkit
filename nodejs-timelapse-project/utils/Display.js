/* Application Display for Videos */
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
    this.savedFrames = [];

    this.locked = false;
}

/**
 * Get the number of segments in the display scrollbar.
 * @returns {number}
 */
Display.prototype.getSize = function () {
    return this.images.length;
}

/**
 * Set the index of the display.
 * Affects both the scrollbar position and the image being displayed.
 * @param {number} index new image index
 */
Display.prototype.setIndex = function (index) {
    if (!this.locked) {
        this.index = index;
    }
}

/**
 * Set the lock state of the display.
 * @param {boolean} locked lock value
 */
Display.prototype.setLocked = function (locked) {
    this.locked = locked;
}

/**
 * Update the location parameters in the display.
 * @param {number} newX new x coordinate for the display
 * @param {number} newY new y coordinate for the display
 */
Display.prototype.setLocation = function (newX, newY) {
    this.x = newX;
    this.y = newY;
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
 * Check to see if mouse is on the scrollbar
 * @param {number} mx x coordinate of cursor
 * @param {number} my y coordinate of cursor
 * @returns {boolean}
 */
Display.prototype.checkScrollbarHit = function (mx, my) {
    return mx > this.x + this.padding && my > this.y + this.padding + this.height &&
            mx < this.x + this.padding + this.width && my < this.y + this.padding + this.height + this.scrollbarHeight;
}

/**
 * Add a saved frame to this display.
 * @param {string} name customized frame name
 * @param {number} index index of frame
 */
Display.prototype.addSavedFrame = function (name, index) {
    if (this.savedFrames.findIndex(savedFrame => savedFrame.index === index) < 0) {
        if (index >= 0 && index <= this.getSize()) {
            this.savedFrames.push({
                name: name,
                index: index,
            });
        }
    }
}