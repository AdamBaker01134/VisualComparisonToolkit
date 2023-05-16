/* Application Interaction Model */
function iModel () {
    this.focused = null;
    this.selection = null;
    this.highlightedConfig = null;
    this.ghost = null;
    this.subscribers = [];
}

/**
 * Set the focused display/scrollbar.
 * @param {ScrollbarObject|null} focusedObject display/scrollbar to set as focused
 */
iModel.prototype.setFocused = function (focusedObject) {
    if (this.focused !== focusedObject) {
        this.focused = focusedObject;
        this.notifySubscribers();
    }
}

/**
 * Highlight a configuration
 * @param {string} configName name of configuration
 */
iModel.prototype.highlightConfig = function (configName) {
    if (this.highlightedConfig !== configName) {
        this.highlightedConfig = configName;
        this.notifySubscribers();
    }
}

/**
 * Unhighlight a configuration
 */
iModel.prototype.unhighlightConfig = function () {
    if (this.highlightedConfig !== null) {
        this.highlightedConfig = null;
        this.notifySubscribers();
    }
}

/**
 * Add a ghost to be shown as a display being dragged
 * @param {Display|null} display display that is being dragged
 */
iModel.prototype.setGhost = function (display) {
    this.ghost = display;
    this.notifySubscribers();
}

/**
 * Ghost has moved, so subscribers need to be notified.
 */
iModel.prototype.updateGhost = function () {
    this.notifySubscribers();
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