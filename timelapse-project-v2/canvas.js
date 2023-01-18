/*
 * "Main" file for timelapse web app.
 */

"use strict";

/* Path variables */
const IMG_PATH = "./img/";
let plotPath = "";

/* State data */
let plots = [];
let file = [];
let timestamps = [];
let displays = [];

/* DOM variables */
let headerDiv = null;

/* Custom objects */
let emptyDisplay = null;

function preload() {
    headerDiv = createElementWithID("header", "", "setupHolder", "setup");
    plots = loadStrings(IMG_PATH + "datasets.txt", _createEmptyDisplay);
}

function setup() {
}

function _createP5Canvas() {}

function _createEmptyDisplay(datasets) {
    emptyDisplay = new EmptyDisplay(headerDiv, datasets, (dataset) => emptyDisplay.toggleLoadState());
}

function _createTimelapseDisplay() {}