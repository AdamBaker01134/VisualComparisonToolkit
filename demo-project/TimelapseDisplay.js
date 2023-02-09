// Turn on strict mode:
"use strict";

/*
 * Class that provides TimelapseDisplay functionality for the phenocanola 
 * timelapse project.
 * 
 * Frames include an image and a scrollbar which is tied to the bottom of
 * the image, which is used to scroll through the timelapse series.
 *
 * ARGS:
 *  - ID        ::  ID number for this frame. Most useful as array index
 *                   for in an array of frames.
 *  - x         ::  x coordinate of the upper-left corner of the frame.
 *  - y         ::  y coordinate of the upper-left corner of the frame.
 *  - imgWidth  ::  Width of the images to be displayed in the frame.
 *  - imgHeight ::  Height of the images to be displayed in the frame.
 */
function TimelapseDisplay(x, y, imgWidth, imgHeight, ID ) {
    this.id = ID;

    // Position and dimensions.
    this.x = x;
    this.y = y;
    this.width = imgWidth;
    this.height = imgHeight + 66;
    this.textWidth = 550;
    this.textHeight = 30;

    // Text to display in top left of frame, over the images.
    let d = window.pixelDensity();
    this.text = createGraphics(this.textWidth * d, this.textHeight * d);
    this.text.fill(0);
    this.text.textAlign(LEFT);
    this.text.textSize(18);
    this.text.strokeWeight(3);
    this.text.stroke(255, 200);

    // Variable to hold the image window.
    this.image = new ImageWindow(
        this.x,         // x
        this.y,         // y
        imgWidth,       // width
        imgHeight,      // height
        ID              // id
    );

    // Variable to hold the scrollbar object.
    this.scrollbar = new Scrollbar(
        this.x,                 // x
        this.y + imgHeight,     // y
        this.width,             // width
        30                      // height
    );

    // Variable to hold thumbnailbar object.
    this.thumbnails = new ThumbnailBar(
        this.x,                     // x
        this.y + imgHeight + 30,    // y
        this.width,                 // width
        36,                         // height
        ID                          // id
    );

    // Variable to hold the timestamp display.
    this.timestamp = new Timestamp(
        this.x + this.width - 10,   // x (of right side of text)
        this.y                      // y
    );
}

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Add a segment to the scrollbar.
 */
TimelapseDisplay.prototype.addSegment = function(idx) {
    this.scrollbar.addSegment(idx);
}

/*
 * Clear any text that has been set to display over the images.
 */
TimelapseDisplay.prototype.clearText = function() {
    this.text.background(0,0);
}

/*
 * Move down to the previous valid index.
 */
TimelapseDisplay.prototype.decrementIndex = function() {
    this.scrollbar.decrementIndex();
    this.syncIndices();
}

/*
 * Draw the timelapse frame.
 */
TimelapseDisplay.prototype.draw = function() {
    // Get rid of triangle artefacts from previous draws and prepare p5
    // environment for drawing.
    noStroke();
    rectMode(CORNER);
    fill(255);
    rect(this.x + this.width, this.y, 10, this.height);

    // Draw all the elements.
    this.image.draw();
    this.scrollbar.draw();
    this.timestamp.draw();
    this.thumbnails.draw();

    if (this.isReady()) {
        // Display the text.
        if (this.text instanceof p5.Graphics) {
            image(this.text, this.x, this.y, this.textWidth, this.textHeight);
        } 
    }
}

/*
 * Only draw the thumbnails.
 */
TimelapseDisplay.prototype.drawThumbs = function() {
    this.thumbnails.draw();
}

/*
 * Access the current capacity.
 */
TimelapseDisplay.prototype.getCapacity = function() {
    return this.image.getCapacity();
}

/*
 * Get the timestamp of the currently displayed image, if available.
 */
TimelapseDisplay.prototype.getCurrentTimestamp = function() {
    return this.image.getCurrentTimestamp();
}

/*
 * Get the global index of the image referenced by the current scrollbar position.
 */
TimelapseDisplay.prototype.getFileIndex = function() {
    return this.image.getFileIndex();
}

/*
 * Get the filename of the image currently displayed.
 */
TimelapseDisplay.prototype.getFilename = function() {
    return this.image.getFilename();
}

/*
 * Accessor for the frame's ID.
 */
TimelapseDisplay.prototype.getID = function() {
    return this.id;
}

/*
 * Get index of the image currently displayed.
 * NOTE: This is the index in the image array, not the file names array.
 */
TimelapseDisplay.prototype.getImageIndex = function() {
    return this.image.getImageIndex();
}

/*
 * Retrieve information about the currently displayed image.
 */
TimelapseDisplay.prototype.getImageInfo = function() {
    return this.image.getImageInfo();
}

/*
 * Accessor for the load mode.
 */
TimelapseDisplay.prototype.getLoadMode = function() {
    return this.image.getLoadMode();
}

/*
 * Get the timestamp of the current image.
 */
TimelapseDisplay.prototype.getTimestamp = function(idx) {
    return this.image.getTimestamp(idx);
}

/*
 * Report whether the mouse is in this frame.
 */
TimelapseDisplay.prototype.hasMouseInFrame = function(mx = mouseX, my = mouseY) {
    if (mx >= this.x &&
        mx <= (this.x + this.width) &&
        my >= this.y &&
        my <= (this.y + this.height)) {
        return true;
    } 
    return false;
}

/*
 * Report whether the mouse is positioned over the scrollbar.
 */
TimelapseDisplay.prototype.hasMouseInScrollbar = function(mx, my) {
    return this.scrollbar.hasMouseInScrollbar(mx, my);
}

/*
 * Move up to the next valid index.
 */
TimelapseDisplay.prototype.incrementIndex = function() {
    this.scrollbar.incrementIndex();
    this.syncIndices();
}

/*
 * Reports whether the frame's images have loaded yet.
 */
TimelapseDisplay.prototype.isReady = function() {
    return this.image.isReadyToDisplay();
}

/*
 * Reports whether the frame has more images to load.
 */
TimelapseDisplay.prototype.isLoading = function() {
    return this.image.isLoading() || this.thumbnails.isLoading();
}

/*
 * Report whether this frame is paused.
 */
TimelapseDisplay.prototype.isPaused = function() {
    return this.image.isPaused();
}

/*
 * Loads the file names of the images to be loaded.
 */
//TimelapseDisplay.prototype.load = function(start = 0, end = -1, step = -1) {
TimelapseDisplay.prototype.load = function(dist = -1, start = 0) {
    ensureInteger(dist);
    ensureInteger(start);

    // Determine the distance between images, and the range of images to load.
    if (dist < 0) dist = Math.floor(files.length / this.getCapacity());
    let range = Math.floor(this.getCapacity() * dist);
    if (range > files.length) {
        let msg = 'Requested image range exceeds available timeframe.';
        alert(msg);
        throw msg;
    }
    
    // Math.ceil() ensures that, if possible, first image loaded will be a
    // higher resolution version of the one that is under the cursor.
    // - Not (currently) possible if close to start or end of image set.
    // - Some form of integer conversion necessary regardless.
    let half = range / 2;
    half -= half % dist; 

    if (this.getLoadMode() === 'fill') start = Math.ceil(start - half);
    if (start < 0) start = 0;

    let end = start + range;
    if (end > files.length) {    // Guard is ( < end) elsewhere.
        let diff = end - files.length;
        end = files.length;
        start -= diff;
    }


    // Initiate load, wipe all elements clean, prep for new display.
    this.setText(
        this.getTimestamp(start) + ' \u21d2 ' + this.getTimestamp(end - dist)
    );
    this.image.load(start, end, dist);
    this.thumbnails.load(start, end);
    this.scrollbar.resetToCapacity(this.getCapacity());
    this.timestamp.clearStamp();
    this.draw();
}

/* 
 * Tell this frame to pause loading.
 */
TimelapseDisplay.prototype.pause = function() {
    this.image.pause();
    this.thumbnails.pause();
}

/*
 * Render the given thumbnail.
 */
TimelapseDisplay.prototype.renderThumbnail = function(id) {
    this.thumbnails.renderImage(id);
}

/*
 * Reset the frame.
 */
TimelapseDisplay.prototype.reset = function() {
    this.image.resetToCapacity();
    this.scrollbar.resetToCapacity();
    this.thumbnails.reset();
    this.timestamp.clearStamp();
}

/*
 * Tell this frame to resume loading.
 */
TimelapseDisplay.prototype.resume = function() {
    this.image.resume();
    this.thumbnails.resume();
}

/*
 * Set the capacity (max number of images to load).
 */
TimelapseDisplay.prototype.setCapacity = function(cap) {
    this.image.setCapacity(cap);
    this.scrollbar.resetToCapacity(cap);
}

/*
 * Set the array of file names to be used in loading.
 */
TimelapseDisplay.prototype.setFilenames = function(files) {
    this.image.setFilenames(files);
    this.thumbnails.setFilenames(files);
}

/*
 * Set the index of the image to view.
 * NOTE: This is the index in the image array, not the file names array.
 */
TimelapseDisplay.prototype.setImageIndex = function(idx) {
    this.scrollbar.updateIndex(idx);
    this.syncIndices();
}

/*
 * Set the relative path of the image files directory.
 */
TimelapseDisplay.prototype.setImagePath = function(imgPath) {
    this.image.setImagePath(imgPath);
    this.thumbnails.setImagePath(
        imgPath.substr(0, imgPath.lastIndexOf('/', imgPath.length - 2)) + '/thumbs/'
    );
}

/*
 * Set the way that images should load.
 */
TimelapseDisplay.prototype.setLoadMode = function(mode) {
    this.image.setLoadMode(mode);
    this.thumbnails.setLoadMode(mode);
}

/*
 * Set which image to load next in linear loads.
 */
TimelapseDisplay.prototype.setNextLoadFromMouse = function(mx = mouseX) {
    this.image.setNextLoad(this.scrollbar.getIndexFromMouse(mx));
}

/*
 * Set the text to display over the images.
 */
TimelapseDisplay.prototype.setText = function(txt) {
    ensureString(txt);
    this.text.clear();
    this.text.text(txt, 10, 22);
}

/*
 * Tell the timestamp not to wipe its background when it renders.
 */
TimelapseDisplay.prototype.setTimestampDoNotWipeBackground = function() {
    this.timestamp.setDoNotWipeBackground();
}

/*
 * Set the location where the timestamp should appear.
 */
TimelapseDisplay.prototype.setTimestampPosition = function(x, y) {
    this.timestamp.updatePosition(x, y);
}

/*
 * Set the array of timestamps.
 */
TimelapseDisplay.prototype.setTimestamps = function(stamps) {
    this.image.setTimestamps(stamps);
}

/*
 * Tell the timestamp to wipe its background when it renders.
 */
TimelapseDisplay.prototype.setTimestampWipeBackground = function() {
    this.timestamp.setWipeBackground();
}

/*
 * Make sure that the scrollbar and image refer to the same indices.
 */
TimelapseDisplay.prototype.syncIndices = function() {
    this.image.setImageIndex(this.scrollbar.getIndex());
    this.timestamp.setStamp(this.getCurrentTimestamp());
}

/*
 * Function to be called when this scrollbar is clicked on.
 */
TimelapseDisplay.prototype.updateIndexFromMouse = function(mx) {
    if (this.isReady()) {
        this.scrollbar.updateIndexFromMouse(mx);
        this.syncIndices();
    }
}

/*
 * Update the coordinates and dimensions of the frame.
 */
TimelapseDisplay.prototype.updateParameters = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h + 66;
    this.image.updateParameters(x, y, w, h);
    this.scrollbar.updateParameters(x, y + h, w, 30);
    let doLoad = this.image.imgArr.some( i => i );
    this.thumbnails.updateParameters(x, y + h + 30, w, 36, doLoad);
    this.setTimestampPosition( this.x + this.width - 10, this.y );
    this.timestamp.setDoNotWipeBackground();
}

