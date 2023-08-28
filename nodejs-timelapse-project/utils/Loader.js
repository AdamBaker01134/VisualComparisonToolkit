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
    return fetch(this.imgPath + "/datasets.json")
        .then(response => response.json())
        .then(datasets => {
            let flattened = [];
            datasets.forEach(dataset => flattened.push(...flattenDataset(dataset)));
            flattened.sort((d1, d2) => {
                if (d1.dir === d2.dir) return 0;
                else if (d1.dir < d2.dir) return -1;
                else return 1;
            });
            return flattened;
        })
        .then(datasets => datasets.filter(dataset => dataset.visible))
        .catch(error => console.error(error));
}

/**
 * Load snapshots from the snapshots.json file.
 * If file DNE, just return an empty array.
 */
Loader.prototype.loadSnapshots = function () {
    return fetch("./snapshots.json")
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return [];
            }
        })
        .catch(error => []);
}

/**
 * Begin a new dataset load.
 * @param {Object} dataset dataset we want to load in
 * @param {Function=} callback callback function called once all information has loaded 
 * @param {Function=} errCallback callback function called if an error occurs
 */
Loader.prototype.initDatasetLoad = async function (dataset, filter, callback = () => { }, errCallback = () => { }) {
    const loadObj = {
        dir: dataset.dir,
        filters: dataset.filters,
        filter: filter,
        onSuccess: callback,
        onError: errCallback,
    }
    await this._loadFrames(loadObj);
    await this._loadTimestamps(loadObj);
    await this._loadImages(loadObj);
    // fetch(`http://localhost:3019/getImages?dataset=${dataset}`, { method: "GET" })
    // fetch(`http://hci-sandbox.usask.ca:3019/getImages?dataset=${dataset}`, { method: "GET" })
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
    return new Promise((resolve, reject) => {
        loadStrings(
            this.imgPath + loadObj.dir + "/frames.txt",
            loadedFrames => {
                loadObj.frames = loadedFrames.map(frame => frame.replace("%", "%25"));
                if (loadObj.filter === "foreground") loadObj.frames = loadObj.frames.map(frame => frame.replace(".jpg", ".png"));
                loadObj.frames = loadObj.frames.filter(frame => frame !== "");
                resolve();
            },
            err => {
                loadObj.onError();
                reject();
            },
        );
    });
}

/**
 * Load the timestamps from a dataset.
 * @param {Object} loadObj object containing collected information during the load
 */
Loader.prototype._loadTimestamps = function (loadObj) {
    // Load image timestamps
    return new Promise((resolve, reject) => {
        loadStrings(
            this.imgPath + loadObj.dir + "/timestamps.txt",
            loadedTimestamps => {
                loadObj.timestamps = loadedTimestamps.filter(timestamp => timestamp !== "");
                resolve();
            },
            err => {
                loadObj.onError();
                reject();
            },
        );
    })
}

/**
 * Load the images from a dataset.
 * @param {Object} loadObj object containing collected information during the load
 */
Loader.prototype._loadImages = function (loadObj) {
    // Load images
    return new Promise((resolve, reject) => {
        loadObj.images = [];
        // let numLoaded = 0;
        let finished = false;
        let total = Math.min(this.capacity, loadObj.frames.length);
        let timer = null;
        loadObj.images.fillWith(null, 0, total);
        const addImage = (index) => {
            loadImage(
                this.imgPath + loadObj.dir + `/${loadObj.filter}/` + loadObj.frames[index],
                loadedImage => {
                    loadObj.images[index] = loadedImage;
                    // numLoaded++;
                    if (!finished && !loadObj.images.includes(null)) {
                        finished = true;
                        clearTimeout(timer);
                        loadObj.onSuccess(loadObj);
                        resolve();
                    }
                },
                err => {
                    loadObj.onError();
                    reject();
                },
            );
        }
        for (let i = 0; i < total; i++) {
            addImage(i);
        }
        timer = setTimeout(() => {
            pinoLog("trace", "Loading timeout, retrying");
            let missing = [];
            loadObj.images.forEach((image, index) => { if (image === null) missing.push(index) });
            missing.forEach(index => addImage(index));
        }, 15000);
    });
}
