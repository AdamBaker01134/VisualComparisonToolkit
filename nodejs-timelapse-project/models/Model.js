/* Application Model */
"use strict";
function Model() {
    this.imagePath = "./img/";
    this.maxImages = 1000;
    this.headerHeight = 100;
    this.canvasWidth = innerWidth * 0.98;
    this.canvasHeight = innerHeight * 3;
    this.displayWidth = 350;
    this.displayHeight = 350;
    this.displayPadding = 10;
    this.displayScrollbarHeight = 30;
    this.displaysPerRow = Math.floor(this.canvasWidth / 380);

    this.loader = new Loader(this.maxImages, this.imagePath);
    this.datasets = [];
    this.normalized = true;
    this.loading = 0;
    this.displays = [];
    this.configs = [];
    this.globalScrollbarHeight = 40;
    this.globalScrollbar = new GlobalScrollbar(
        0,
        innerHeight + scrollY - this.headerHeight - this.globalScrollbarHeight,
        this.canvasWidth,
        this.globalScrollbarHeight,
        0,
        this.maxImages,
    );
    this.offset = 0;
    this.subscribers = [];
}

/**
 * Set the number of displays that are allowed to be drawn in a single row
 * @param {number} size number of displays allowed per row
 */
Model.prototype.setDisplaysPerRow = function (size) {
    this.displaysPerRow = size;
    this.notifySubscribers();
}

/**
 * Set a displays images (either primary or secondary depending on the type of display)
 * @param {Display|Overlay} display display to set images
 * @param {Array<p5.Image>} images new set of images
 * @param {boolean} secondary true if we want to set secondary images instead of primary
 * @param {string} filter filter name
 */
Model.prototype.setDisplayImages = function (display, images, secondary, filter = "") {
    if (secondary && display instanceof Overlay) {
        display.setSecondaryImages(images, filter);
    } else {
        display.setImages(images, filter);
    }
    this.notifySubscribers();
}

/**
 * @param {GlobalScrollbar} scrollbar global scrollbar
 */
Model.prototype.setGlobalScrollbar = function (scrollbar) {
    this.globalScrollbar = scrollbar;
    this.notifySubscribers();
}

/**
 * Set the location of the global scrollbar in the canvas.
 * @param {number} newX new x location for the global scrollbar
 * @param {number} newY new y location for the global scrollbar
 */
Model.prototype.setGlobalScrollbarLocation = function (newX, newY) {
    this.globalScrollbar.setLocation(newX, newY);
    this.notifySubscribers();
}

/**
 * Set system normalization state.
 * @param {boolean} normalized normalization state
 */
Model.prototype.setNormalized = function (normalized) {
    this.normalized = normalized
}

/**
 * Increment the number of currently loading sets in the system
 */
Model.prototype.incrementLoading = function () {
    this.loading++;
    this.notifySubscribers();
}

/**
 * Decrement the number of currently loading sets in the system
 */
Model.prototype.decrementLoading = function () {
    this.loading--;
    if (this.loading < 0) this.loading = 0;
    this.notifySubscribers();
}

/**
 * Set the index of the focused display/scrollbar based on the position of the cursor
 * @param {Display|Overlay|GlobalScrollbar} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setIndexFromMouse = function (focusedObject, mx) {
    this.setIndex(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the index of a specific display/scrollbar
 * @param {Display|Overlay|GlobalScrollbar} focusedObject relevant display/scrollbar
 * @param {number} index index to set in the display
 */
Model.prototype.setIndex = function (focusedObject, index) {
    focusedObject.setIndex(index);
    if (focusedObject instanceof GlobalScrollbar) {
        this.displays.forEach(display => {
            let step = 1; /* Normalizing ratio */
            if (this.normalized) {
                step = (display.end - display.start) / focusedObject.getSize();
            }
            display.setIndex(display.index + (this.globalScrollbar.index - this.offset) * step);
        });
        this.offset = this.globalScrollbar.index;
    }
    this.notifySubscribers();
}

/**
 * Set the start index of thefocused display/scrollbar based on the position of the cursor
 * @param {Display} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setStartFromMouse = function (focusedObject, mx) {
    this.setStart(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the start index of a specific display/scrollbar
 * @param {Display} focusedObject relevant display/scrollbar
 * @param {number} index start index to set in the display
 */
Model.prototype.setStart = function (focusedObject, index) {
    focusedObject.setStart(index);
    this.notifySubscribers();
}

/**
 * Set the end index of the focused display/scrollbar based on the position of the cursor
 * @param {Display} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setEndFromMouse = function (focusedObject, mx) {
    this.setEnd(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the end index of a specific display/scrollbar
 * @param {Display} focusedObject relevant display/scrollbar
 * @param {number} index end index to set in the display
 */
Model.prototype.setEnd = function (focusedObject, index) {
    focusedObject.setEnd(index);
    this.notifySubscribers();
}

/**
 * Map the mouses x coordinate to an index in the display/scrollbar
 * @param {Display|Overlay|GlobalScrollbar} focusedObject object mouse is focused on
 * @param {number} mx x coordinate of the cursor
 * @returns {number}
 */
Model.prototype.getIndexFromMouse = function (focusedObject, mx) {
    return getIndexFromMouse(
        focusedObject.x + focusedObject.padding,
        mx,
        focusedObject.getSize(),
        focusedObject.width
    );
}

/**
 * Model check if a display image was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|null}
 */
Model.prototype.checkImageHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkImageHit(mx, my)) return this.displays[i];
    }
    return null;
}

/**
 * Model check if a display/global scrollbar was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|Overlay|GlobalScrollbar|null}
 */
Model.prototype.checkScrollbarHit = function (mx, my) {
    if (this.globalScrollbar?.checkScrollbarHit(mx, my)) return this.globalScrollbar;
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkScrollbarHit(mx, my)) return this.displays[i];
    }
    return null;
}

/**
 * Model check if either the main, start, or end position marker was hit in a mouse event.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {boolean}
 */
Model.prototype.checkPositionMarkerHit = function (mx, my) {
    let target = this.checkScrollbarHit(mx, my);
    if (target !== null) {
        return target.checkMainPositionHit(mx) || target.checkStartHit(mx) || target.checkEndHit(mx);
    }
    return false;
}

/**
 * Model check if an annotation was hit in a mouse event.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Object}
 */
Model.prototype.checkAnnotationHit = function (mx, my) {
    let target = this.checkScrollbarHit(mx, my);
    let hitMargin = 5;
    if (target instanceof Display || target instanceof Overlay) {
        for (let i = 0; i < target.annotations.length; i++) {
            let pos = target.getPositionOfIndex(target.annotations[i].index);
            if (mx > pos - hitMargin && mx < pos + hitMargin) {
                return target.annotations[i];
            }
        }
    }
    return null;
}

/**
 * Model check if a config benchmark was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Object|null}
 */
Model.prototype.checkBenchmarkHit = function (mx, my) {
    let target = this.checkScrollbarHit(mx, my);
    let hitMargin = 5;
    if (target instanceof Display || target instanceof Overlay) {
        for (let i = 0; i < this.configs.length; i++) {
            let match = this.configs[i].displays.find(display => display.id === target.id);
            if (match) {
                let pos = target.getPositionOfIndex(match.index);
                if (mx > pos - 2 - hitMargin && mx < pos + 2 + hitMargin && my < target.getScrollbarTop() + 4 + hitMargin) {
                    return this.configs[i];
                }
            }
        }
    } else if (target instanceof GlobalScrollbar) {
        for (let i = 0; i < this.configs.length; i++) {
            let index = this.configs[i].globalScrollbar.index;
            let pos = target.getPositionOfIndex(index);
            if (mx > pos - 2 - hitMargin && mx < pos + 2 + hitMargin && my < target.getScrollbarTop() + 4 + hitMargin) {
                return this.configs[i];
            }
        }
    }
    return null;
}

/**
 * Add a display to the model
 * @param {Display} display new display
 */
Model.prototype.addDisplay = function (display) {
    this.displays.push(display);
    this.notifySubscribers();
}

/**
 * Add an overlay to the model
 * @param {Overlay} overlay new overlay
 * @param {Display} target target display to move overlay to
 */
Model.prototype.addOverlay = function (overlay, target) {
    this.displays.push(overlay);
    this.moveDisplay(overlay, target);
    this.notifySubscribers();
}

/**
 * Move a display to the position of a target display and update the locations of all affected displays.
 * @param {Display} display display to move
 * @param {Display} target target with the displays new location
 */
Model.prototype.moveDisplay = function (display, target) {
    let index = this.displays.findIndex(d => d === display);
    let targetIndex = this.displays.findIndex(d => d === target);
    if (index >= 0 && targetIndex >= 0 && index !== targetIndex) {
        let savedTargetX = this.displays[targetIndex].x;
        let savedTargetY = this.displays[targetIndex].y;
        if (index < targetIndex) {
            for (let i = targetIndex; i > index; i--) {
                let newX = this.displays[i - 1].x;
                let newY = this.displays[i - 1].y;
                this.displays[i].setLocation(newX, newY);
            }
        } else {
            for (let i = targetIndex; i < index; i++) {
                let newX = this.displays[i + 1].x;
                let newY = this.displays[i + 1].y;
                this.displays[i].setLocation(newX, newY);
            }
        }
        display.setLocation(savedTargetX, savedTargetY);
        this.displays.splice(index, 1);
        this.displays.splice(targetIndex, 0, display);
    }
    this.notifySubscribers();
}

/**
 * Remove a display and update the locations of all affected displays.
 * @param {Display} display relevant display
 */
Model.prototype.removeDisplay = function (display) {
    let index = this.displays.findIndex(d => d === display);
    if (index >= 0) {
        for (let i = this.displays.length - 1; i > index; i--) {
            let newX = this.displays[i - 1].x;
            let newY = this.displays[i - 1].y;
            this.displays[i].setLocation(newX, newY);
        }
        this.displays.splice(index, 1);
    }
    this.notifySubscribers();
}

/**
 * Add a system configuration in JSON format to the model.
 */
Model.prototype.addConfig = function () {
    let name = prompt("Enter a name for this config:", `config-${this.configs.length}`);
    if (!!name) {
        let config = {
            name: name,
            displays: [],
            globalScrollbar: {
                index: this.globalScrollbar.index,
            },
            normalized: this.normalized,
        };
        this.displays.forEach(display => {
            let secondaryName = null;
            let secondaryFilter = null;
            let opacity = null;
            if (display instanceof Overlay) {
                secondaryName = getSecondaryDisplayNameFromId(display.id);
                secondaryFilter = display.secondaryFilter;
                opacity = display.opacity;
            }
            config.displays.push({
                id: display.id,
                name: getDisplayNameFromId(display.id),
                index: display.index,
                start: display.start,
                end: display.end,
                annotations: display.annotations,
                filters: display.filters,
                filter: display.filter,
                locked: display.locked,
                secondaryName: secondaryName,
                secondaryFilter: secondaryFilter,
                opacity: opacity,
            });
        });
        this.configs.push(config);
        this.notifySubscribers();
    }
}

/**
 * Load a saved config
 * @param {Object} config configuration
 */
Model.prototype.loadConfig = function (config) {
    this.globalScrollbar.setIndex(config.globalScrollbar.index);
    this.offset = this.globalScrollbar.index;
    config.displays.forEach(configDisplay => {
        let display = this.displays.find(display => display.id === configDisplay.id);
        if (display) {
            display.setStart(configDisplay.start);
            display.setEnd(configDisplay.end);
            display.setIndex(configDisplay.index);
            if (display instanceof Overlay) {
                display.setOpacity(configDisplay.opacity);
            }
        }
    });
    this.setNormalized(config.normalized);
    this.notifySubscribers();
}

/**
 * Load in pre-processed dataset configurations.
 */
Model.prototype.loadDatasets = function () {
    this.loader.loadDatasets().then(datasets => {
        this.datasets = datasets;
        this.notifySubscribers();
    });
}

/**
 * Load in a dataset from the list of datasets.
 * @param {string} name name of dataset to load.
 * @param {Object} options optional attributes to alter the loading process.
 */
Model.prototype.loadDataset = function (name, options = {}) {
    let dataset = this.datasets.find(d => d.name === name);
    if (!!dataset) {
        /* All possible options */
        const dir = options.dir || dataset.dir;
        const callback = options.callback || (() => { });
        const filter = options.filter || "";
        let display = options.display || null;

        this.incrementLoading();
        const start = performance.now();
        console.log(`Beginning load of ${name} from /${dir}...`);
        this.loader.initDatasetLoad(
            name,
            dir,
            loadObj => {
                this.decrementLoading();
                console.log(
                    `Finished loading ${name} in ${Math.floor(performance.now() - start)}ms. \
                    \nLoaded ${loadObj.frames.length} frames. \
                    \nLoaded ${loadObj.timestamps.length} timestamps. \
                    \nLoaded ${loadObj.images.length} images.`
                );
                if (!!display) {
                    /* If display is already created, simply replace display images */
                    this.setDisplayImages(display, loadObj.images, display instanceof Overlay, filter);
                } else {
                    /* If display is not defined, create a new one populated with loaded information */
                    let column = this.displays.length % this.displaysPerRow;
                    let row = Math.floor(this.displays.length / this.displaysPerRow);
                    display = new Display(
                        generateDisplayId(this, loadObj.name),
                        this.displayPadding + column * (this.displayPadding * 3 + this.displayWidth),
                        this.displayPadding + row * (this.displayPadding * 3 + this.displayHeight + this.displayScrollbarHeight),
                        this.displayWidth,
                        this.displayHeight,
                        this.displayPadding,
                        this.displayScrollbarHeight,
                        loadObj.frames,
                        loadObj.timestamps,
                        loadObj.images,
                        dataset.filters,
                    );
                    this.addDisplay(display);
                }
                callback(display);
            },
            err => {
                console.error(err);
                this.decrementLoading();
            }
        );
    }
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged())
}
