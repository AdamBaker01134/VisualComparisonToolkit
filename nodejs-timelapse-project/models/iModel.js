/* Application Interaction Model */
"use strict";
function iModel() {
    this.cursor = "default";
    this.shadowMarker = null;
    this.coincidentPoints = [];
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
 * Set the shadow marker object in the interaction model.
 * @param {Object} markerObj shadow marker object containing information about where to draw the marker in each display
 */
iModel.prototype.setShadowMarker = function (markerObj) {
    this.shadowMarker = markerObj;
    this.notifySubscribers();
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
 * Scale the selection
 * @param {number} scaleFactor scale ratio from which to scale the selection
 */
iModel.prototype.scale = function (scaleFactor) {
    if (this.selection != null) {
        this.selection.scale(scaleFactor);
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
iModel.prototype.setComparisonSliderValue = function (mx = mouseX, my = mouseY) {
    if (this.selection instanceof Overlay) {
        let value = 0.5;
        if (this.selection.mode === "vertical") {
            value = (map(
                mx,
                this.selection.x + this.selection.padding,
                this.selection.x + this.selection.padding + this.selection.width,
                0,
                1,
            ));
        } else if (this.selection.mode === "horizontal") {
            value = (map(
                my,
                this.selection.y + this.selection.padding,
                this.selection.y + this.selection.padding + this.selection.height,
                0,
                1,
            ));
        } else {
            /* Don't update the comparison slider value if its not on */
            return;
        }
        if (value < 0.1) value = 0.1;
        if (value > 0.9) value = 0.9;
        this.selection.setComparisonSliderValue(value);
        this.notifySubscribers();
    }
}

/**
 * Set the magic lens' location in the selection
 * @param {number} newX new x coordinate of the magic lens
 * @param {number} newY new y coordinate of the magic lens
 */
iModel.prototype.setMagicLensLocation = function (newX, newY) {
    if (this.selection instanceof Overlay) {
        this.selection.setMagicLensLocation(newX, newY);
        this.notifySubscribers();
    }
}

/**
 * Set the mode of an overlay display
 * @param {string} mode overlay, horizontal, vertical, or magic_lens
 */
iModel.prototype.setMode = function (mode) {
    if (this.selection instanceof Overlay) {
        this.selection.setMode(mode);
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
 * Apply a coincident point transformation on two displays.
 * If you don't have enough points, or if the 1st/2nd or 3rd/4th points don't have matching displays, an error message will display and coincident points will be reset.
 */
iModel.prototype.coincidentTransform = function () {
    if (this.coincidentPoints.length !== 4 ||
        this.coincidentPoints[0].display === this.coincidentPoints[2].display ||
        this.coincidentPoints[0].display !== this.coincidentPoints[1].display ||
        this.coincidentPoints[2].display !== this.coincidentPoints[3].display) {
        alert("Error: Invalid coincident points. Ensure that you set the points in order 1 and 2 in the first video, then 3 and 4 in the second video.");
        this.coincidentPoints = [];
        this.notifySubscribers();
        return;
    }
    const d1 = dist(this.coincidentPoints[0].x, this.coincidentPoints[0].y, this.coincidentPoints[1].x, this.coincidentPoints[1].y);
    const d2 = dist(this.coincidentPoints[2].x, this.coincidentPoints[2].y, this.coincidentPoints[3].x, this.coincidentPoints[3].y);
    const scaleFactor = d2/d1;

    const display1 = this.coincidentPoints[0].display;
    const display2 = this.coincidentPoints[2].display;
    const viewport1 = display1.getLayerViewport();
    const x1 = this.coincidentPoints[0].x * scaleFactor + viewport1.x * (1 - scaleFactor) - display1.x - display1.padding;
    const x2 = this.coincidentPoints[2].x - display2.x - display2.padding;
    const dx = x2 - x1;
    const y1 = this.coincidentPoints[0].y * scaleFactor + viewport1.y * (1 - scaleFactor) - display1.y - display1.padding;
    const y2 = this.coincidentPoints[2].y - display2.y - display2.padding;
    const dy = y2 - y1;

    display1.pan(dx, dy);
    display1.scaleViewport(scaleFactor);
    this.coincidentPoints = [];
    this.notifySubscribers();
}

/**
 * Add a coincident point into a display.
 * @param {Display|Overlay} display display that coincident point is paired to
 * @param {number} x x coordinate of the coincident point
 * @param {number} y y coordinate of the coincident point
 */
iModel.prototype.addCoincidentPoint = function (display, x, y) {
    this.coincidentPoints.push({ display: display, x: x, y: y, });
    if (this.coincidentPoints.length === 4) {
        this.coincidentTransform();
    }
    this.notifySubscribers();
}

/**
 * Clear the collected coincident points.
 */
iModel.prototype.clearCoincidentPoints = function () {
    this.coincidentPoints = [];
    this.notifySubscribers();
}

/**
 * Add an annotation with a custom name to the selected display.
 */
iModel.prototype.saveAnnotation = function () {
    if (this.selection !== null) {
        let name = null;
        let validName = false;
        const defaultName = `annotation-${this.selection.getMainScrollbar().getAnnotations().length}`;
        while (!validName) {
            name = prompt("Enter a name for this annotation:", defaultName);
            if (name === null) {
                return;
            } else if (name.trim() === "") {
                alert("Error: Annotation name must not be empty");
            } else if (this.selection.getMainScrollbar().hasAnnotation(name)) {
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
 * Remove an annotation from a scrollbar
 * @param {Scrollbar} scrollbar scrollbar that contains the annotation
 * @param {string} name name of the annotation
 */
iModel.prototype.removeAnnotation = function (scrollbar, name) {
    const id = scrollbar.annotations.find(annotation => annotation.name === name)?.id;
    if (id) {
        scrollbar.removeAnnotation(id);
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