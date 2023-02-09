// Turn on strict mode.
"use strict";

/*
 * For displaying low-res thumbnails below the scrollbar.
 */
function ThumbnailBar(x, y, w, h, id) {
    Loader.apply(this, arguments); 

    this.imgWidth = 64;
    this.bgcolour = "rgb(155, 155, 185)";

    // Graphics element to render scrollbar.
    let density = window.pixelDensity();
    this.bar = createGraphics(w * density, h * density); 
    this.bar.noStroke();

    this.calculateSize();       // Determine how many thumbnails are needed.
}

ThumbnailBar.prototype = Object.create(Loader.prototype);
ThumbnailBar.prototype.constructor = ThumbnailBar;

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Determine the number of thumbnails that will be needed,
 *  then set all internal arrays (except filenames) to that length.
 */
ThumbnailBar.prototype.calculateSize = function() {
    this.capacity = this.width / 64;
    let diff = this.width % 64;
    if (diff > 31) { this.capacity++; }
    this.fileIndices.length = this.capacity;
    this.imgArr.length = this.capacity;
    this.orderPlaced.length = this.capacity;
    this.imgWidth = this.width / this.capacity;
    if (files) this.offset = Math.floor(files.length / this.capacity / 2);
}

/*
 * Draw the ThumbnailBar.
 */
ThumbnailBar.prototype.draw = function() {
    imageMode(CORNER);
    image(this.bar, this.x, this.y, this.width, this.height);
}

/*
 * Render an image onto the ThumbnailBar.
 */
ThumbnailBar.prototype.renderImage = function(idx) {
    if (!this.imgArr[idx]) throw 'Image at ' + idx + ' is not loaded.';

    this.bar.image(
        this.imgArr[idx],       // image object.
        this.imgWidth * idx,    // x
        0,                      // y
        this.imgWidth,          // width
        this.height             // height
    );
}

/*
 * Reset the ThumbnailBar to a blank slate.
 */
ThumbnailBar.prototype.reset = function() {
    this.bar.background(this.bgcolour);
    this.resetToCapacity();
}

/*
 * Provide access to a previously loaded array containing the file names
 *  of the thumbnails to load.
 *
 * NOTE: Current strategy is that filenames are the same across all
 *       image sizes. Allows use of just one array, whose reference is
 *       shared between objects.
 */
ThumbnailBar.prototype.setFilenames = function(files) {
    Loader.prototype.setFilenames.call(this, files);
    this.offset = Math.floor(files.length / this.capacity / 2);
}

/*
 * Update coordinates and dimensions.
 */
ThumbnailBar.prototype.updateParameters = function(x, y, w, h, doLoad) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    let density = window.pixelDensity();
    this.bar.resizeCanvas(w * density, h * density);

    // Correct for a p5 bug in resizeCanvas.
    // TODO: Remove this once the bug is fixed.
    this.bar.width = w * density;
    this.bar.height = h * density;

    this.bar.background(this.bgcolour);

    this.calculateSize();
    if (doLoad) this.load();
}

