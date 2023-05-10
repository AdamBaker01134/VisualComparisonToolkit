/* Application Interaction Model */
function iModel () {
    this.focused = null;
    this.selection = null;
    this.configs = [];
    this.subscribers = [];
}

/**
 * Set the focused display.
 * @param {Display|null} display display to set as focused
 */
iModel.prototype.setFocused = function (display) {
    if (this.focused !== display) {
        this.focused = display;
        this.notifySubscribers();
    }
}

/**
 * Select a display.
 * @param {Display} display selected display 
 */
iModel.prototype.select = function (display) {
    if (display === this.selection) {
        /* If display was already selected, unselect it */
        this.selection = null;
    } else {
        this.selection = display;
    }
    this.notifySubscribers();
}

/**
 * Add a saved frame with a custom name to the selected display.
 */
iModel.prototype.saveFrame = function () {
    if (this.selection !== null) {
        let name = prompt("Enter a name for this frame:", `frame-${this.selection.savedFrames.length}`);
        if (!!name) {
            this.selection.addSavedFrame(name, this.selection.index);
        }
        this.notifySubscribers();
    }
}

/**
 * Set the locked state of the selected display
 * @param {boolean} lock true if we want to lock, false if we want to unlock
 */
iModel.prototype.setLocked = function (lock) {
    if (this.selection !== null) {
        this.selection.setLocked(lock);
        this.notifySubscribers();
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