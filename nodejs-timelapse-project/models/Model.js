/* Application Model */
function Model() {
    this.datasets = [];
    this.normalized = true;
    this.loading = 0;
    this.displays = [];
    this.configs = [];
    this.globalScrollbar = null;
    this.offset = 0;
    this.subscribers = [];
}

/**
 * Set the number of displays that are allowed to be drawn in a single row
 * @param {number} size number of displays allowed per row
 */
Model.prototype.setDisplaysPerRow = function (size) {
    this.displaysPerRow = size;
}

/**
 * Set known datasets in the system
 * @param {Array<string>} datasets a list of dataset names
 */
Model.prototype.setDatasets = function (datasets) {
    this.datasets = datasets;
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
 * @param {Display|GlobalScrollbar} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setIndexFromMouse = function (focusedObject, mx) {
    this.setIndex(focusedObject, this.getIndexFromMouse(focusedObject, mx));
}

/**
 * Set the index of a specific display/scrollbar
 * @param {Display|GlobalScrollbar} focusedObject relevant display/scrollbar
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
 * @param {Display|GlobalScrollbar} focusedObject object mouse is focused on
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
 * @returns {Display|GlobalScrollbar|null}
 */
Model.prototype.checkScrollbarHit = function (mx, my) {
    if (this.globalScrollbar?.checkScrollbarHit(mx, my)) return this.globalScrollbar;
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkScrollbarHit(mx, my)) return this.displays[i];
    }
    return null;
}

/**
 * Model check if a config dot was hit in a mouse event
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {Object|null}
 */
Model.prototype.checkDotHit = function (mx, my) {
    let target = this.checkScrollbarHit(mx, my);
    if (target instanceof Display) {
        for (let i = 0; i < this.configs.length; i++) {
            let match = this.configs[i].displays.find(display => display.id === target.id);
            if (match) {
                let pos = target.getPositionOfIndex(match.index);
                if (mx > pos - 2 && mx < pos + 2 && my < target.getScrollbarTop() + 4) {
                    return this.configs[i];
                }
            }
        }
    } else if (target instanceof GlobalScrollbar) {
        for (let i = 0; i < this.configs.length; i++) {
            let index = this.configs[i].globalScrollbar.index;
            let pos = target.getPositionOfIndex(index);
            if (mx > pos - 2 && mx < pos + 2 && my < target.getScrollbarTop() + 4) {
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
            config.displays.push({
                id: display.id,
                name: getDisplayNameFromId(display.id),
                index: display.index,
                start: display.start,
                end: display.end,
            });
        });
        this.configs.push(config);
        this.notifySubscribers();
    }
}

/**
 * Load a saved config
 * @param {string} configName name of configuration
 */
Model.prototype.loadConfig = function (configName) {
    let config = this.configs.find(config => config.name === configName);
    if (config) {
        this.globalScrollbar.setIndex(config.globalScrollbar.index);
        this.offset = this.globalScrollbar.index;
        config.displays.forEach(configDisplay => {
            let display = this.displays.find(display => display.id === configDisplay.id);
            if (display) {
                display.setStart(configDisplay.start);
                display.setEnd(configDisplay.end);
                display.setIndex(configDisplay.index);
            }
        });
        this.setNormalized(config.normalized);
        this.notifySubscribers();
    }
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged())
}
