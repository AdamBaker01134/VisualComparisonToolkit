import p5 from 'p5';

const _p5 = new p5();

function Loader(capacity=100, imgPath) {
    this.capacity = capacity;
    this.imgPath = imgPath;
}

Loader.prototype.initDataset = function(dataset, callback=()=>{}, errCallback=()=>{}) {

    let frames = null;
    let timestamps = null;

    const ret = () => {
        if (frames == null || timestamps == null)
            return;
        callback(dataset, frames, timestamps);
    }

    // Load image frames
    _p5.loadStrings(
        this.imgPath + "/" + dataset + "/summer-day-frames.txt",
        loadedFrames => {
            frames = loadedFrames;
            ret();
        },
        errCallback,
    );

    // Load image timestamps
    _p5.loadStrings(
        this.imgPath + "/" + dataset + "/summer-day-timestamps.txt",
        loadedTimestamps => {
            timestamps = loadedTimestamps;
            ret();
        },
        errCallback,
    );
}

Loader.prototype.loadImages = function(dataset, frames, callback=()=>{}, errCallback=()=>{}) {
    let loadedImages = [];

    const load = (frame) => {
        _p5.loadImage(
            this.imgPath + "/" + dataset + "/QTR/" + frame,
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

    debugger;
    load(frames[loadedImages.length]);
}

export default Loader;