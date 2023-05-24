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
 * Load datasets from the datasets.json file.
 */
Loader.prototype.loadDatasets = function () {
    return fetch("./img/datasets.json")
        .then(response => response.json())
        .then(datasets => datasets.filter(dataset => dataset.visible))
        .catch(error => console.error(error));
}

/**
 * Begin a new dataset load.
 * @param {string} dataset name of the dataset to load
 * @param {string} size size of the dataset images to load
 * @param {Function=} callback callback function called once all information has loaded 
 * @param {Function=} errCallback callback function called if an error occurs
 */
Loader.prototype.initDatasetLoad = function (dataset, size, callback = () => { }, errCallback = () => { }) {
    let loadObj = {
        name: dataset,
        size: size,
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
            loadObj.frames = loadedFrames.filter(frame => frame !== "");
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
    // let numLoaded = 0;
    let finished = false;
    let total = Math.min(this.capacity, loadObj.frames.length);
    let timer = null;
    loadObj.images.fillWith(null, 0, total);
    const addImage = (index) => {
        loadImage(
            this.imgPath + loadObj.name + `/${loadObj.size}/` + loadObj.frames[index],
            loadedImage => {
                loadObj.images[index] = loadedImage;
                // numLoaded++;
                if (!finished && !loadObj.images.includes(null)) {
                    finished = true;
                    clearTimeout(timer);
                    loadObj.onSuccess(loadObj);
                }
            },
            loadObj.onError,
        );
    }
    for (let i = 0; i < total; i++) {
        addImage(i);
    }
    timer = setTimeout(() => {
        console.log("Load timeout. Looping back to catch the stragglers.")
        let missing = [];
        loadObj.images.forEach((image, index) => { if (image === null) missing.push(index) });
        missing.forEach(index => addImage(index));
    }, 15000);
}