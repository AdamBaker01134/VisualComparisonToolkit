/**
 * Loader module that handles loading strings and images.
 */

"use strict"

/**
 * Loader object.
 * @param {number} capacity max images the loader is allowed to load
 * @param {string} imgPath path to image folder
 */
function Loader(capacity = 100, imgPath) {
    this.capacity = capacity;
    this.imgPath = imgPath;
}

/**
 * Load datasets from datasets.txt file, returned as an array.
 * @param {Function=} callback callback function called once datasets have been loaded
 * @param {Function=} errCallback error callback function called if there was an error loading datasets
 * @returns promise of an array of strings
 */
Loader.prototype.loadDatasets = function (callback = () => { }, errCallback = () => { }) {
    return loadStrings(
        this.imgPath + "datasets.txt",
        callback,
        errCallback
    );
}

Loader.prototype.loadFramesAndTimestamps = function (dataset, callback = () => { }, errCallback = () => { }) {

    let frames = null;
    let timestamps = null;

    const ret = () => {
        if (frames == null || timestamps == null)
            return;
        callback(frames, timestamps);
    }

    // Load image frames
    loadStrings(
        this.imgPath + "/" + dataset + "/summer-day-frames.txt",
        loadedFrames => {
            frames = loadedFrames;
            ret();
        },
        errCallback,
    );

    // Load image timestamps
    loadStrings(
        this.imgPath + "/" + dataset + "/summer-day-timestamps.txt",
        loadedTimestamps => {
            timestamps = loadedTimestamps;
            ret();
        },
        errCallback,
    );
}

Loader.prototype.loadImages = function (dataset, frames, callback = () => { }, errCallback = () => { }) {
    let loadedImages = [];

    const load = (frame) => {
        loadImage(
            this.imgPath + "/" + dataset + "/quarter/" + frame,
            loadedImage => {
                loadedImages.push(loadedImage);
                if (loadedImages.length >= this.capacity || loadedImages.length >= frames.length) {
                    callback(loadedImages);
                } else {
                    load(frames[loadedImages.length]);
                }
            },
            errCallback,
        )
    }

    load(frames[loadedImages.length]);
}