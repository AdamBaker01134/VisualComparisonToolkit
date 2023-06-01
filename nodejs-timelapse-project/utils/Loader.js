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
 * @param {string} dir directory of the dataset images to load
 * @param {Function=} callback callback function called once all information has loaded 
 * @param {Function=} errCallback callback function called if an error occurs
 */
Loader.prototype.initDatasetLoad = function (dataset, dir, callback = () => { }, errCallback = () => { }) {
    let loadObj = {
        name: dataset,
        dir: dir,
        onSuccess: callback,
        onError: errCallback,
    };
    this._loadFrames(loadObj);
    // fetch(`http://localhost:30500/getImages?dataset=${dataset}`, { method: "GET" })
    //     .then(response => response.json())
    //     .then(responseJSON => {
    //         let result = [];
    //         let numLoaded = 0;
    //         let transformationString = "c_scale,w_350,h_350";
    //         let sorted = responseJSON.sort((a, b) => {
    //             let aList = a.split("/");
    //             let bList = b.split("/");
    //             if (aList[aList.length - 1] === bList[bList.length - 1]) {
    //                 return 0;
    //             } else if (aList[aList.length - 1] > bList[bList.length - 1]) {
    //                 return 1;
    //             } else {
    //                 return -1;
    //             }
    //         });
    //         for (let i = 0; i < sorted.length; i++) {
    //             let splitURL = sorted[i].split("/");
    //             let index = splitURL.findIndex(value => value === "upload");
    //             splitURL.splice(index + 1, 0, transformationString);
    //             let updatedURL = splitURL.join("/");
    //             result.push(loadImage(
    //                 updatedURL,
    //                 loadedImage => {
    //                     if (numLoaded++ >= sorted.length - 1) {
    //                         let num = 0;
    //                         setInterval(() => {
    //                             clear();
    //                             image(result[num], 0, 0, 350, 350);
    //                             num++;
    //                             if (num >= result.length) num = 0;
    //                         }, 100);
    //                     }
    //                 },
    //                 errCallback,
    //             ));
    //         }
    //     })
    //     .catch(errCallback);
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
            this.imgPath + loadObj.name + `/${loadObj.dir}/` + loadObj.frames[index],
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