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

    this.layers = [
        {
            id: id,
            frames: frames,
            timestamps: timestamps,
            images: images,
            filters: filters,
            filter: "",
            viewport: {
                x: this.x + this.padding,
                y: this.y + this.padding,
                width: this.width,
                height: this.height,
            },
            opacity: "255",
            scrollbarIndex: 0,
        }
    ];

    this.scrollbars = [];
    this.scrollbars.push(new Scrollbar(
        `${this.id}-0`,
        this.x + this.padding,
        this.y + this.padding + this.height,
        this.width,
        this.scrollbarHeight,
        this.getLayerImages(0).length
    ));
    this.mainScrollbarIndex = 0;

    this.locked = false;
    this.timestamped = false;
}

/** Get layer */
Display.prototype.getLayer = function (index=0) {
    return this.layers[index];
}

/** Get layer id */
Display.prototype.getLayerId = function (index=0) {
    return this.getLayer(index).id;
}

/** Get layer frames */
Display.prototype.getLayerFrames = function (index=0) {
    return this.getLayer(index).frames;
}

/** Get layer timestamps */
Display.prototype.getLayerTimestamps = function (index=0) {
    return this.getLayer(index).timestamps;
}

/** Get layer images */
Display.prototype.getLayerImages = function (index=0) {
    return this.getLayer(index).images;
}

/** Get layer filters  */
Display.prototype.getLayerFilters = function (index=0) {
    return this.getLayer(index).filters;
}

/** Get layer filter */
Display.prototype.getLayerFilter = function (index=0) {
    return this.getLayer(index).filter;
}

/** Get layer viewport */
Display.prototype.getLayerViewport = function (index=0) {
    return this.getLayer(index).viewport;
}

/** Get layer opacity */
Display.prototype.getLayerOpacity = function (index=0) {
    return this.getLayer(index).opacity;
}

/* Set the displays images */
Display.prototype.setImages = function (images, filter = "", index=0) {
    const layer = this.getLayer(index);
    layer.images = images;
    layer.filter = filter;
    this.scrollbars[layer.scrollbarIndex].setSize(layer.images.length);
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
 * Set the timestamped state of the display.
 * @param {boolean} timestamped timestamped value
 */
Display.prototype.setTimestamped = function (timestamped) {
    this.timestamped = timestamped;
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
 * Update the location parameters in the display.
 * @param {number} newX new x coordinate for the display
 * @param {number} newY new y coordinate for the display
 */
Display.prototype.setLocation = function (newX, newY) {
    if (isNaN(newX) || isNaN(newY)) return;
    const dx = newX - this.x;
    const dy = newY - this.y;
    this.x = newX;
    this.y = newY;
    for (let i = 0; i < this.layers.length; i++) {
        const viewport = this.getLayerViewport(i);
        viewport.x += dx;
        viewport.y += dy;
    }
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

    const viewport = this.getLayerViewport(this.layers.length - 1);
    const hPadding = viewport.width * 2 / 3;
    const vPadding = viewport.height * 2 / 3;
    
    /* Horizontal viewport calculations */
    viewport.x += dx;
    if (viewport.x < left - hPadding) {
        viewport.x = left - hPadding;
    } else if (viewport.x + viewport.width > right + hPadding) {
        viewport.x = right + hPadding - viewport.width;
    }

    /* Vertical viewport calculations */
    viewport.y += dy;
    if (viewport.y < top - vPadding) {
        viewport.y = top - vPadding;
    } else if (viewport.y + viewport.height > bottom + vPadding) {
        viewport.y = bottom + vPadding - viewport.height;
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

    const viewport = this.getLayerViewport(this.layers.length - 1);

    viewport.width += (viewport.width * zoomRatio);
    if (viewport.width < minWidth) viewport.width = minWidth;
    else if (viewport.width > maxWidth) viewport.width = maxWidth;

    viewport.height += (viewport.height * zoomRatio);
    if (viewport.height < minHeight) viewport.height = minHeight;
    else if (viewport.height > maxHeight) viewport.height = maxHeight;
}

/**
 * Resize the image display.
 * @param {number} dx change to the width of the display
 * @param {number} dy change to the height of the display
 */
Display.prototype.resize = function (dx, dy) {
    if (this.locked) return;

    const minWidth = 50;
    const minHeight = 50;
    if (this.width + dx < minWidth) return;
    if (this.height + dy < minHeight) return;
    this.width += dx;
    this.height += dy;
    for (let i = 0; i < this.layers.length; i++) {
        const viewport = this.getLayerViewport(i);
        viewport.width += dx;
        viewport.height += dy;
    }
    this.scrollbars.forEach((scrollbar, index) => {
        scrollbar.setDimensions(this.width, this.scrollbarHeight);
        scrollbar.setLocation(this.x + this.padding, this.y + this.padding + this.height + this.scrollbarHeight * index);
    });
}

/**
 * Scale a specific viewport
 * @param {number} factor scale factor
 * @param {number=} index layer index
 */
Display.prototype.scaleViewport = function (factor, index=0) {
    if (this.locked) return;

    const viewport = this.getLayerViewport(index);
    viewport.width *= factor;
    viewport.height *= factor;
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
        layers: this.layers.map(layer => {
            return {
                ...layer,
                frames: [],
                timestamps: [],
                images: [],
            }
        }),
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
    this.layers = json.layers;
    this.scrollbars = this.scrollbars.map((scrollbar, index) => scrollbar.fromJSON(json.scrollbars[index]));
    this.mainScrollbarIndex = json.mainScrollbarIndex;
    this.locked = json.locked;
    return this;
}