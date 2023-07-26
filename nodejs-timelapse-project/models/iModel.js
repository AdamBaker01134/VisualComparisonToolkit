/* Application Interaction Model */
"use strict";
function iModel() {
    this.cursor = "default";
    this.focused = null;
    this.selection = null;
    this.highlightedAnnotation = null;
    this.highlightedSnapshot = null;
    this.ghost = null;
    this.subscribers = [];
}

/**
 * Set the cursor style
 * @param {string} cursorStyle css style of the cursor
 */
iModel.prototype.setCursor = function (cursorStyle) {
    if (this.cursor !== cursorStyle) {
        this.cursor = cursorStyle;
        this.notifySubscribers();
    }
}

/**
 * Set the focused display/scrollbar.
 * @param {Scrollbar|null} focusedObject display/scrollbar to set as focused
 */
iModel.prototype.setFocused = function (focusedObject) {
    if (this.focused !== focusedObject) {
        this.focused = focusedObject;
        this.notifySubscribers();
    }
}

/**
 * Highlight a snapshot
 * @param {Object} snapshot name of snapshot
 */
iModel.prototype.highlightSnapshot = function (snapshot) {
    if (this.highlightedSnapshot !== snapshot) {
        this.highlightedSnapshot = snapshot;
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
 * Resize the selection
 * @param {number} dx change in the x direction of the mouse
 * @param {number} dy change in the y direction of the mouse
 */
iModel.prototype.resize = function (dx, dy) {
    if (this.selection != null) {
        this.selection.resize(dx, dy);
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
 * Set the selections comparison slider value.
 * @param {number} mx x coordinate of the mouse
 */
iModel.prototype.setComparisonSlider = function (mx = mouseX) {
    if (this.selection instanceof Overlay) {
        let value = (map(
            mx,
            this.selection.x + this.selection.padding,
            this.selection.x + this.selection.padding + this.selection.width,
            0,
            1,
        ));
        if (value < 0.1) value = 0.1;
        if (value > 0.9) value = 0.9;
        this.selection.setComparisonSlider(value);
        this.notifySubscribers();
    }
}

/**
 * Toggle the comparison slider in a selected
 */
iModel.prototype.toggleComparisonSlider = function () {
    if (this.selection instanceof Overlay) {
        this.selection.toggleComparisonSliderActive();
        this.notifySubscribers();
    }
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
        let name = null;
        let validName = false;
        while (!validName) {
            name = prompt("Enter a name for this annotation:", `annotation-${this.selection.annotations.length}`);
            if (name === null) {
                return;
            } else if (name.trim() === "") {
                alert("Error: Annotation name must not be empty");
            } else if (this.selection.hasAnnotation(name)) {
                alert("Error: Annotation name already exists in selected display");
            } else {
                validName = true;
            }
        }
        if (this.selection.addAnnotation(this.selection.mainScrollbarIndex, name)) {
            alert(`Successfully created annotation with the name "${name}"`);
            this.notifySubscribers();
        } else {
            alert("Error: failed to add annotation to display")
        }
    }
}

/**
 * Load an annotation in a scrollbar
 * @param {Scrollbar} scrollbar scrollbar that contains the annotation
 * @param {string} name name of the annotation
 */
iModel.prototype.loadAnnotation = function (scrollbar, name) {
    const id = scrollbar.annotations.find(annotation => annotation.name === name)?.id;
    if (id) {
        scrollbar.loadAnnotation(id);
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