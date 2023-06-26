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
    this.snapshots = [];
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
 * Model check if a snapshot benchmark was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Object|null}
 */
Model.prototype.checkBenchmarkHit = function (mx, my) {
    const target = this.checkScrollbarHit(mx, my);
    const hitMargin = 5;
    if (target instanceof Scrollbar) {
        for (let i = 0; i < this.snapshots.length; i++) {
            const index = this.findSnapshotIndex(target.id, this.snapshots[i]);
            if (index >= 0) {
                let pos = target.getPositionOfIndex(index);
                if (mx > pos - 2 - hitMargin && mx < pos + 2 + hitMargin && my < target.y + 4 + hitMargin) {
                    return this.snapshots[i];
                }
            }
        }
    }
    return null;
}

/**
 * Find the index of a scrollbar within a snapshot
 * @param {string} id id of scrollbar you want to find
 * @param {Object} snapshot snapshot to search
 * @returns {number}
 */
Model.prototype.findSnapshotIndex = function (id, snapshot) {
    if (snapshot.globalScrollbar.id === id) {
        return snapshot.globalScrollbar.index;
    } else {
        for (let i = 0; i < snapshot.displays.length; i++) {
            const display = snapshot.displays[i];
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
 * Load in and add a new display to the model.
 * @param {string} name name of the display to load and add
 * @param {string} filter filter to initialize display with
 * @returns {Display|null}
 */
Model.prototype.addDisplay = async function (name, filter) {
    const dataset = this.datasets.find(d => d.name === name);
    let display = null;
    if (dataset) {
        const dir = filter !== "" ? filter : dataset.dir;
        const loadObj = await new Promise((resolve, reject) => {
            this.loadDataset({
                dataset: dataset,
                dir: dir,
                callback: (loadObj) => resolve(loadObj),
                errCallback: () => reject(null),
            });
        });
        if (loadObj !== null) {
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
            this.displays.push(display);
            this.globalScrollbar.addChild(display.getMainScrollbar());
            this.notifySubscribers();
        }
    }
    return display;
}

/**
 * Add a new overlay to the model. Load in required displays if necessary.
 * @param {string} id1 id of top display
 * @param {string} id2 id of bottom display
 * @param {string} filter1 filter of top display
 * @param {string} filter2 filter of bottom display
 * @returns {Overlay|null}
 */
Model.prototype.addOverlay = async function (id1, id2, filter1, filter2) {
    let overlay = null;
    let display1 = await new Promise((resolve, reject) => {
        const found = this.displays.find(display => display.id === id1);
        if (found) {
            resolve(found);
        } else {
            this.addDisplay(getDisplayNameFromId(id1), filter1).then(display => {
                this.removeDisplay(display); // ¯\_(ツ)_/¯
                resolve(display);
            }).catch(() => reject(null));
        }
    });
    let display2 = await new Promise((resolve, reject) => {
        const found = this.displays.find(display => display.id === id2);
        if (found) {
            resolve(found);
        } else {
            this.addDisplay(getDisplayNameFromId(id2), filter2).then(display => {
                this.removeDisplay(display); // ¯\_(ツ)_/¯
                resolve(display);
            }).catch(() => reject(null));
        }
    })
    if (display1 && display2) {
        overlay = new Overlay(
            generateOverlayId(this, id1, id2),
            generateDisplayX(this, this.displays.length),
            generateDisplayY(this, this.displays.length),
            this.displayWidth,
            this.displayHeight,
            this.displayPadding,
            this.displayScrollbarHeight,
            display1,
            display2,
        );
        this.displays.push(overlay);
        this.moveDisplay(overlay, display2);
        this.globalScrollbar.addChild(overlay.getMainScrollbar());
        this.notifySubscribers();
    }
    return overlay;
}

/**
 * Load in filtered images and set in an display existing
 * @param {Display|Overlay} display display to filter
 * @param {string} filter name of the filter
 */
Model.prototype.filterImages = async function (display, filter) {
    const isOverlay = display instanceof Overlay;
    const name = isOverlay ? getSecondaryDisplayNameFromId(display.id) : getDisplayNameFromId(display.id);
    const dataset = this.datasets.find(d => d.name === name);
    if (dataset) {
        const dir = filter !== "" ? filter : dataset.dir;
        const loadObj = await new Promise((resolve, reject) => {
            this.loadDataset({
                dataset: dataset,
                dir: dir,
                callback: (loadObj) => resolve(loadObj),
                errCallback: () => resolve(null),
            });
        });
        if (loadObj !== null) {
            this.setDisplayImages(display, loadObj.images, isOverlay, filter);
        }
    }
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
 * Add a system snapshot in JSON format to the model.
 */
Model.prototype.addSnapshot = function () {
    let name = prompt("Enter a name for this snapshot:", `snapshot-${this.snapshots.length}`);
    if (!!name && !this.snapshots.some(snapshot => snapshot.name === name)) {
        let snapshot = {
            name: name,
            displays: this.displays.map((display, position) => {
                let json = display.toJSON();
                json.position = position;
                return json;
            }),
            globalScrollbar: this.globalScrollbar.toJSON(),
            scrollPos: [scrollX, scrollY],
            normalized: this.normalized,
        };
        alert(`Successfully created snapshot with name "${name}"`);
        fetch("http://localhost:30500/addSnapshot", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snapshot: snapshot }),
        }).then(() => this.loadSnapshots()).catch(err => console.error(err));
        this.notifySubscribers();
    } else {
        alert(`Error: invalid snapshot name`);
    }
}

/**
 * Load a saved snapshot
 * @param {Object} snapshot snapshot object
 */
Model.prototype.loadSnapshot = async function (snapshot) {
    /* Load global scrollbar from JSON */
    this.globalScrollbar.fromJSON(snapshot.globalScrollbar);
    const snapshotDisplays = snapshot.displays.filter(displayJSON => displayJSON.type === "DISPLAY");
    const snapshotOverlays = snapshot.displays.filter(displayJSON => displayJSON.type === "OVERLAY");
    /* Load in all displays from JSON */
    for (let i = 0; i < snapshotDisplays.length; i++) {
        let display = this.displays.find(display => display.id === snapshotDisplays[i].id);
        const json = { ...snapshotDisplays[i] };
        if (!display) {
            /* Create new display from JSON */
            display = await this.addDisplay(getDisplayNameFromId(json.id), json.filter);
        }
        if (display instanceof Display) {
            json.frames = display.frames;
            json.timestamps = display.timestamps;
            json.images = display.images;
            display.fromJSON(json);
        } else {
            console.error(`Failed to create display with id "${json.id}`);
        }
    }
    /* Load in all overlays from JSON */
    for (let j = 0; j < snapshotOverlays.length; j++) {
        let overlay = this.displays.find(overlay => overlay.id === snapshotOverlays[j].id);
        const json = { ...snapshotOverlays[j] };
        if (!overlay) {
            /* Create new overlay from JSON */
            overlay = await this.addOverlay(getPrimaryIdFromId(json.id), getSecondaryIdFromId(json.id));
        }
        if (overlay instanceof Overlay) {
            json.frames = overlay.frames;
            json.timestamps = overlay.timestamps;
            json.images = overlay.images;
            json.secondaryImages = overlay.secondaryImages;
            overlay.fromJSON(json);
        } else {
            console.error(`Failed to create overlay with id "${json.id}"`);
        }
    }
    /* Link up all global scrollbar links and children */
    const allScrollbars = this.findAllScrollbars();
    snapshot.globalScrollbar.children.forEach(id => {
        let foundChild = allScrollbars.find(s => s.id === id);
        if (foundChild) {
            this.globalScrollbar.removeChild(foundChild);
            this.globalScrollbar.addChild(foundChild);
        }
    });
    snapshot.globalScrollbar.links.forEach(id => {
        let foundLink = allScrollbars.find(s => s.id === id);
        if (foundLink) {
            this.globalScrollbar.removeLink(foundLink);
            this.globalScrollbar.addLink(foundLink);
        }
    });
    /* Link up all other scrollbar links and children */
    snapshot.displays.forEach(snapshotDisplay => {
        snapshotDisplay.scrollbars.forEach(snapshotScrollbar => {
            let scrollbar = allScrollbars.find(scrollbar => scrollbar.id === snapshotScrollbar.id);
            snapshotScrollbar.children.forEach(id => {
                let foundChild = allScrollbars.find(s => s.id === id);
                if (foundChild) {
                    scrollbar.removeChild(foundChild);
                    scrollbar.addChild(foundChild);
                }
            });
            snapshotScrollbar.children.forEach(id => {
                let foundLink = allScrollbars.find(s => s.id === id);
                if (foundLink) {
                    scrollbar.removeLink(foundLink);
                    scrollbar.addLink(foundLink);
                }
            });
        });
    });
    /* Update positions to match snapshot */
    snapshot.displays.forEach(snapshotDisplay => {
        if (snapshotDisplay.position >= this.displays.length) return;
        const display = this.displays.find(display => display.id === snapshotDisplay.id);
        const target = this.displays[snapshotDisplay.position];
        if (display) {
            this.moveDisplay(display, target);
        }
    });
    this.setNormalized(snapshot.normalized);
    window.scrollTo(snapshot.scrollPos[0], snapshot.scrollPos[1]);
    this.updateCanvas();
    console.log(`Successfully loaded snapshot "${snapshot.name}"`);
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
 * Load in saved snapshots.
 */
Model.prototype.loadSnapshots = function () {
    this.loader.loadSnapshots().then(snapshots => {
        this.snapshots = snapshots;
        this.notifySubscribers();
    });
}

/**
 * Load in a dataset from the list of datasets.
 * @param {Object} options optional attributes to alter the loading process.
 */
Model.prototype.loadDataset = function (options = {}) {
    const callback = options.callback || (() => {});
    const errCallback = options.errCallback || (() => {});
    if (!!options.dataset) {
        const dir = options.dir || options.dataset.dir;
        this.incrementLoading();
        const start = performance.now();
        console.log(`Beginning load of ${options.dataset.name} from /${dir}...`);
        this.loader.initDatasetLoad(
            options.dataset.name,
            dir,
            loadObj => {
                this.decrementLoading();
                console.log(
                    `Finished loading ${options.dataset.name} in ${Math.floor(performance.now() - start)}ms. \
                    \nLoaded ${loadObj.frames.length} frames. \
                    \nLoaded ${loadObj.timestamps.length} timestamps. \
                    \nLoaded ${loadObj.images.length} images.`
                );
                callback(loadObj);
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
