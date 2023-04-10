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
 * Load the frames and timestamps from the summer-day-frames.txt and summer-day-timestamps.txt
 * files, respectively.
 * @param {string} dataset name of the dataset from which we will load the frames/timestamps
 * @param {Function} callback callback function called once frames/timestamps have been loaded
 * @param {Function} errCallback callback function called if there was an error loading frames/timestamps
 */
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
        this.imgPath + dataset + "/summer-day-frames.txt",
        loadedFrames => {
            frames = loadedFrames;
            ret();
        },
        errCallback,
    );

    // Load image timestamps
    loadStrings(
        this.imgPath + dataset + "/summer-day-timestamps.txt",
        loadedTimestamps => {
            timestamps = loadedTimestamps;
            ret();
        },
        errCallback,
    );
}

/**
 * Load the dataset frames/images from the /eighth directory.
 * @param {string} dataset name of the dataset from which we will load the images
 * @param {Array<string>} frames an array of strings that are the names of the images in the dataset
 * @param {Function} callback callback function called once images have been loaded
 * @param {Function} errCallback callback function called if there was an error loading images
 * @param {string=} opt_dir [OPTIONAL] alternative load directory
 */
Loader.prototype.loadImages = function (dataset, frames, callback = () => { }, errCallback = () => { }, opt_dir = "/eighth/") {
    let loadedImages = [];
    let numLoaded = 0;

    let total = Math.min(this.capacity, frames.length);

    for (let i = 0; i < total; i++) {
        loadedImages.push(loadImage(
            this.imgPath + dataset + opt_dir + frames[i],
            img => {
                if (numLoaded++ >= total - 1) callback(loadedImages);
            },
            (err) => { errCallback(err) }
        ));
    }
}

/**
 * Load the dataset monochrome images from the /mono directory.
 * @param {string} dataset name of the dataset from which we will load the monochrome images in the dataset
 * @param {Array<string>} frames an array of strings that are the names of the monochrome images in the dataset
 * @param {Function} callback callback function called once images have been loaded 
 * @param {Function} errCallback callback function called if there was an error loading images 
 */
Loader.prototype.loadMonochromes = function (dataset, frames, callback = () => { }, errCallback = () => {}) {
    this.loadImages(dataset, frames, callback, errCallback, "/mono/");
}