/* Application Model */
function Model() {
    this.datasets = [];
    this.maxImages = 1000;
    this.imagePath = "./img/";
    this.normalized = true;
    this.loading = 0;
    this.displays = [];
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
 * Set the focused display/scrollbar based on the position of the cursor
 * @param {Display|GlobalScrollbar} focusedObject focused display/scrollbar
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setIndexFromMouse = function (focusedObject, mx) {
    this.setIndex(focusedObject, getIndexFromMouse(
        focusedObject.x + focusedObject.padding,
        mx,
        focusedObject.getSize(),
        focusedObject.width
    ));
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
            display.setIndex(display.index + (this.globalScrollbar.index - this.offset));
        });
        this.offset = this.globalScrollbar.index;
    }
    this.notifySubscribers();
}

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
    if (this.globalScrollbar.checkHit(mx, my)) return this.globalScrollbar;
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkScrollbarHit(mx, my)) return this.displays[i];
    }
    return null;
}

Model.prototype.addDisplay = function (display) {
    this.displays.push(display);
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

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged())
}
