/* Application Overlay for Videos */
"use strict";
function Overlay(id, x, y, width, height, padding, scrollbarHeight, display, secondaryDisplay) {
    Display.apply(this, [id, x, y, width, height, padding, scrollbarHeight, display.frames, display.timestamps, display.images, display.filters]);

    this.layers = [
        {
            id: display.id,
            frames: display.frames,
            timestamps: display.timestamps,
            images: display.images.slice(display.getMainScrollbar().start, display.getMainScrollbar().end),
            filters: display.filters,
            filter: display.filter,
            viewportX: this.x + this.padding + (display.viewportX - display.x - display.padding),
            viewportY: this.y + this.padding + (display.viewportY - display.y - display.padding),
            viewportWidth: this.width + (display.viewportWidth - display.width),
            viewportHeight: this.height + (display.viewportHeight - display.height),
            opacity: display.opacity,
            scrollbarIndex: 0,
        },
        {
            id: secondaryDisplay.id,
            frames: secondaryDisplay.frames,
            timestamps: secondaryDisplay.timestamps,
            images: secondaryDisplay.images.slice(secondaryDisplay.getMainScrollbar().start, secondaryDisplay.getMainScrollbar().end),
            filters: secondaryDisplay.filters,
            filter: secondaryDisplay.filter,
            viewportX: this.x + this.padding + (secondaryDisplay.viewportX - secondaryDisplay.x - secondaryDisplay.padding),
            viewportY: this.y + this.padding + (secondaryDisplay.viewportY - secondaryDisplay.y - secondaryDisplay.padding),
            viewportWidth: this.width + (display.viewportWidth - display.width),
            viewportHeight: this.height + (display.viewportHeight - display.height),
            opacity: "128",
            scrollbarIndex: 1,
        },
    ];

    this.images = this.layers[0].images;
    this.viewportX = this.layers[0].viewportX;
    this.viewportY = this.layers[0].viewportY;
    this.viewportWidth = this.layers[0].viewportWidth;
    this.viewportHeight = this.layers[0].viewportHeight;

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
        this.layers[0].images.length,
        secondaryDisplay.getMainScrollbar().annotations,
    );
    secondaryDisplay.getMainScrollbar().addLink(scrollbar2);

    this.scrollbars.push(scrollbar1, scrollbar2, new Scrollbar(
        `${this.id}-2`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight * 2,
        this.width,
        this.scrollbarHeight,
        Math.max(this.images.length, this.layers[0].images.length),
        [],
        [scrollbar1, scrollbar2]
    ));
    this.mainScrollbarIndex = 2;

}

Overlay.prototype = Object.create(Display.prototype);
Overlay.prototype.constructor = Overlay;

/**
 * Set the opacity level for the top layer images
 * @param {string} opacity opacity value of top layer of images
 */
Overlay.prototype.setOpacity = function (opacity) {
    const topLayer = this.layers[this.layers.length - 1];
    topLayer.opacity = opacity;
}

/**
 * Add a layer to the overlay
 * @param {Display} display display whose properties will be converted to a new layer of the overlay
 */
Overlay.prototype.addLayer = function (display) {
    const layer = {
        id: display.id,
        frames: display.frames,
        timestamps: display.timestamps,
        images: display.images.slice(display.getMainScrollbar().start, display.getMainScrollbar().end),
        filters: display.filters,
        filter: display.filter,
        viewportX: this.x + this.padding + (display.viewportX - display.x - display.padding),
        viewportY: this.y + this.padding + (display.viewportY - display.y - display.padding),
        viewportWidth: this.width + (display.viewportWidth - display.width),
        viewportHeight: this.height + (display.viewportHeight - display.height),
        opacity: "128",
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

    /* Need to resize the image display to ensure that everything fits inside the grid cell */
    this.resize(-this.scrollbarHeight, -this.scrollbarHeight);
}

/**
 * Cycle the layers within the the overlay by one.
 */
Overlay.prototype.cycleLayers = function () {
    let savedLayer = this.layers[0];
    for (let i = 1; i < this.layers.length; i++) {
        let tempLayer = this.layers[i];
        this.layers[i] = savedLayer;
        savedLayer = tempLayer;
    }
    this.layers[0] = savedLayer;
    // this.cycleScrollbars();
    /* Sync main layer */
    this.frames = this.layers[0].frames;
    this.timestamps = this.layers[0].timestamps;
    this.images = this.layers[0].images;
    this.filters = this.layers[0].filters;
    this.filter = this.layers[0].filter;
    this.viewportX = this.layers[0].viewportX;
    this.viewportY = this.layers[0].viewportY;
    this.viewportWidth = this.layers[0].viewportWidth;
    this.viewportHeight = this.layers[0].viewportHeight;
    this.opacity = this.layers[0].opacity;
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
        frames: [],
        timestamps: [],
        images: [],
        filters: this.filters,
        filter: this.filter,
        viewportX: this.viewportX,
        viewportY: this.viewportY,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
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
    this.filters = json.filters;
    this.filter = json.filter;
    this.viewportX = json.viewportX;
    this.viewportY = json.viewportY;
    this.viewportWidth = json.viewportWidth;
    this.viewportHeight = json.viewportHeight;
    this.layers = json.layers;
    this.scrollbars = this.scrollbars.map((scrollbar, index) => scrollbar.fromJSON(json.scrollbars[index]));
    this.mainScrollbarIndex = json.mainScrollbarIndex;
    this.locked = json.locked;
    this.opacity = json.opacity;
    return this;
}