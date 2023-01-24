/*
 * "Main" file for timelapse web app.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

/* Constants */
const MAX_IMAGES = 200;
const DISPLAY_WIDTH = 350;
const DISPLAY_HEIGHT = 350;

/* Path variables */
const IMG_PATH = "./img/";
let plotPath = "";

/* State data */
let datasets = [];
let displays = [];

/* DOM variables */
let headerDiv = null;
let displaysDiv = null;
let masterSlider = null;

/* Custom objects */
let loader = null;
let emptyDisplay = null;

/* p5.js function that is called to load things before setup is called */
function preload() {
    headerDiv = createElementWithID("header", "", "setupHolder", "setup");
    loader = new Loader(MAX_IMAGES, IMG_PATH);
    datasets = loader.loadDatasets();
}

/* p5.js function that is called when the application starts up (after preload) */
function setup() {
    displaysDiv = createDiv();
    displaysDiv.class("displays");
    displaysDiv.parent(headerDiv);

    _createEmptyDisplay();

    let masterSliderDiv = createDiv();
    masterSliderDiv.class("masterSlider");
    masterSliderDiv.parent(headerDiv);

    masterSlider = createInput("", "range");
    masterSlider.input((e) => _updateDisplayOffsets(parseInt(e.target.value)));
    masterSlider.elt.max = MAX_IMAGES;
    masterSlider.elt.value = 0;
    masterSlider.parent(masterSliderDiv);

    noCanvas(); /* Multiple canvases being drawn, so no need for default canvas. */
}

/* p5.js function that acts as the draw loop */
function draw() {
    displays.forEach(display => display.draw());
}

/**
 * Create an empty display object.
 * The header div and datasets array must both be initialized before this happens.
 */
function _createEmptyDisplay() {
    emptyDisplay = new EmptyDisplay(headerDiv, datasets, _createTimelapseDisplay);
}

/**
 * Loads and constructs a dataset object that will be displayed as a TimelapseDisplay.
 * @param {string} dataset name of the dataset that we want to add. If '---', function will return.
 */
function _createTimelapseDisplay(dataset) {
    if (dataset === "---") return;
    emptyDisplay.setErrorState(false);
    emptyDisplay.setLoadState(true);

    /* Improve performance by checking cache array for display data that has already been loaded */
    let cacheHit = displays.find((display) => display.name === dataset);
    if (!!cacheHit) {
        emptyDisplay.setLoadState(false);
        let newDisplay = _constructDisplayObject(cacheHit.name, cacheHit.frames, cacheHit.timestamps, cacheHit.images);
        displays.push(newDisplay);
        return;
    }

    const start = performance.now();
    /* Load frames and timestamps simultaneously. After that, load images. */
    loader.loadFramesAndTimestamps(
        dataset,
        (frames, timestamps) => {
            console.log(`Successfully loaded ${frames.length} frames and ${timestamps.length} timestamps in ${Math.floor(performance.now() - start)}ms.`);
            /* Load images matching the "frames" names, up to MAX_IMAGES total */
            loader.loadImages(
                dataset,
                frames,
                (images) => {
                    console.log(`Successfully loaded ${images.length} images in ${Math.floor(performance.now() - start)}ms.`);
                    emptyDisplay.setLoadState(false);
                    let newDisplay = _constructDisplayObject(dataset, frames, timestamps, images);
                    displays.push(newDisplay);
                },
                (err) => {
                    console.log(`Error loading images for the ${dataset} dataset.`);
                    console.log(err);
                    emptyDisplay.setErrorState(true);
                    emptyDisplay.setLoadState(false);
                }
            );
        },
        (err) => {
            console.log(`Error loading frames/timestamps for the ${dataset} dataset.`);
            console.log(err);
            emptyDisplay.setErrorState(true);
            emptyDisplay.setLoadState(false);
        },
    );
}

/**
 * 
 * @param {string} dataset name of the dataset
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 */
function _constructDisplayObject(dataset, frames, timestamps, images) {

    let displayCount = 1;
    let duplicates = displays.filter((display) => display.name === dataset);
    if (duplicates.length > 0) {
        /* Find the duplicate with the highest id number. */
        let values = duplicates.map((duplicate) => parseInt(duplicate.id.charAt(duplicate.id.length - 1)));
        displayCount = Math.max(...values) + 1;
    }

    return new TimelapseDisplay(
        dataset,
        dataset + "-" + displayCount,
        frames,
        timestamps,
        images,
        displaysDiv,
        DISPLAY_WIDTH,
        DISPLAY_HEIGHT,
        parseInt(masterSlider.elt.value),
    );
}

/**
 * Update each of the timelapse displays with a new offset.
 * To be utilized only by the master slider.
 * @param {number} newOffset new offset for each of the displays
 */
function _updateDisplayOffsets(newOffset) {
    displays.forEach(display => display.setIndexFromOffset(newOffset));
}