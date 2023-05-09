/* Application Interaction Model */
function iModel () {
    this.focused = null;
    this.selections = [];
    this.subscribers = [];
}

/**
 * Set the focused display.
 * @param {Display|null} display display to set as focused
 */
iModel.prototype.setFocused = function (display) {
    this.focused = display;
    this.notifySubscribers();
}

/**
 * Add a display to the list of selected displays
 * or, remove it if it has already been selected
 * @param {Display} display selected display 
 */
iModel.prototype.select = function (display) {
    let index = this.selections.indexOf(display);
    if (index >= 0) {
        /* If display was already selected, unselect it */
        this.selections.splice(index, 1);
    } else {
        this.selections.push(display);
    }
    this.notifySubscribers();
}

/**
 * Retrieve all saved frames from a selected display.
 * @returns {Array<Object>}
 */
iModel.prototype.getSavedFrames = function () {
    if (this.selections.length === 1) {
        return this.selections[0].savedFrames;
    } else {
        return [];
    }
}

/**
 * Add a saved frame with a custom name to the selected display.
 */
iModel.prototype.saveFrame = function () {
    if (this.selections.length === 1) {
        let name = prompt("Enter a name for this frame:", `frame-${this.selections[0].savedFrames?.length}`);
        if (!!name) {
            this.selections[0].addSavedFrame(name, this.selections[0].index);
        }
    }
}

/**
 * Add an interaction model subscriber
 * @param {*} subscriber Object that is subscribed to the interaction models changes
 */
iModel.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

/**
 * Notify all interaction model subscribers that the model has changed
 */
iModel.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}