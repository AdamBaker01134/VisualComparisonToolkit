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

    this.filters = filters;
    this.filter = "";

    this.viewportX = this.x + this.padding;
    this.viewportY = this.y + this.padding;
    this.viewportWidth = this.width;
    this.viewportHeight = this.height;

    this.scrollbars = [];
    this.scrollbars.push(new Scrollbar(
        `${this.id}-0`,
        this.x + this.padding,
        this.y + this.padding + this.height,
        this.width,
        this.scrollbarHeight,
        this.images.length
    ));
    this.mainScrollbarIndex = 0;

    this.locked = false;
}

/* Set the displays images */
Display.prototype.setImages = function (images, filter = "") {
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

/* Retrieve the main scrollbar in the display */
Display.prototype.getMainScrollbar = function () {
    return this.scrollbars[this.mainScrollbarIndex];
}

/**
 * Set the lock state of the display.
 * @param {boolean} locked lock value
 */
Display.prototype.setLocked = function (locked) {
    this.locked = locked;
    this.scrollbars.forEach(scrollbar => scrollbar.setLocked(locked));
}

/**
 * Check to see if mouse is on the display
 * @param {number} mx x coordinate of cursor
 * @param {number} my y coordinate of cursor
 * @returns {boolean}
 */
Display.prototype.checkHit = function (mx, my) {
    return mx > this.x && my > this.y &&
        mx < this.x + this.padding * 2 + this.width && my < this.y + this.padding * 2 + this.height + this.scrollbarHeight * this.scrollbars.length;
}

/**
 * Check to see if mouse is on the display padding
 * @param {number} mx x coordinate of cursor
 * @param {number} my y coordinate of cursor
 * @returns {boolean}
 */
Display.prototype.checkCornerHit = function (mx, my) {
    return mx > this.x + this.padding + this.width && mx < this.x + this.padding * 2 + this.width &&
        my > this.y + this.padding + this.height + this.scrollbarHeight * this.scrollbars.length && my < this.y + this.padding * 2 + this.height + this.scrollbarHeight * this.scrollbars.length;
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
 * Resize the image display.
 * @param {number} dx change to the width of the display
 * @param {number} dy change to the height of the display
 */
Display.prototype.resize = function (dx, dy) {
    if (this.locked) return;

    const maxWidth = 500;
    const maxHeight = 500;
    const minWidth = 50;
    const minHeight = 50;
    if (this.width + dx < minWidth || this.width + dx > maxWidth) return;
    if (this.height + dy < minHeight || this.height + dy > maxHeight) return;
    this.width += dx;
    this.height += dy;
    this.viewportWidth += dx;
    this.viewportHeight += dy;

    this.scrollbars.forEach(scrollbar => {
        scrollbar.setDimensions(this.width, this.scrollbarHeight);
        scrollbar.setLocation(this.x + this.padding, this.y + this.padding + this.height);
    });
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
 */
Display.prototype.addAnnotation = function (scrollbarPos, name) {
    if (scrollbarPos >= 0 && scrollbarPos < this.scrollbars.length) {
        return this.scrollbars[scrollbarPos].addAnnotation(
            generateAnnotationId(name),
            name,
            generateAnnotationColour(),
        );
    }
}

/**
 * Convert display to JSON
 * @returns {Object}
 */
Display.prototype.toJSON = function () {
    return {
        id: this.id,
        type: "DISPLAY",
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        padding: this.padding,
        scrollbarHeight: this.scrollbarHeight,
        frames: [],
        timestamps: [],
        images: [],
        filters: this.filters,
        filter: this.filter,
        viewportX: this.viewportX,
        viewportY: this.viewportY,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        scrollbars: this.scrollbars.map(scrollbar => scrollbar.toJSON()),
        mainScrollbarIndex: this.mainScrollbarIndex,
        locked: this.locked,
    }
}

/* Load display from JSON */
Display.prototype.fromJSON = function (json) {
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
    this.filters = json.filters;
    this.filter = json.filter;
    this.viewportX = json.viewportX;
    this.viewportY = json.viewportY;
    this.viewportWidth = json.viewportWidth;
    this.viewportHeight = json.viewportHeight;
    this.scrollbars = this.scrollbars.map((scrollbar, index) => scrollbar.fromJSON(json.scrollbars[index]));
    this.mainScrollbarIndex = json.mainScrollbarIndex;
    this.locked = json.locked;
    return this;
}