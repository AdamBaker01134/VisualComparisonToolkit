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

}

Overlay.prototype = Object.create(Display.prototype);
Overlay.prototype.constructor = Overlay;

/**
 * Set the opacity level for the top layer images
 * @param {string} opacity opacity value of top layer of images
 */
Overlay.prototype.setOpacity = function (opacity) {
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
    let savedLayer = this.getLayer(0);
    for (let i = 1; i < this.layers.length; i++) {
        let tempLayer = this.getLayer(1);
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