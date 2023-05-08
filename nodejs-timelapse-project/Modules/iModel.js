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