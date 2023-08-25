/* Application Model */
"use strict";
function Model() {
    this.imagePath = "./img";
    this.maxImages = 1000;
    this.headerHeight = 170;
    this.canvasWidth = windowWidth * 0.98;
    this.canvasHeight = windowHeight * 3;
    this.displayPadding = 10;
    this.displayScrollbarHeight = 30;

    this.layoutType = "static";

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
    this.defaultCellWidth = 350;
    this.defaultCellHeight = 350;
    this.cellWidth = this.defaultCellWidth;
    this.cellHeight = this.defaultCellHeight;
    this.rows = Math.floor((this.canvasHeight - this.displayPadding - this.globalScrollbarHeight) / this.cellHeight);
    this.columns = Math.floor((this.canvasWidth - this.displayPadding) / this.cellWidth);

    this.gridActive = false;
    this.showTimestamps = false;

    this.tutorialsOpen = false;

    this.subscribers = [];
}

/**
 * Update the dimensions of the canvas in the model (and update any objects within the canvas that may be affected).
 * @param {number} width new canvas width
 * @param {number} height new canvas height
 */
Model.prototype.updateCanvas = function () {
    this.canvasWidth = windowWidth * 0.98;
    if (this.tutorialsOpen) this.canvasWidth -= 500;
    this.canvasHeight = windowHeight * 3;
    this.globalScrollbar.setLocation(0, windowHeight + scrollY - this.headerHeight - this.globalScrollbarHeight);
    this.globalScrollbar.setDimensions(this.canvasWidth, this.globalScrollbarHeight);
    if (this.layoutType === "static") {
        this.setCellDimensions(this.defaultCellWidth, this.defaultCellHeight);
    } else {
        let largestWidth = this.displays.reduce((largest, display) => {
            if (display === null) return largest;
            if (display.width + display.padding * 2 > largest) return display.width + display.padding * 2;
            else return largest;
        }, 0);
        let largestHeight = this.displays.reduce((largest, display) => {
            if (display === null) return largest;
            if (display.height + display.padding * 2 + display.scrollbarHeight * display.scrollbars.length > largest) return display.height + display.padding * 2 + display.scrollbarHeight * display.scrollbars.length;
            else return largest;
        }, 0);
        if (largestWidth === 0) largestWidth = this.defaultCellWidth;
        if (largestHeight === 0) largestHeight = this.defaultCellHeight;
        this.setCellDimensions(largestWidth, largestHeight);
    }
    this.rows = Math.floor((this.canvasHeight - this.displayPadding) / this.cellHeight);
    this.columns = Math.floor((this.canvasWidth - this.displayPadding - this.globalScrollbarHeight) / this.cellWidth);
    this.displays.forEach((display, index) => {
        if (display === null) return;
        display.setLocation(generateDisplayX(this, index), generateDisplayY(this, index));
        if (display.width + display.padding * 2 > this.cellWidth) {
            const aspectRatio = display.height / display.width;
            let dx = this.cellWidth - (display.width + display.padding * 2);
            let dy = aspectRatio * (display.width + dx) - display.height;
            display.resize(dx, dy);
        }
        if (display.height + display.padding * 2 + display.scrollbarHeight * display.scrollbars.length > this.cellHeight) {
            const aspectRatio = display.width / display.height;
            let dy = this.cellHeight - (display.height + display.padding * 2 + display.scrollbarHeight * display.scrollbars.length);
            let dx = aspectRatio * (display.height + dy) - display.width;
            display.resize(dx, dy);
        }
    });
    resizeCanvas(this.canvasWidth, this.canvasHeight);
    this.notifySubscribers();
}

/**
 * Set the width and height of the grid cells.
 * @param {number} width new cell width
 * @param {*} height new cell height
 */
Model.prototype.setCellDimensions = function (width, height) {
    this.cellWidth = width;
    this.cellHeight = height;
    this.notifySubscribers();
}

/**
 * Search for and retrieve a dataset with a specific name
 * @param {string} name name of the dataset
 * @returns {Object|undefined}
 */
Model.prototype.getDatasetFromName = function (name) {
    const dataset = this.datasets.find(dataset => dataset.dir === name);
    if (dataset) return dataset;
    return null;
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
    this.normalized = normalized;
    this.notifySubscribers();
}

/**
 * Set the layout type in the model.
 * @param {string} type layout type (must be "static" or "dynamic")
 */
Model.prototype.setLayoutType = function (type) {
    if ((type === "static" || type === "dynamic") && this.layoutType !== type) {
        this.layoutType = type;
        this.updateCanvas();
    }
    this.notifySubscribers();
}

/**
 * Set the gridActive model state.
 * @param {boolean} active active state
 */
Model.prototype.setGridActive = function (active) {
    this.gridActive = active;
    this.notifySubscribers();
}

/**
 * Toggle the visibility of timestamps in the system.
 */
Model.prototype.toggleTimestamps = function () {
    this.showTimestamps = !this.showTimestamps;
    this.notifySubscribers();
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
 * Resize all displays within the model.
 * @param {number} dx change in the x direction of the mouse
 * @param {number} dy change in the y direction of the mouse
 */
Model.prototype.resizeAll = function (dx, dy) {
    this.displays.forEach(display => display.resize(dx, dy));
    this.notifySubscribers();
}

/**
 * Model check if a display was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|null}
 */
Model.prototype.checkDisplayHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i] !== null) {
            if (this.displays[i].checkHit(mx, my)) return this.displays[i];
        }
    }
    return null;
}

/**
 * Model check if a displays bottom right corner was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|null}
 */
Model.prototype.checkCornerHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i] !== null) {
            if (this.displays[i].checkCornerHit(mx, my)) return this.displays[i];
        }
    }
    return null;
}

/**
 * Model check if a displays comparison slider was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|null}
 */
Model.prototype.checkComparisonSliderHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i] instanceof Overlay) {
            if (this.displays[i].checkComparisonSliderHit(mx, my)) return this.displays[i];
        }
    }
    return null;
}

/**
 * Model check if a displays magic lens was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Display|null}
 */
Model.prototype.checkMagicLensHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i] instanceof Overlay) {
            if (this.displays[i].checkMagicLensHit(mx, my)) return this.displays[i];
        }
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
        if (this.displays[i] !== null) {
            if (this.displays[i].checkImageHit(mx, my)) return this.displays[i];
        }
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
        if (this.displays[i] !== null) {
            let index = this.displays[i].checkScrollbarHit(mx, my);
            if (index >= 0) return this.displays[i].scrollbars[index];
        }
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
 * Model check if a grid cell was hit in a mouse event.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {number} grid cell index or -1 if grid cell was not hit
 */
Model.prototype.checkGridCellHit = function (mx, my) {
    for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
            if (mx > j * this.cellWidth && mx < (j + 1) * this.cellWidth &&
                my > i * this.cellHeight && my < (i + 1) * this.cellHeight) {
                return i * this.columns + j;
            }
        }
    }
    return -1;
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
 * @param {Object} dataset dataset object to add as a display
 * @param {string} filter filter to initialize display with
 * @returns {Promise}
 */
Model.prototype.addDisplay = async function (dataset, filter) {
    if (this.displays.length >= this.rows * this.columns) throw new Error("Error: maximum displays reached")
    return this.loadDisplay(dataset, filter).then(display => {
        const openCell = this.displays.findIndex(display => display === null);
        if (openCell >= 0) {
            this.displays[openCell] = display;
        } else {
            this.displays.push(display);
        }
        this.globalScrollbar.addChild(display.getMainScrollbar());

        if (this.layoutType === "dynamic") this.updateCanvas();

        this.notifySubscribers();

        return display;
    });
}

/**
 * Load in a new display to the model.
 * @param {Object} dataset dataset object to load into a display
 * @returns {Display|null}
 */
Model.prototype.loadDisplay = async function (dataset, filter) {
    if (dataset) {
        const loadObj = await new Promise((resolve, reject) => {
            this.loadDataset({
                dataset: dataset,
                filter: filter !== "" ? filter : "original",
                callback: (loadObj) => resolve(loadObj),
                errCallback: () => reject(null),
            });
        });
        if (loadObj !== null) {
            let width = loadObj.images[0].width;
            let height = loadObj.images[0].height;
            const widthRatio = (this.cellWidth - this.displayPadding * 2) / width;
            if (widthRatio < 1) {
                width *= widthRatio;
                height *= widthRatio;
            }
            const heightRatio = (this.cellHeight - (this.displayPadding * 2 + this.displayScrollbarHeight * 1)) / height;
            if (heightRatio < 1) {
                width *= heightRatio;
                height *= heightRatio;
            }
            let position = this.displays.findIndex(display => display === null);
            if (position < 0) {
                position = this.displays.length;
            }
            return new Display(
                generateDisplayId(this, loadObj.dir),
                generateDisplayX(this, position),
                generateDisplayY(this, position),
                width,
                height,
                this.displayPadding,
                this.displayScrollbarHeight,
                loadObj.frames,
                loadObj.timestamps,
                loadObj.images,
                loadObj.filters,
            );
        } else {
            throw new Error("Error: could not load dataset");
        }
    } else {
        throw new Error("Error: specified dataset does not exist or is not visible in this instance");
    }
}

/**
 * Load in and add a new overlay to the model.
 * @param {string} id1 id of top display
 * @param {string} id2 id of bottom display
 * @param {string} filter1 filter of top display
 * @param {string} filter2 filter of bottom display
 * @returns {Promise}
 */
Model.prototype.addOverlay = async function (id1, id2, filter1, filter2) {
    if (this.displays.length >= this.rows * this.columns) throw new Error("Error: maximum displays reached");
    return this.loadOverlay(id1, id2, filter1, filter2).then(overlay => {
        const targetIndex = this.displays.findIndex(display => display !== null && display.id === id1);
        if (targetIndex >= 0) {
            /* Insert overlay into display2's position */
            this.insertDisplay(overlay, targetIndex);
        } else {
            this.displays.push(overlay);
        }

        this.globalScrollbar.addChild(overlay.getMainScrollbar());

        if (this.layoutType === "dynamic") this.updateCanvas();

        this.notifySubscribers();

        return overlay
    });
}

/**
 * Load in a new overlay to the model.
 * @param {string} id1 id of top display
 * @param {string} id2 id of bottom display
 * @param {string} filter1 filter of top display
 * @param {string} filter2 filter of bottom display
 * @returns {Overlay|null}
 */
Model.prototype.loadOverlay = async function (id1, id2, filter1, filter2) {
    let display1 = await new Promise((resolve, reject) => {
        const found = this.displays.find(display => display !== null && display.id === id1);
        if (found) {
            resolve(found);
        } else {
            this.loadDisplay(this.getDatasetFromName(getDisplayNameFromId(id1)), filter1).then(display => resolve(display))
                .catch(() => reject(null));
        }
    });
    let display2 = await new Promise((resolve, reject) => {
        const found = this.displays.find(display => display !== null && display.id === id2);
        if (found) {
            resolve(found);
        } else {
            this.loadDisplay(this.getDatasetFromName(getDisplayNameFromId(id2)), filter2).then(display => resolve(display))
                .catch(() => reject(null));
        }
    })
    if (display1 && display2) {
        let width = display2.getLayerImages()[0].width;
        let height = display2.getLayerImages()[0].height;
        const widthRatio = (this.cellWidth - this.displayPadding * 2) / width;
        if (widthRatio < 1) {
            width *= widthRatio;
            height *= widthRatio;
        }
        const heightRatio = (this.cellHeight - (this.displayPadding * 2 + this.displayScrollbarHeight * 3)) / height;
        if (heightRatio < 1) {
            width *= heightRatio;
            height *= heightRatio;
        }
        let position = this.displays.findIndex(display => display === null);
        if (position < 0) {
            position = this.displays.length;
        }
        return new Overlay(
            generateOverlayId(this, id1, id2),
            generateDisplayX(this, position),
            generateDisplayY(this, position),
            width,
            height,
            this.displayPadding,
            this.displayScrollbarHeight,
            display1,
            display2,
        );
    } else {
        throw new Error("Error: could not load displays for overlay");
    }
}

/**
 * Add a layer to an overlay display.
 * @param {Overlay} overlay overlay to add a layer to
 * @param {Display} layer display that will become a new layer of the overlay
 */
Model.prototype.addLayer = function (overlay, layer) {
    if (overlay instanceof Overlay && layer instanceof Display && !(layer instanceof Overlay)) {
        overlay.addLayer(layer);
    }
}

/**
 * Cycle the layers of the selection.
 * @param {Overlay} overlay overlay display to cycle layers
 */
Model.prototype.cycleLayers = function (overlay) {
    if (overlay instanceof Overlay) {
        overlay.cycleLayers();
        this.notifySubscribers();
    }
}

/**
 * Load in filtered images and set them as the bottom layer of an existing display
 * @param {Display|Overlay} display display to filter
 * @param {string} filter name of the filter
 */
Model.prototype.filterImages = async function (display, filter) {
    const layerIndex = display.layers.length - 1;
    const layerId = display.getLayerId(layerIndex);
    const name = getDisplayNameFromId(layerId);
    const dataset = this.getDatasetFromName(name);
    if (dataset) {
        const loadObj = await new Promise((resolve, reject) => {
            this.loadDataset({
                dataset: dataset,
                filter: filter !== "" ? filter : "original",
                callback: (loadObj) => resolve(loadObj),
                errCallback: () => resolve(null),
            });
        });
        if (loadObj !== null) {
            display.setImages(loadObj.images, filter, layerIndex);
            this.notifySubscribers();
        }
    }
}

/**
 * Move a display to a target cell, swap positions with display if cell is occupied
 * @param {Display|Overlay} display display to move
 * @param {number} targetIndex targeted grid cell index
 */
Model.prototype.moveDisplay = function (display, targetIndex) {
    const index = this.displays.findIndex(d => d === display);
    if (index < 0 || index === targetIndex) return;
    this.displays[index] = null;
    if (this.displays.length > targetIndex) {
        if (this.displays[targetIndex] !== null) {
            /* Swap the display and targets positions */
            this.displays[index] = this.displays[targetIndex];
            this.displays[targetIndex] = display;
        } else {
            /* Set the displays position to the target position */
            this.displays[targetIndex] = display;
        }
    } else {
        /* Fill displays array with null values to ensure that indexing isn't out of bounds */
        this.displays.fillWith(null, this.displays.length, targetIndex + 1);
        this.displays[targetIndex] = display;
    }
    this.updateCanvas();
    this.notifySubscribers();
}

/**
 * Insert a display at a target cell, shifting existing cells recursively until an open cell is found
 * @param {Display|Overlay} display display to insert
 * @param {number} targetIndex target grid cell index
 */
Model.prototype.insertDisplay = function (display, targetIndex) {
    if (targetIndex >= this.displays.length) {
        /* Fill array with null objects to ensure our indexing doesn't break */
        this.displays.fillWith(null, this.displays.length, targetIndex + 1);
    }
    if (this.displays[targetIndex] === null) {
        /* Insert display into open cell */
        this.displays[targetIndex] = display;
        this.updateCanvas();
        this.notifySubscribers();
    } else {
        /* Insert display and recurse */
        const target = this.displays[targetIndex];
        this.displays[targetIndex] = display;
        this.insertDisplay(target, targetIndex + 1);
    }
}

/**
 * Remove a display and update the locations of all affected displays.
 * @param {Display} display relevant display
 */
Model.prototype.removeDisplay = function (display) {
    let index = this.displays.findIndex(d => d === display);
    if (index < 0) return;
    this.displays[index] = null;
    this.updateCanvas();
    this.notifySubscribers();
}

/**
 * Add a system snapshot in JSON format to the model.
 */
Model.prototype.addSnapshot = function () {
    let name = null;
    let validName = false;
    const defaultName = `snapshot-${this.snapshots.length}`;
    while (!validName) {
        name = prompt("Enter a name for this snapshot:", defaultName);
        if (name === null) {
            return;
        } else if (name.trim() === "") {
            alert("Error: Snapshot name must not be empty");
        } else if (this.snapshots.some(snapshot => snapshot.name === name)) {
            alert("Error: Snapshot name already exists");
        } else {
            validName = true;
        }
    }
    let snapshot = {
        name: name,
        displays: this.displays.map((display, position) => {
            if (display === null) return null;
            let json = display.toJSON();
            json.position = position;
            return json;
        }).filter(display => display !== null),
        globalScrollbar: this.globalScrollbar.toJSON(),
        scrollPos: [scrollX, scrollY],
        normalized: this.normalized,
        layoutType: this.layoutType,
    };
    alert(`Successfully created snapshot with name "${name}"`);
    // fetch("http://localhost:3019/addSnapshot", {
    fetch("http://hci-sandbox.usask.ca:3019/addSnapshot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: snapshot }),
    }).then(response => {
        if (response.status !== 200) {
            alert("Error: Did not write to snapshots JSON.");
        } else {
            this.loadSnapshots();
        }
    }).catch(err => console.error(err));
    this.notifySubscribers();
}

/**
 * Load a saved snapshot
 * @param {Object} snapshot snapshot object
 */
Model.prototype.loadSnapshot = async function (snapshot) {
    this.setNormalized(snapshot.normalized);
    this.setLayoutType(snapshot.layoutType);
    /* Load global scrollbar from JSON */
    this.globalScrollbar.fromJSON(snapshot.globalScrollbar);
    /* Clear all displays that are not included in the snapshot */
    this.displays = this.displays.filter(display => {
        if (display === null) return false;
        if (snapshot.displays.find(displayJSON => display.id === displayJSON.id)) return true;
    });
    const snapshotDisplays = snapshot.displays.filter(displayJSON => displayJSON.type === "DISPLAY");
    const snapshotOverlays = snapshot.displays.filter(displayJSON => displayJSON.type === "OVERLAY");
    /* Load in all displays from JSON */
    for (let i = 0; i < snapshotDisplays.length; i++) {
        let display = this.displays.find(display => display !== null && display.id === snapshotDisplays[i].id);
        const json = { ...snapshotDisplays[i] };
        if (!display) {
            /* Create new display from JSON */
            display = await this.loadDisplay(this.getDatasetFromName(getDisplayNameFromId(json.id)), json.layers[0].filter);
        }
        if (display instanceof Display) {
            json.layers[0] = {
                ...json.layers[0],
                frames: display.getLayerFrames(),
                timestamps: display.getLayerTimestamps(),
                images: display.getLayerImages(),
            };
            display.fromJSON(json);
            const originalPosition = this.displays.findIndex(d => d !== null && d.id === display.id);
            if (originalPosition !== json.position) {
                if (originalPosition >= 0) {
                    this.displays[originalPosition] = null;
                }
                this.insertDisplay(display, json.position);
            }
        } else {
            console.error(`Failed to create display with id "${json.id}`);
        }
    }
    /* Load in all overlays from JSON */
    for (let j = 0; j < snapshotOverlays.length; j++) {
        let overlay = this.displays.find(overlay => overlay !== null && overlay.id === snapshotOverlays[j].id);
        const json = { ...snapshotOverlays[j] };
        if (!overlay) {
            /* Create new overlay from JSON */
            overlay = await this.loadOverlay(json.layers[0].id, json.layers[1].id, json.layers[0].filter, json.layers[1].filter);
        }
        if (overlay instanceof Overlay) {
            /* Restore all overlay layers */
            for (let i = 0; i < json.layers.length; i++) {
                let layer = json.layers[i];
                if (overlay.layers.length <= i) {
                    let display = await this.loadDisplay(this.getDatasetFromName(getDisplayNameFromId(layer.id)), layer.filter);
                    overlay.addLayer(display);
                }
                layer.frames = overlay.getLayerFrames(i);
                layer.timestamps = overlay.getLayerTimestamps(i);
                layer.images = overlay.getLayerImages(i);
            }
            if (overlay.scrollbars.length > json.scrollbars.length) {
                /* Ensure overlay scrollbar length equals the json overlay scrollbar length */
                overlay.scrollbars = overlay.scrollbars.slice(0, json.scrollbars.length);
            }
            overlay.fromJSON(json);
            const originalPosition = this.displays.findIndex(d => d !== null && d.id === overlay.id);
            if (originalPosition !== json.position) {
                if (originalPosition >= 0) {
                    this.displays[originalPosition] = null;
                }
                this.insertDisplay(overlay, json.position);
            }
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
            snapshotScrollbar.links.forEach(id => {
                let foundLink = allScrollbars.find(s => s.id === id);
                if (foundLink) {
                    scrollbar.removeLink(foundLink);
                    scrollbar.addLink(foundLink);
                }
            });
        });
    });
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
        if (display === null) return;
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
    const callback = options.callback || (() => { });
    const errCallback = options.errCallback || (() => { });
    if (!!options.dataset) {
        this.incrementLoading();
        const start = performance.now();
        console.log(`Beginning load of ${options.dataset.dir} from /${options.filter}...`);
        this.loader.initDatasetLoad(
            options.dataset,
            options.filter,
            loadObj => {
                this.decrementLoading();
                console.log(
                    `Finished loading ${loadObj.dir}/${loadObj.filter} in ${Math.floor(performance.now() - start)}ms. \
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

/**
 * Toggle the open state of the tutorials sidebar.
 */
Model.prototype.toggleTutorials = function () {
    this.tutorialsOpen = !this.tutorialsOpen;
    this.updateCanvas();
    this.notifySubscribers();
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged())
}
