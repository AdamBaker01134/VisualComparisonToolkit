// Turn on strict mode:
"use strict";

/*
 * Contains functions that provide basic functionality that can and should
 * be used by all other modules in this app.
 */

// For dodging p5 loading bug.
function doNothing() {
    return false;
}

/*
 * Report an error to the console.
 */
function loadError(e) {
    console.error('Loading failed: ' + JSON.stringify(e));
}

///////////////////////////////////////////////////////////////////
// Overwrite p5 functions to provide custom functionality.
///////////////////////////////////////////////////////////////////
/*
 * Hide the element, but preserve any custom display setting.
 */
p5.Element.prototype.hide = function() {
    if (this.elt.style.display !== 'none') {
        this._display = this.elt.style.display;
    } 
    this.elt.style.display = 'none';
    return this;
}

/*
 * Show the element, using any custom display setting that was used.
 */
p5.Element.prototype.show = function() {
    if (this._display) {
        this.elt.style.display = this._display;
    } else if (this.elt.style.display === 'none') {
        this.elt.style.display = '';
    } else {
        this._display = this.elt.style.display;
    }
    return this;
}

///////////////////////////////////////////////////////////////////
// Custom DOM functionality.
///////////////////////////////////////////////////////////////////
/*
 * Show all DOM elements in the given array.
 */
function showElements(arr) {
    arr.forEach( e => e.show() );
}

/*
 * Hide all DOM elements in the given array.
 */
function hideElements(arr) {
    arr.forEach( e => e.hide() );
}

/*
 * Extend p5.dom functionality.
 */
function createElementWithID(tag, content, id, className) {
    let el = createElement(tag, content);
    el.id(id);
    el.class(className);
    return el;
}

///////////////////////////////////////////////////////////////////
// Add some custom functionality to Arrays.
///////////////////////////////////////////////////////////////////
/*
 * Empties the given array.
 */
Array.prototype.clear = function() {
    this.splice(0, this.length);
    return this;
}

/*
 * Fills a given array to the specified capacity, or its current capacity,
 *  with 'false' values.
 */
Array.prototype.fillWithFalse = function(cap = this.length) {
    this.length = cap;
    this.fill(false);
    return this;
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

/*
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 *
 * Modified from: https://stackoverflow.com/a/12646864
 */
Array.prototype.shuffle = function() {
    for (let i = this.length - 1; i > 0; i--) {
        // No danger of accessing past array length, because
        // Math.random() operates on the set [0,1)
        let j = Math.floor(Math.random() * (i + 1));
        let temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}


///////////////////////////////////////////////////////////////////
// Some error checking functions.
///////////////////////////////////////////////////////////////////

function ensureArray(arr) {
    if (!(arr instanceof Array)) {
        console.trace();
        throw 'Parameter is not an array: ' + arr;
    }
}

function ensureNonEmptyArray(arr) {
    ensureArray(arr);
    if (arr.length < 1) {
        console.trace();
        throw 'Array is empty: ' + arr;
    }
}

function ensureString(str) {
    if (typeof str != 'string') {
        console.trace();
        throw 'Parameter is not a string: ' + str;
    }
}

function ensureNonEmptyString(str) {
    ensureString(str);
    // Uses type conversion of '' to false.
    if (!str) {
        console.trace();
        throw 'String is empty: ' + str;
    }
}

function ensureNumber(num) {
    if (typeof num != 'number' || isNaN(num)) {
        console.trace();
        throw 'Parameter is not a number: ' + num;
    }
}

function ensureInteger(num) {
    ensureNumber(num);
    if (!Number.isInteger(num)) {
        console.trace();
        throw 'Number is not an integer: ' + num;
    }
}

function ensureBoolean(bool) {
    if ( typeof bool != 'boolean' ) {
        console.trace();
        throw 'Parameter is not a boolean: ' + bool;
    }
}

function ensureValidLoadMode(mode) {
    ensureString(mode);
    if ( mode !== 'fill' && mode !== 'linear') {
        console.trace();
        throw 'String is not a valid mode: ' + mode;
    }
}

