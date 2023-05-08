// Turn on strict mode:
"use strict";

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
 */
function generateDisplayId(model, name) {
    let idNum = 1;
    model.displays.forEach(display => {
        let displayName = display.id.split("-")[0];
        let displayIdNum = parseInt(display.id.split("-")[1]);
        if (displayName === name) idNum = displayIdNum + 1;
    });
    return name + "-" + idNum;
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
Array.prototype.findFirst = function(callback, fromIndex = 0, thisArg) {
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
Array.prototype.findLast = function(callback, fromIndex = this.length, thisArg) {
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