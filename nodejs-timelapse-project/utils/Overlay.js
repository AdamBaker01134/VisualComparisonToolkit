/* Application Overlay for Videos */
"use strict";
function Overlay(id, x, y, width, height, padding, scrollbarHeight, display, secondaryDisplay) {
    Display.apply(this, [id, x, y, width, height, padding, scrollbarHeight, display.frames, display.timestamps, display.images, secondaryDisplay.filters]);

    this.images = this.images.slice(display.start, display.end);
    this.secondaryImages = secondaryDisplay.images.slice(secondaryDisplay.start, secondaryDisplay.end);

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
        this.secondaryImages.length,
        secondaryDisplay.getMainScrollbar().annotations,
    );
    secondaryDisplay.getMainScrollbar().addLink(scrollbar2);

    this.scrollbars.push(scrollbar1, scrollbar2, new Scrollbar(
        `${this.id}-2`,
        this.x + this.padding,
        this.y + this.padding + this.height + this.scrollbarHeight * 2,
        this.width,
        this.scrollbarHeight,
        Math.max(this.images.length, this.secondaryImages.length),
        [],
        [scrollbar1, scrollbar2]
    ));
    this.mainScrollbarIndex = 2;

    this.secondaryFilter = secondaryDisplay.filter;

    this.opacity = "128";
}

Overlay.prototype = Object.create(Display.prototype);
Overlay.prototype.constructor = Overlay;

/* Set the overlays secondary images */
Overlay.prototype.setSecondaryImages = function (images, filter = "") {
    this.secondaryImages = images;
    this.scrollbars[1].setSize(this.secondaryImages.length);
    this.secondaryFilter = filter;
}

/**
 * Set the opacity level for the top layer images
 * @param {string} opacity opacity value of top layer of images
 */
Overlay.prototype.setOpacity = function (opacity) {
    this.opacity = opacity;
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
        frames: [],
        timestamps: [],
        images: [],
        secondaryImages: [],
        filters: this.filters,
        filter: this.filter,
        secondaryFilter: this.secondaryFilter,
        viewportX: this.viewportX,
        viewportY: this.viewportY,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
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
    this.secondaryImages = json.secondaryImages;
    this.filters = json.filters;
    this.filter = json.filter;
    this.secondaryFilter = json.secondaryFilter;
    this.viewportX = json.viewportX;
    this.viewportY = json.viewportY;
    this.viewportWidth = json.viewportWidth;
    this.viewportHeight = json.viewportHeight;
    this.scrollbars = this.scrollbars.map((scrollbar, index) => scrollbar.fromJSON(json.scrollbars[index]));
    this.mainScrollbarIndex = json.mainScrollbarIndex;
    this.locked = json.locked;
    this.opacity = json.opacity;
    return this;
}