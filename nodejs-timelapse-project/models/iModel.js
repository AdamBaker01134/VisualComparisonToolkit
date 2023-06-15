/* Application Interaction Model */
"use strict";
function iModel () {
    this.focused = null;
    this.selection = null;
    this.highlightedAnnotation = null;
    this.highlightedConfig = null;
    this.ghost = null;
    this.subscribers = [];
}

/**
 * Set the focused display/scrollbar.
 * @param {Display|Overlay|GlobalScrollbar|null} focusedObject display/scrollbar to set as focused
 */
iModel.prototype.setFocused = function (focusedObject) {
    if (this.focused !== focusedObject) {
        this.focused = focusedObject;
        this.notifySubscribers();
    }
}

/**
 * Highlight a configuration
 * @param {Object} config name of configuration
 */
iModel.prototype.highlightConfig = function (config) {
    if (this.highlightedConfig !== config) {
        this.highlightedConfig = config;
        this.notifySubscribers();
    }
}

/**
 * Toggle highlighting of an annotation in a scrollbar.
 * @param {Object} annotation annotation to highlight
 */
iModel.prototype.highlightAnnotation = function (annotation) {
    if (this.highlightedAnnotation !== annotation) {
        this.highlightedAnnotation = annotation;
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
 * Pan the selections viewport location.
 * @param {number} dx change in the x direction of the mouse
 * @param {number} dy change in the y direction of the mouse
 */
iModel.prototype.pan = function (dx, dy) {
    if (this.selection !== null) {
        this.selection.pan(dx, dy);
        this.notifySubscribers();
    }
}

/**
 * Zoom a display by 'delta'
 * @param {Display} display display to zoom
 * @param {number} delta zoom size
 */
iModel.prototype.zoom = function (display, delta) {
    display.zoom(delta);
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
 * Set the opacity of the currently selected display (if it is an overlay that is)
 * @param {string} opacity opacity value (range from 0 to 255)
 */
iModel.prototype.setOpacity = function (opacity) {
    if (this.selection instanceof Overlay) {
        this.selection.setOpacity(opacity);
        this.notifySubscribers();
    }
}

/**
 * Add an annotation with a custom name to the selected display.
 */
iModel.prototype.saveAnnotation = function () {
    if (this.selection !== null) {
        let index = Math.floor(this.selection.index);
        let defaultName;
        if (index > this.selection.timestamps.length - 1) {
            defaultName = this.selection.frames[index];
        } else {
            defaultName = this.selection.timestamps[index];
        }
        let name = prompt("Enter a name for this annotation:", defaultName);
        if (!!name && !(this.selection.annotations.includes(name))) {
            this.selection.addAnnotation(name, this.selection.index);
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