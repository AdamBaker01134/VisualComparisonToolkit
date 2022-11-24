// NOTE: file includes ImageWithInfo class.
/*
TODO:   Figure out a way to maintain a backup of the load order,
        so that changes caused by the 'setNextLoad' function 
        don't stack up- only the most recent change should be
        applied.
        - Need to generate an accurate backup before changes.
            - Make sure the backup is always accurate, in other words,
                that it gets trimmed in tandem with the real order list.
        - Then need to restore the backup before each change.
        * Could use explicit calls to Loader.prototype functions?
*/

// Turn on strict mode:
"use strict";

/*
 * Class for loading and displaying timelapse images.
 * Intended to be controlled by a TimelapseDisplay.
 *
 * ARGS:
 *  - x     ::  x coordinate of upper left corner of window.
 *  - y     ::  y coordinate of upper left corner of window.
 *  - w     ::  width of the images to be displayed.
 *  - h     ::  height of the images to be displayed.
 *  - id    ::  number identifying window.
 *              - Most useful as index of an array containing these objects.
 */
function ImageWindow(x, y, w, h, id) {
    Loader.apply(this, arguments);
    this.imgIndex = -1;         // current index in images array.
    this.timestamps = [];       // array of timestamp strings.
                                // - assumes filenames[i] corresponds to
                                //    timestamps[i].
}

// Inherit from Loader class.
ImageWindow.prototype = Object.create(Loader.prototype);
ImageWindow.prototype.constructor = ImageWindow;

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Draws the window, rendering the current image if one is ready.
 */
ImageWindow.prototype.draw = function() {
    if (this.isReady) {
        // Images are ready, so render the current image.
        image(
            this.imgArr[this.imgIndex],
            this.x, 
            this.y, 
            this.width, 
            this.height
        );
    } else {
        // No images to display, so just an empty rectangle.
        fill(188, 212, 230);
        rectMode(CORNER);
        noStroke();
        rect(this.x, this.y, this.width, this.height);

        // Display a message if images are loading.
        if (this.loading) {
            fill(0);
            textSize(15);
            textAlign(LEFT);
            text('Images are loading...', this.x + 10, this.y + 20);
        }
    }
}

/*
 * Get the timestamp of the currently loaded image.
 */
ImageWindow.prototype.getCurrentTimestamp = function() {
    return this.isReady ? this.timestamps[this.fileIndices[this.imgIndex]] : '';
}

/*
 * Get the global index of the image referenced by the current scrollbar position.
 */
ImageWindow.prototype.getFileIndex = function() {
    return this.fileIndices[this.imgIndex];
}

/*
 * Get the name of the image file currently displayed.
 */
ImageWindow.prototype.getFilename = function() {
    return this.filenames[this.fileIndices[this.imgIndex]];
}

/*
 * Accessor for the index of the image being displayed.
 */
ImageWindow.prototype.getImageIndex = function() {
    return this.imgIndex;
}

/*
 * Retrieve all information pertaining to the current image.
 */
ImageWindow.prototype.getImageInfo = function() {
    if (this.isReady) {
        let idx = this.fileIndices[this.imgIndex];
        let s = 'Filename: '.concat(
            this.imgPath, 
            this.filenames[idx], '\n',
            'File index: ', idx, '\n',
            'Timestamp: ', this.timestamps[idx], '\n');
        return s;
    }
    return 'No data available: Images not loaded.';
}

/*
 * Get the timestamp of the current image.
 */
ImageWindow.prototype.getTimestamp = function(idx) {
    return this.timestamps[idx];
}

/*
 * Sets the index of the image to be displayed.
 */
ImageWindow.prototype.setImageIndex = function(idx) {
    ensureInteger(idx);
    this.imgIndex = idx;
}

/*
 * Tell this window which image to try to load next.
 */
ImageWindow.prototype.setNextLoad = function(idx) {
    ensureInteger(idx);
    if (idx < 0 || idx >= this.capacity) throw 'Value ' + idx + ' is invalid.';

    let x = this.loadOrder.indexOf(idx);
    if (x >= 0) {
        switch (this.loadMode) {
            case 'linear':
                this.loadOrder = this.loadOrder.concat(this.loadOrder.splice(0, x));
                break;
            case 'fill':
                this.loadOrder.splice(x, 1);
                this.loadOrder.unshift(idx);
                break;
            default:
                throw 'Invalid state in load mode variable.';
        }
    }
}

/*
 * Sets the array of timestamps to use.
 */
ImageWindow.prototype.setTimestamps = function(stamps) {
    ensureNonEmptyArray(stamps);
    ensureString(stamps[0]); // Shallow type check only for now...
    this.timestamps = stamps;
}

/*
 * Update coordinates and dimensions.
 */
ImageWindow.prototype.updateParameters = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
}

