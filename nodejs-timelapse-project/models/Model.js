/* Application Model */
"use strict";
function Model() {
    this.imagePath = "./img/";
    this.maxImages = 1000;
    this.headerHeight = 100;
    this.canvasWidth = windowWidth * 0.98;
    this.canvasHeight = windowHeight * 3;
    this.displayWidth = 350;
    this.displayHeight = 350;
    this.displayPadding = 10;
    this.displayScrollbarHeight = 30;
    this.displaysPerRow = Math.floor(this.canvasWidth / (this.displayWidth + this.displayPadding * 3));

    this.loader = new Loader(this.maxImages, this.imagePath);
    this.datasets = [];
    this.normalized = true;
    this.loading = 0;
    this.displays = [];
    this.configs = [];
    this.globalScrollbarHeight = 40;
    this.globalScrollbar = new Scrollbar(
        "global",
        0,
        windowHeight + scrollY - this.headerHeight - this.globalScrollbarHeight,
        this.canvasWidth,
        this.globalScrollbarHeight,
        this.maxImages,
    );
    this.subscribers = [];
}

/**
 * Update the dimensions of the canvas in the model (and update any objects within the canvas that may be affected).
 * @param {number} width new canvas width
 * @param {number} height new canvas height
 */
Model.prototype.updateCanvas = function () {
    this.canvasWidth = windowWidth * 0.98;
    this.canvasHeight = windowHeight * 3;;
    this.displaysPerRow = Math.floor(this.canvasWidth / (this.displayWidth + this.displayPadding * 3));
    this.globalScrollbar.setLocation(0, windowHeight + scrollY - this.headerHeight - this.globalScrollbarHeight);
    this.globalScrollbar.setDimensions(this.canvasWidth, this.globalScrollbarHeight);
    this.displays.forEach((display, index) => {
        display.setLocation(generateDisplayX(this, index), generateDisplayY(this, index));
    });
    resizeCanvas(this.canvasWidth, this.canvasHeight);
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
 * @param {Scrollbar} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setIndexFromMouse = function (focusedObject, mx) {
    this.setIndex(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the index of a specific display/scrollbar
 * @param {Scrollbar} focusedObject relevant display/scrollbar
 * @param {number} index index to set in the display
 */
Model.prototype.setIndex = function (focusedObject, index) {
    focusedObject.setIndex(index, this.normalized);
    this.notifySubscribers();
}

/**
 * Set the start index of thefocused display/scrollbar based on the position of the cursor
 * @param {Scrollbar} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setStartFromMouse = function (focusedObject, mx) {
    this.setStart(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the start index of a specific display/scrollbar
 * @param {Scrollbar} focusedObject relevant display/scrollbar
 * @param {number} index start index to set in the display
 */
Model.prototype.setStart = function (focusedObject, index) {
    focusedObject.setStart(index);
    this.notifySubscribers();
}

/**
 * Set the end index of the focused display/scrollbar based on the position of the cursor
 * @param {Scrollbar} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setEndFromMouse = function (focusedObject, mx) {
    this.setEnd(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the end index of a specific display/scrollbar
 * @param {Scrollbar} focusedObject relevant display/scrollbar
 * @param {number} index end index to set in the display
 */
Model.prototype.setEnd = function (focusedObject, index) {
    focusedObject.setEnd(index);
    this.notifySubscribers();
}

/**
 * Map the mouses x coordinate to an index in the display/scrollbar
 * @param {Scrollbar} focusedObject object mouse is focused on
 * @param {number} mx x coordinate of the cursor
 * @returns {number}
 */
Model.prototype.getIndexFromMouse = function (focusedObject, mx) {
    return getIndexFromMouse(
        focusedObject.x,
        mx,
        focusedObject.getSize(),
        focusedObject.width
    );
}

/**
 * Model check if a display was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|null}
 */
Model.prototype.checkDisplayHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkHit(mx, my)) return this.displays[i];
    }
    return null;
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
 * Model check if a scrollbar was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Scrollbar|null}
 */
Model.prototype.checkScrollbarHit = function (mx, my) {
    if (this.globalScrollbar?.checkScrollbarHit(mx, my)) return this.globalScrollbar;
    for (let i = 0; i < this.displays.length; i++) {
        let index = this.displays[i].checkScrollbarHit(mx, my);
        if (index >= 0) return this.displays[i].scrollbars[index];
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
    if (target instanceof Scrollbar) {
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
    const target = this.checkScrollbarHit(mx, my);
    const hitMargin = 5;
    if (target instanceof Scrollbar) {
        for (let i = 0; i < this.configs.length; i++) {
            const index = this.findConfigIndex(target.id, this.configs[i]);
            if (index >= 0) {
                let pos = target.getPositionOfIndex(index);
                if (mx > pos - 2 - hitMargin && mx < pos + 2 + hitMargin && my < target.y + 4 + hitMargin) {
                    return this.configs[i];
                }
            }
        }
    }
    return null;
}

/**
 * Find the index of a scrollbar within a configuration
 * @param {string} id id of scrollbar you want to find
 * @param {Object} config config to search
 * @returns {number}
 */
Model.prototype.findConfigIndex = function (id, config) {
    if (config.globalScrollbar.id === id) {
        return config.globalScrollbar.index;
    } else {
        for (let i = 0; i < config.displays.length; i++) {
            const display = config.displays[i];
            for (let j = 0; j < display.scrollbars.length; j++) {
                if (display.scrollbars[j].id === id) {
                    return display.scrollbars[j].index;
                }
            }
        }
    }
    return -1;
}

/**
 * Add a display to the model
 * @param {Display} display new display
 */
Model.prototype.addDisplay = function (display) {
    this.displays.push(display);
    this.globalScrollbar.addChild(display.getMainScrollbar());
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
    this.globalScrollbar.addChild(overlay.getMainScrollbar());
    this.notifySubscribers();
}

/**
 * Move a display to the position of a target display and update the locations of all affected displays.
 * @param {Display|Overlay} display display to move
 * @param {Display} target target with the displays new location
 */
Model.prototype.moveDisplay = function (display, target) {
    let index = this.displays.findIndex(d => d === display);
    let targetIndex = this.displays.findIndex(d => d === target);
    if (index >= 0 && targetIndex >= 0 && index !== targetIndex) {
        this.displays.splice(index, 1);
        this.displays.splice(targetIndex, 0, display);
        this.updateCanvas();
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
        this.displays.splice(index, 1);
        this.updateCanvas();
    }
    this.notifySubscribers();
}

/**
 * Add a system configuration in JSON format to the model.
 */
Model.prototype.addConfig = function () {
    let name = prompt("Enter a name for this config:", `config-${this.configs.length}`);
    if (!!name && !this.configs.some(config => config.name === name)) {
        let config = {
            name: name,
            displays: this.displays.map(display => display.toJSON()),
            globalScrollbar: this.globalScrollbar.toJSON(),
            scrollPos: [scrollX, scrollY],
            normalized: this.normalized,
        };
        this.configs.push(config);
        alert(`Successfully created configuration with name "${name}"`);
        this.notifySubscribers();
    } else {
        alert(`Error: invalid configuration name`);
    }
}

/**
 * Load a saved config
 * @param {Object} config configuration
 */
Model.prototype.loadConfig = async function (config) {
    /* Load global scrollbar from JSON */
    this.globalScrollbar.fromJSON(config.globalScrollbar);
    for (let i = 0; i < config.displays.length; i++) {
        let display = this.displays.find(display => display.id === config.displays[i].id);
        let json = {...config.displays[i]};
        if (!display) {
            /* Create new display from JSON */
            display = await new Promise((resolve, reject) => {this.loadDataset(getDisplayNameFromId(json.id), {
                dir: json.filter !== "" ? json.filter : undefined,
                filter: json.filter,
                callback: (display) => { resolve(display) },
                errCallback: () => { reject(null) },
            })});
            if (display === null) return;
        } 
        json.frames = display.frames;
        json.timestamps = display.timestamps;
        if (display.filter !== json.filter) {
            /* If primary filter is different, need to load in primary filter images */
            await new Promise((resolve, reject) => {this.loadDataset(getDisplayNameFromId(json.id), {
                dir: json.filter !== "" ? json.filter : undefined,
                filter: json.filter,
                display: display,
                callback: (display) => { resolve(display) },
                errCallback: () => { reject(null) },
            })});
        }
        json.images = display.images;
        display.fromJSON(json);
    }
    /* Link up all global scrollbar links and children */
    const allScrollbars = this.findAllScrollbars();
    this.globalScrollbar.children = [];
    config.globalScrollbar.children.forEach(id => {
        let foundChild = allScrollbars.find(s => s.id === id);
        if (foundChild) this.globalScrollbar.children.push(foundChild);
    });
    this.globalScrollbar.links = [];
    config.globalScrollbar.links.forEach(id => {
        let foundLink = allScrollbars.find(s => s.id === id);
        if (foundLink) this.globalScrollbar.links.push(foundLink);
    });
    /* Link up all other scrollbar links and children */
    config.displays.forEach(configDisplay => {
        configDisplay.scrollbars.forEach(configScrollbar => {
            let scrollbar = allScrollbars.find(scrollbar => scrollbar.id === configScrollbar.id);
            scrollbar.children = [];
            configScrollbar.children.forEach(id => {
                let foundChild = allScrollbars.find(s => s.id === id);
                if (foundChild) scrollbar.children.push(foundChild);
            });
            scrollbar.links = [];
            configScrollbar.children.forEach(id => {
                let foundLink = allScrollbars.find(s => s.id === id);
                if (foundLink) scrollbar.links.push(foundLink);
            });
        });
    });
    /* TODO: Update positions to match config */
    this.setNormalized(config.normalized);
    window.scrollTo(config.scrollPos[0], config.scrollPos[1]);
    this.updateCanvas();
    console.log(`Successfully loaded config "${config.name}"`);
    this.notifySubscribers();
}

/**
 * Gather all scrollbars from the model into an array.
 * @returns {Array<Scrollbar>}
 */
Model.prototype.findAllScrollbars = function () {
    let result = [this.globalScrollbar];
    this.displays.forEach(display => {
        display.scrollbars.forEach(scrollbar => result.push(scrollbar));
    });
    return result;
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
    /* Callback options */
    const callback = options.callback || (() => { });
    const errCallback = options.errCallback || (() => { });
    let dataset = this.datasets.find(d => d.name === name);
    if (!!dataset) {
        /* All other options */
        const dir = options.dir || dataset.dir;
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
                    display = new Display(
                        generateDisplayId(this, loadObj.name),
                        generateDisplayX(this, this.displays.length),
                        generateDisplayY(this, this.displays.length),
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
                errCallback("Error: could not load dataset");
            }
        );
    } else {
        errCallback("Error: dataset does not exist in model");
    }
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged())
}
