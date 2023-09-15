/* Application Interaction Model */
"use strict";
function iModel() {
    this.cursor = "default";
    this.shadowMarkers = [];
    this.shadowMarkerShape = "crosshair";
    this.coincidentPoints = [];
    this.focused = null;
    this.measuredTime = null;
    this.selection = null;
    this.highlightedScrollbars = [];
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
 * Set the shape to be used when creating shadow markers.
 */
iModel.prototype.updateShadowMarkerShape = function () {
    switch (this.shadowMarkerShape) {
        case "crosshair":
            this.shadowMarkerShape = "cross";
            break;
        case "cross":
            this.shadowMarkerShape = "dot";
            break;
        case "dot":
            this.shadowMarkerShape = "square";
            break;
        case "square":
            this.shadowMarkerShape = "triangle";
            break;
        case "triangle":
            this.shadowMarkerShape = "crosshair";
            break;
    }
    this.notifySubscribers();
}

/**
 * Add a shadow marker object in the interaction model with given width & height ratio and shape.
 * @param {number} widthRatio x position ratio in the display
 * @param {number} heightRatio y position ratio in the display
 */
iModel.prototype.addShadowMarker = function (widthRatio, heightRatio) {
    this.shadowMarkers.push({
        widthRatio: widthRatio,
        heightRatio: heightRatio,
        shape: this.shadowMarkerShape,
    });
    this.notifySubscribers();
}

/**
 * Clear shadow markers in the interaction model.
 */
iModel.prototype.clearShadowMarkers = function () {
    this.shadowMarkers = [];
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
 * Set the measured start/end time from an interaction within a timeline.
 * @param {number|null} time start, end, or null
 */
iModel.prototype.setMeasuredTime = function (time) {
    if (time === null && this.measuredTime !== null) {
        this.measuredTime = time;
        this.notifySubscribers();
    } else if (this.measuredTime === null) {
        this.measuredTime = {
            start: time,
            end: time,
        };
        this.notifySubscribers();
    } else {
        this.measuredTime.end = time;
        this.notifySubscribers();
    }
}

/**
 * Highlight a scrollbar (and its linked scrollbars).
 * @param {Scrollbar|null} scrollbar scrollbar to highlight
 * @param {boolean} linked whether or not the scrollbars were
 */
iModel.prototype.highlightScrollbar = function (scrollbar, linked=false) {
    if (scrollbar === null) {
        if (this.highlightedScrollbars.length > 0) {
            this.highlightedScrollbars = [];
            this.notifySubscribers();
        }
    } else if (!this.highlightedScrollbars.includes(scrollbar)) {
        if (!linked) this.highlightedScrollbars = [];
        this.highlightedScrollbars.push(scrollbar);
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
 * @param {number} scaleFactor scale ratio
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
 * Apply a coincident point transformation.
 * @returns {boolean}
 */
iModel.prototype._coincidentTransform = function (p1, p2, p3, p4) {
    if (p1.display !== p2.display || p3.display !== p4.display) return false;
    const d1 = dist(p1.x, p1.y, p2.x, p2.y);
    const d2 = dist(p3.x, p3.y, p4.x, p4.y);
    const scaleFactor = d1/d2;

    const display1 = p1.display;
    const display2 = p3.display;

    const viewport = display2.getLayerViewport(display2.layers.length - 1);
    const x1 = p1.x - display1.x - display1.padding;
    const x2 = p3.x * scaleFactor + viewport.x * (1 - scaleFactor) - display2.x - display2.padding;
    const dx = x1 - x2;
    const y1 = p1.y - display1.y - display1.padding;
    const y2 = p3.y * scaleFactor + viewport.y * (1 - scaleFactor) - display2.y - display2.padding;
    const dy = y1 - y2;

    display2.pan(dx, dy);
    display2.scaleViewport(scaleFactor, display2.layers.length - 1);
    return true;
}

/**
 * Confirm that the user wants to perform a coincident transform on the locked points
 */
iModel.prototype.coincidentTransform = function () {
    const ok = confirm("Are you sure you want to perform this transformation?");
    if (ok) {
        for (let i = 0; i + 1 < this.coincidentPoints.length; i += 2) {
            const result = this._coincidentTransform(this.coincidentPoints[0], this.coincidentPoints[1], this.coincidentPoints[i], this.coincidentPoints[i + 1]);
            if (!result) {
                alert("Error: Invalid coincident points. Ensure that each pair of point are within the same video.");
                break;
            }
        }
        this.coincidentPoints = [];
        this.notifySubscribers();
    }
}

/**
 * Add a coincident point into a display.
 * @param {Display|Overlay} display display that coincident point is paired to
 * @param {number} x x coordinate of the coincident point
 * @param {number} y y coordinate of the coincident point
 */
iModel.prototype.addCoincidentPoint = function (display, x, y) {
    this.coincidentPoints.push({ display: display, x: x, y: y, });
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
 * Add an annotation with a custom name to a scrollbar.
 * @param {Scrollbar} scrollbar scrollbar to save the annotation
 * @param {Array<number>} colour array of numbers representing rgb colour
 * @param {number} opt_index optionally set index for the annotation
 */
iModel.prototype.addAnnotation = function (scrollbar, colour, opt_index) {
    const result = scrollbar.addAnnotation(generateAnnotationId(), colour, opt_index);
    this.notifySubscribers();
    return result;
}

/**
 * Update an annotation with a new colour.
 * @param {Scrollbar} scrollbar scrollbar containing annotation
 * @param {Object} annotation annotation to update
 * @param {Array<number>} colour array of numbers representing rgb colour
 */
iModel.prototype.updateAnnotation = function (scrollbar, annotation, colour) {
    scrollbar.updateAnnotation(annotation.id, annotation.index, colour);
    this.notifySubscribers();
}

/**
 * Load an annotation in a scrollbar
 * @param {Scrollbar} scrollbar scrollbar that contains the annotation
 * @param {Object} annotation annotation to load
 */
iModel.prototype.loadAnnotation = function (scrollbar, annotation) {
    scrollbar.loadAnnotation(annotation.id);
    this.notifySubscribers();
}

/**
 * Remove an annotation from a scrollbar
 * @param {Scrollbar} scrollbar scrollbar that contains the annotation
 * @param {Object} annotation annotation to remove
 */
iModel.prototype.removeAnnotation = function (scrollbar, annotation) {
    scrollbar.removeAnnotation(annotation.id);
    this.notifySubscribers();
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