// Turn on strict mode:
"use strict";

const ID_DELIMITER = "?";

/*
 * Extend p5.dom functionality.
 */
function createElementWithID(tag, content, id, className) {
    let el = createElement(tag, content);
    el.id(id);
    el.class(className);
    return el;
}

/**
 * Generate a unique display id
 * @param {Model} model model from which to generate a new display id
 * @param {string} name name of the dataset
 * @returns {string}
 */
function generateDisplayId(model, name) {
    let idNum = 1;
    model.displays.forEach(display => {
        let displayName = getDisplayNameFromId(display.id);
        let displayIdNum = getDisplayIdNumberFromId(display.id);
        if (displayName === name) idNum = displayIdNum + 1;
    });
    return name + ID_DELIMITER + idNum;
}

/**
 * generate a unique overlay id
 * @param {Model} model model from which to generate a new display id
 * @returns {string}
 */
function generateOverlayId(model, name, secondaryName) {
    let idNum = 1;
    model.displays.forEach(display => {
        if (display instanceof Overlay) {
            let displayName = getDisplayNameFromId(display.id);
            let secondaryDisplayName = getSecondaryDisplayNameFromId(display.id);
            let displayIdNum = getDisplayIdNumberFromId(display.id);
            if (displayName === name && secondaryDisplayName === secondaryName) idNum = displayIdNum + 1;
        }
    });
    return name + ID_DELIMITER + idNum + ID_DELIMITER + secondaryName;
}

/**
 * Get the display dataset name from a display id
 * @param {string} id display id
 * @returns {string}
 */
function getDisplayNameFromId(id) {
    return id.split(ID_DELIMITER)[0];
}

/**
 * Get the display id number from a display id
 * @param {string} id display id
 * @returns {number}
 */
function getDisplayIdNumberFromId(id) {
    return parseInt(id.split(ID_DELIMITER)[1]);
}

/**
 * Get the display id number of the secondary display of an overlay
 * @param {string} id display id
 * @returns {string}
 */
function getSecondaryDisplayNameFromId(id) {
    return id.split(ID_DELIMITER)[2];
}

/**
 * Generate the x position of a new (or existing) display in the model
 * @param {Model} model
 * @param {number} position display position in the model (within the displays array)
 */
function generateDisplayX(model, position) {
    let column = position % model.displaysPerRow;
    return model.displayPadding + column * (model.displayPadding * 3 + model.displayWidth);
}

/**
 * Generate the y position of a new (or existing) display in the model
 * @param {Model} model
 * @param {number} position display position in the model (within the displays array)
 */
function generateDisplayY(model, position) {
    let y = model.displayPadding;
    let row = Math.floor(position / model.displaysPerRow);
    for (let i = 0; i < row; i++) {
        let maxHeight = 0;
        for (let j = 0; j < model.displaysPerRow; j++) {
            let display = model.displays[i * model.displaysPerRow + j];
            let height = display.padding * 3 + display.height + display.scrollbarHeight * display.scrollbars.length;
            if (height > maxHeight) maxHeight = height;
        }
        y += maxHeight;
    }
    return y;
}

/**
 * Generate a personal id for an annotation
 * @param {string} name name of the annotation
 * @returns {string}
 */
function generateAnnotationId(name) {
    return `${name}-${Math.floor(Math.random() * 1000000)}`;
}

/**
 * Generate an hsl colour value for an annotation
 * @returns {Array<number>}
 */
function generateAnnotationColour() {
    let hue = Math.random() * 360;
    let saturation = 100;
    let lightness = 50;
    return [hue, saturation, lightness];
}

/**
 * Get index in a scrollbar based on the x coordinate of the cursor
 * @param {number} x x coordinate of the scrollbar
 * @param {number} mx x coordinate of the cursor
 * @param {number} segments number of segments in the scrollbar
 * @param {number} width width of the scrollbar
 */
function getIndexFromMouse(x, mx, segments, width) {
    let idx = (int)(map(
        mx,                 // value to map
        x,                  // min value of mx
        x + width,          // max value of mx
        0,                  // min value of desired index
        segments            // max value of desired index
    ));

    if (idx >= segments) {
        idx = segments - 1;
    } else if (idx < 0) {
        idx = 0;
    }
    return idx;
}

/*
 * Find the first value in an Array for which the supplied callback function
 *  returns true. Operates on each index in the Array, starting at 'fromIndex'
 *  and going to the end of the Array or until the desired value is found.
 *
 * Returns the index where the callback returned true, or -1 if not found.
 *
 * Callback function should be of similar form to the Array.findIndex()
 *  standard library function.
 */
Array.prototype.findFirst = function (callback, fromIndex = 0, thisArg) {
    while (fromIndex < this.length &&
        !callback.call(thisArg, this[fromIndex], fromIndex, this)) {
        fromIndex++;
    }
    return fromIndex < this.length ? fromIndex : -1;
}

/*
 * Find the last value in an Array for which the supplied callback function
 *  returns true. Operates on each index in the Array, starting at 'fromIndex'
 *  and going backwards to the start of the Array or until the desired value
 *  is found.
 *
 * Returns the index where the callback returned true, or -1 if not found.
 *
 * Callback function should be of similar form to the Array.findIndex()
 *  standard library function.
 */
Array.prototype.findLast = function (callback, fromIndex = this.length, thisArg) {
    while (fromIndex >= 0 &&
        !callback.call(thisArg, this[fromIndex], fromIndex, this)) {
        fromIndex--;
    }
    return fromIndex >= 0 ? fromIndex : -1;
}

/**
 * Add-on to the built-in Array.prototype.fill JavaScript array method.
 * Fills an array even if the end is greater than the length of the array.
 */
Array.prototype.fillWith = function (value = false, start = 0, end = this.length) {
    if (this.length < end) {
        this.length = end;
    }
    this.fill(value, start, end);
    return this;
}