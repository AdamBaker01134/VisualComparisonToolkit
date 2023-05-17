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

/**
 * Begin a new dataset load.
 * @param {string} dataset name of the dataset to load
 * @param {Function=} callback callback function called once all information has loaded 
 * @param {Function=} errCallback callback function called if an error occurs
 */
Loader.prototype.initDatasetLoad = function (dataset, callback = () => { }, errCallback = () => { }) {
    let loadObj = {
        name: dataset,
        onSuccess: callback,
        onError: errCallback,
    };
    this._loadFrames(loadObj);
}

/**
 * Load the frames from a dataset.
 * @param {Object} loadObj object containing collected information during the load
 */
Loader.prototype._loadFrames = function (loadObj) {
    // Load image frames
    loadStrings(
        this.imgPath + loadObj.name + "/summer-day-frames.txt",
        loadedFrames => {
            loadObj.frames = loadedFrames;
            this._loadTimestamps(loadObj);
        },
        loadObj.onError,
    );
}

/**
 * Load the timestamps from a dataset.
 * @param {Object} loadObj object containing collected information during the load
 */
Loader.prototype._loadTimestamps = function (loadObj) {
    // Load image timestamps (if they exist)
    loadStrings(
        this.imgPath + loadObj.name + "/summer-day-timestamps.txt",
        loadedTimestamps => {
            loadObj.timestamps = loadedTimestamps;
            this._loadImages(loadObj);
        },
        err => {
            // Lack of timestamps shouldn't end the load
            console.error(err);
            loadObj.timestamps = [];
            this._loadImages(loadObj);
        },
    );
}

/**
 * Load the images from a dataset.
 * @param {Object} loadObj object containing collected information during the load
 */
Loader.prototype._loadImages = function (loadObj) {
    loadObj.images = [];
    let numLoaded = 0
    let total = Math.min(this.capacity, loadObj.frames.length);
    for (let i = 0; i < total; i++) {
        loadObj.images.push(loadImage(
            this.imgPath + loadObj.name + "/eighth/" + loadObj.frames[i],
            loadedImage => {
                if (numLoaded++ >= total - 1) loadObj.onSuccess(loadObj);
            },
            loadObj.onError,
        ));
    }
}