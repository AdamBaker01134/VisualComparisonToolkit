/*
 * "Main" file for timelapse web app.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

/* Constants */
const MAX_IMAGES = 200;

/* Path variables */
const IMG_PATH = "./img/";
let plotPath = "";

/* State data */
let datasets = [];
let displays = [];

/* DOM variables */
let headerDiv = null;
let displaysDiv = null;

/* Custom objects */
let loader = null;
let emptyDisplay = null;

function preload() {
    headerDiv = createElementWithID("header", "", "setupHolder", "setup");
    loader = new Loader(MAX_IMAGES, IMG_PATH);
    datasets = loader.loadDatasets();
}

function setup() {
    displaysDiv = createDiv();
    displaysDiv.class("displays");
    displaysDiv.parent(headerDiv);
    _createEmptyDisplay();
}

function _createP5Canvas() { }

function _createEmptyDisplay() {
    emptyDisplay = new EmptyDisplay(headerDiv, datasets, _createTimelapseDisplay);
}

function _createTimelapseDisplay(dataset) {
    if (dataset === "---") return;
    emptyDisplay.setErrorState(false);
    emptyDisplay.setLoadState(true);

    /* Improve performance by checking cache array for display data that has already been loaded */
    let cacheHit = displays.find((display) => display.name === dataset);
    if (!!cacheHit) {
        emptyDisplay.setLoadState(false);
        _constructDisplayObject(cacheHit.name, cacheHit.frames, cacheHit.timestamps, cacheHit.images);
        console.log(displays);
        return;
    }

    /* Load frames and timestamps simultaneously. After that, load images. */
    loader.loadFramesAndTimestamps(
        dataset,
        (frames, timestamps) => {
            console.log(`Successfully loaded ${frames.length} frames and ${timestamps.length} timestamps.`);
            /* Load images matching the "frames" names, up to MAX_IMAGES total */
            loader.loadImages(
                dataset,
                frames,
                (images) => {
                    console.log(`Successfully loaded ${images.length} images.`);
                    emptyDisplay.setLoadState(false);
                    _constructDisplayObject(dataset, frames, timestamps, images);
                    console.log(displays);
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

function _constructDisplayObject(dataset, frames, timestamps, images) {
    let displayObj = {
        name: dataset,
        id: dataset + "-" + (displays.length + 1),
        frames: frames,
        timestamps: timestamps,
        images: images,
    };

    displays.push(displayObj);
}