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

Loader.prototype.loadImages = function(frames) {

}

export default Loader;