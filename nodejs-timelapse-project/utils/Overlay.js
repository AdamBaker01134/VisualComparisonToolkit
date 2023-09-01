/* Application Overlay for Videos */
"use strict";
function Overlay(id, x, y, width, height, padding, scrollbarHeight, display, secondaryDisplay) {
    Display.apply(this, [id, x, y, width, height, padding, scrollbarHeight, display.getLayerFrames(), display.getLayerTimestamps(), display.getLayerImages(), display.getLayerFilters()]);

    this.layers = [
        {
            id: display.id,
            frames: display.getLayerFrames(),
            timestamps: display.getLayerTimestamps(),
            images: display.getLayerImages().slice(display.getMainScrollbar().start, display.getMainScrollbar().end),
            filters: display.getLayerFilters(),
            filter: display.getLayerFilter(),
            viewport: {
                x: this.x + this.padding + (display.getLayerViewport().x - display.x - display.padding),
                y: this.y + this.padding + (display.getLayerViewport().y - display.y - display.padding),
                width: this.width + (display.getLayerViewport().width - display.width),
                height: this.height + (display.getLayerViewport().height - display.height),
            },
            opacity: display.getLayerOpacity(),
            scrollbarIndex: 0,
        },
        {
            id: secondaryDisplay.id,
            frames: secondaryDisplay.getLayerFrames(),
            timestamps: secondaryDisplay.getLayerTimestamps(),
            images: secondaryDisplay.getLayerImages().slice(secondaryDisplay.getMainScrollbar().start, secondaryDisplay.getMainScrollbar().end),
            filters: secondaryDisplay.getLayerFilters(),
            filter: secondaryDisplay.getLayerFilter(),
            viewport: {
                x: this.x + this.padding + (secondaryDisplay.getLayerViewport().x - secondaryDisplay.x - secondaryDisplay.padding),
                y: this.y + this.padding + (secondaryDisplay.getLayerViewport().y - secondaryDisplay.y - secondaryDisplay.padding),
                width: this.width + (secondaryDisplay.getLayerViewport().width - secondaryDisplay.width),
                height: this.height + (secondaryDisplay.getLayerViewport().height - secondaryDisplay.height),
            },
            opacity: "128",
            scrollbarIndex: 1,
        },
    ];

    this.scrollbars = [];
    let scrollbar1 = new Scrollbar(
        `${this.id}-0`,
        this.x + this.padding,
        this.y + this.padding + this.height,
        this.width,
        this.scrollbarHeight,
        this.getLayerImages(0).length,
        display.getMainScrollbar().annotations,
    );
    display.getMainScrollbar().addLink(scrollbar1);

    let scrollbar2 = new Scrollbar(
        `${this.id}-1`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight,
        this.width,
        this.scrollbarHeight,
        this.getLayerImages(1).length,
        secondaryDisplay.getMainScrollbar().annotations,
    );
    secondaryDisplay.getMainScrollbar().addLink(scrollbar2);

    this.scrollbars.push(scrollbar1, scrollbar2, new Scrollbar(
        `${this.id}-2`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight * 2,
        this.width,
        this.scrollbarHeight,
        Math.max(scrollbar1.getSize(), scrollbar2.getSize()),
        [],
        [scrollbar1, scrollbar2]
    ));
    this.mainScrollbarIndex = 2;

    this.mode = "overlay";

    /* Ratio of the overlay width to represent the width */
    this.comparisonSliderValue = 0.5;

    /* Position of the magic lens in the overlay */
    this.magicLens = {
        x: this.x + this.padding  + this.width / 2,
        y: this.y + this.padding + this.height / 2,
        width: this.width / 2,
        height: this.height / 2,
    };
}

Overlay.prototype = Object.create(Display.prototype);
Overlay.prototype.constructor = Overlay;

/**
 * Set the opacity level for the top layer images
 * @param {string} opacity opacity value of top layer of images
 */
Overlay.prototype.setOpacity = function (opacity) {
    if (this.locked) return;
    const topLayer = this.getLayer(this.layers.length - 1);
    topLayer.opacity = opacity;
}

/**
 * Add a layer to the overlay
 * @param {Display} display display whose properties will be converted to a new layer of the overlay
 */
Overlay.prototype.addLayer = function (display) {
    const layer = {
        id: display.id,
        frames: display.getLayerFrames(),
        timestamps: display.getLayerTimestamps(),
        images: display.getLayerImages().slice(display.getMainScrollbar().start, display.getMainScrollbar().end),
        filters: display.getLayerFilters(),
        filter: display.getLayerFilter(),
        viewport: {
            x: this.x + this.padding + (display.getLayerViewport().x - display.x - display.padding),
            y: this.y + this.padding + (display.getLayerViewport().y - display.y - display.padding),
            width: this.width + (display.getLayerViewport().width - display.width),
            height: this.height + (display.getLayerViewport().height - display.height),
        },
        opacity: Math.floor(255 / (this.layers.length + 1)).toString(),
        scrollbarIndex: this.mainScrollbarIndex,
    };
    const scrollbar = new Scrollbar(
        `${this.id}-${this.scrollbars.length}`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight * this.scrollbars.length - 1,
        this.width,
        this.scrollbarHeight,
        layer.images.length,
        display.getMainScrollbar().annotations,
    );
    display.getMainScrollbar().addLink(scrollbar);
    this.scrollbars.splice(this.mainScrollbarIndex, 0, scrollbar);
    this.layers.push(layer);

    /* Update the main scrollbar so it knows about the new one */
    this.mainScrollbarIndex = this.scrollbars.length - 1;
    const mainScrollbar = this.getMainScrollbar();
    mainScrollbar.addChild(scrollbar);
    mainScrollbar.setLocation(mainScrollbar.x, mainScrollbar.y + this.scrollbarHeight);

    /* Need to scale the image display to ensure that everything fits inside the grid cell */
    this.scale((this.height - this.scrollbarHeight) / this.height);
}

/**
 * Cycle the layers within the the overlay by one.
 */
Overlay.prototype.cycleLayers = function () {
    if (this.locked) return;
    let savedLayer = this.getLayer(0);
    for (let i = 1; i < this.layers.length; i++) {
        let tempLayer = this.getLayer(i);
        this.layers[i] = savedLayer;
        savedLayer = tempLayer;
    }
    this.layers[0] = savedLayer;
    // this.cycleScrollbars();
}

// IF YOU UNCOMMENT CYCLING SCROLLBARS, YOU NEED TO REMOVE SCROLLBAR INDICES IN LAYERS
// /**
//  * Cycle the scrollbars within the overlay by one, ignoring the main scrollbar.
//  */
// Overlay.prototype.cycleScrollbars = function () {
//     let savedScrollbar = this.scrollbars[0];
//     const savedX = savedScrollbar.x;
//     const savedY = savedScrollbar.y;
//     for (let i = 1; i < this.mainScrollbarIndex; i++) {
//         let tempScrollbar = this.scrollbars[i];
//         this.scrollbars[i] = savedScrollbar;
//         savedScrollbar.setLocation(tempScrollbar.x, tempScrollbar.y);
//         savedScrollbar = tempScrollbar;
//     }
//     this.scrollbars[0] = savedScrollbar;
//     savedScrollbar.setLocation(savedX, savedY);
// }

/**
 * Set the overlay mode if the overlay has only 2 layers.
 * @param {string} mode overlay, horizontal, vertical, or magic_lens
 */
Overlay.prototype.setMode = function (mode) {
    if (this.locked || this.layers.length !== 2) return;
    this.mode = mode;
}

/**
 * Set a new value for the comparison slider value. Must be between 0.1 and 0.9 to avoid image errors.
 * @param {number} value new value for the comparison slider value
 */
Overlay.prototype.setComparisonSliderValue = function (value) {
    if (this.locked || !(this.mode === "horizontal" || this.mode === "vertical")) return;
    this.comparisonSliderValue = value;
    if (this.comparisonSliderValue < 0.1) this.comparisonSliderValue = 0.1;
    if (this.comparisonSliderValue > 0.9) this.comparisonSliderValue = 0.9;
}

/**
 * Set the magic lens' location in the display. Will not go beyond the displays boundary
 * @param {number} newX new x coordinate of the magic lens
 * @param {number} newY new y coordinate of the magic lens
 */
Overlay.prototype.setMagicLensLocation = function (newX, newY) {
    const left = this.x + this.padding;
    const right = this.x + this.padding + this.width;
    const top = this.y + this.padding;
    const bottom = this.y + this.padding + this.height;

    this.magicLens.x = newX;
    this.magicLens.y = newY;

    if (this.magicLens.x - this.magicLens.width / 2 < left)
        this.magicLens.x = left + this.magicLens.width / 2;
    if (this.magicLens.x + this.magicLens.width / 2 > right)
        this.magicLens.x = right - this.magicLens.width / 2;
    if (this.magicLens.y - this.magicLens.height / 2 < top)
        this.magicLens.y = top + this.magicLens.height / 2;
    if (this.magicLens.y + this.magicLens.height / 2 > bottom)
        this.magicLens.y = bottom - this.magicLens.height / 2;
}

/**
 * Scale the image display, and also update the magic lens.
 * @param {number} scaleFactor scale ratio
 */
Overlay.prototype.scale = function (scaleFactor) {
    Display.prototype.scale.call(this, scaleFactor);
    this.magicLens.width *= scaleFactor;
    this.magicLens.height *= scaleFactor;
    const xDiff = this.x + this.padding - this.magicLens.x;
    const yDiff = this.y + this.padding - this.magicLens.y;
    this.setMagicLensLocation(
        this.magicLens.x + (1 - scaleFactor) * xDiff,
        this.magicLens.y + (1 - scaleFactor) * yDiff
    );
}

/**
 * Update the location parameters in the overlay and update the magic lens position as well.
 * @param {number} newX new x coordinate for the display
 * @param {number} newY new y coordinate for the display
 */
Overlay.prototype.setLocation = function (newX, newY) {
    if (isNaN(newX) || isNaN(newY)) return;
    const dx = newX - this.x;
    const dy = newY - this.y;
    Display.prototype.setLocation.call(this, newX, newY);
    this.magicLens.x += dx;
    this.magicLens.y += dy;
}

/**
 * Check if the comparison slider was hit in a mouse event.
 * If the comparison slider is not active, this will always return false.
 * @param {number} mx x coordinate of the mouse
 * @param {number} my y coordinate of the mouse
 * @returns {boolean}
 */
Overlay.prototype.checkComparisonSliderHit = function (mx = mouseX, my = mouseY) {
    if (this.locked || !(this.mode === "horizontal" || this.mode === "vertical")) return false;
    const sliderRadius = this.width / 10;
    if (this.mode === "vertical") {
        return mx > this.x + this.padding + this.width * this.comparisonSliderValue - sliderRadius &&
            mx < this.x + this.padding + this.width * this.comparisonSliderValue + sliderRadius &&
            my > this.y + this.padding + this.height / 2 - sliderRadius &&
            my < this.y + this.padding + this.height / 2 + sliderRadius;
    } else {
        return mx > this.x + this.padding + this.width / 2 - sliderRadius &&
            mx < this.x + this.padding + this.width / 2 + sliderRadius &&
            my > this.y + this.padding + this.height * this.comparisonSliderValue - sliderRadius &&
            my < this.y + this.padding + this.height * this.comparisonSliderValue + sliderRadius;
    }
}

/**
 * Check if the magic lens was hit in a mouse event.
 * If the magic lens is not active, this will always return false.
 * @param {number} mx x coordinate of the mouse
 * @param {number} my y coordinate of the mouse
 * @returns {boolean}
 */
Overlay.prototype.checkMagicLensHit = function (mx = mouseX, my = mouseY) {
    if (this.locked || !(this.mode === "magic_lens")) return false;
    return mx > this.magicLens.x - this.magicLens.width / 2 && mx < this.magicLens.x + this.magicLens.width / 2 &&
        my > this.magicLens.y - this.magicLens.height / 2 && my < this.magicLens.y + this.magicLens.height / 2;
}

/**
 * Convert overlay to JSON
 * @returns {Object}
 */
Overlay.prototype.toJSON = function () {
    return {
        id: this.id,
        type: "OVERLAY",
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

/* Load overlay from JSON */
Overlay.prototype.fromJSON = function (json) {
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