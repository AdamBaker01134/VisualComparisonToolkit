/* Application Model */
function Model() {
    this.datasets = [];
    this.maxImages = 1000;
    this.imagePath = "./img/";
    this.normalized = true;
    this.loading = 0;
    this.displays = [];
    this.subscribers = [];
}

Model.prototype.setDisplaysPerRow = function (size) {
    this.displaysPerRow = size;
}

Model.prototype.setDatasets = function (datasets) {
    this.datasets = datasets;
}

Model.prototype.setNormalized = function (normalized) {
    this.normalized = normalized
}

Model.prototype.incrementLoading = function () {
    this.loading++;
}

Model.prototype.decrementLoading = function () {
    this.loading--;
    if (this.loading < 0) this.loading = 0;
}

/**
 * Set the focused display based on the position of the cursor
 * @param {Display} display focused display
 * @param {number} mx x coordinate of the cursor
 */
Model.prototype.setIndexFromMouse = function (display, mx) {
    this.setIndex(display, getIndexFromMouse(
        display.x + display.padding,
        mx,
        display.images.length,
        display.width
    ));
}

/**
 * Set the index of a specific display
 * @param {Display} display relevant display
 * @param {number} index index to set in the display
 */
Model.prototype.setIndex = function (display, index) {
    display.setIndex(index);
    this.notifySubscribers();
}

Model.prototype.checkImageHit = function (mx, my) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkImageHit(mx, my)) return this.displays[i];
    }
    return null;
}

Model.prototype.checkScrollbarHit = function (mx, my) {
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
