"use strict";

/**
 * 
 * @param {string} name name of the dataset
 * @param {string} id display id
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 * @param {p5.Element} parent the intended parent element for the display
 * @param {number} width width dimension of the display
 * @param {number} height height dimension of the display
 * @param {number} offset offset of the master scrollbar upon creation
 * @param {Function} onRemove callback function to remove display when remove button is pressed
 */
function TimelapseDisplay(name, id, frames, timestamps, images, parent, width, height, offset=0, onRemove=()=>{}) {
    this.name = name;
    this.id = id;
    this.frames = frames;
    this.timestamps = timestamps;
    this.images = images;

    this.width = width;
    this.height = height;
    this.imgIdx = 0;
    this.offset = offset;
    this.savedFrames = [];

    this.display = createElementWithID("div", "", id, "display");
    this.display.parent(parent);

    let density = window.pixelDensity();

    /* Display deletion button */
    this.removeButton = createButton("Remove");
    this.removeButton.parent(this.display);
    this.removeButton.class("displayTopControls");
    this.removeButton.id("removeButton");
    this.removeButton.mouseClicked(() => onRemove(this.id));

    this.topControls = createDiv();
    this.topControls.class("displayTopControls");
    this.topControls.parent(this.display);

    /* Frame select */
    this.frameSelect = createSelect();
    this.frameSelect.id("frameSelect");
    this.frameSelect.parent(this.topControls);
    this.frameSelect.option("Select Frame");
    this.frameSelect.disable("Select Frame");

    /* Load frame button */
    this.loadFrameButton = createButton("Load Frame");
    this.loadFrameButton.id("loadFrameButton");
    this.loadFrameButton.parent(this.topControls);
    this.loadFrameButton.mouseClicked(this._loadFrame.bind(this));

    /* Save frame button */
    this.saveFrameButton = createButton("Save Frame");
    this.saveFrameButton.id("saveFrameButton");
    this.saveFrameButton.parent(this.topControls);
    this.saveFrameButton.mouseClicked(this._saveCurrentFrame.bind(this));

    /* Dataset name text p5 element */
    this.nameText = createGraphics(this.width * density, 30 * density);
    this.nameText.fill(0);
    this.nameText.textAlign(LEFT);
    this.nameText.textSize(24);
    this.nameText.strokeWeight(1);
    this.nameText.stroke(255);
    this.nameText.text("/"+ this.name, 10, 22);

    /* Current timestamp text p5 element */
    this.timestamp = createGraphics(this.width * density, 30 * density);
    this.timestamp.fill(0);
    this.timestamp.textAlign(RIGHT);
    this.timestamp.textSize(24);
    this.timestamp.strokeWeight(1);
    this.timestamp.stroke(255);

    /* Title bar p5 element to contain dataset name and current timestamp */
    this.titleBar = createGraphics(this.width, 30);
    this.titleBar.parent(this.display);
    this.titleBar.show();

    /* Image window to contain currently displayed image */
    this.imageWindow = createGraphics(this.width, this.height);
    this.imageWindow.parent(this.display);
    this.imageWindow.show();

    /* Timelapse display custom scrollbar to control image index */
    this.scrollbar = new Scrollbar(this.width, 30, this.id, this.display);
    for (let i = 0; i < this.images.length; i++) {
        this.scrollbar.addSegment(i);
    }
    this.scrollbar.updateParameters(this.width, 30);

    this.setIndex(0);
}

/** Getter function for the object's name attribute. */
TimelapseDisplay.prototype.getName = function () {
    return this.name;
}

/** Getter function for the object's id attribute. */
TimelapseDisplay.prototype.getId = function () {
    return this.id;
}

/** Getter function for the object's imgIdx attribute. */
TimelapseDisplay.prototype.getIndex = function () {
    return this.imgIdx;
}

/** Setter function for the object's imgIdx attribute. */
TimelapseDisplay.prototype.setIndex = function(newIndex) {
    if (newIndex < 0) {
        this.imgIdx = 0;
    } else if (newIndex >= this.images.length) {
        this.imgIdx = this.images.length - 1;
    } else {
        this.imgIdx = newIndex;
    }
    this.timestamp.clear();
    if (newIndex !== this.scrollbar.getIndex()) {
        this.scrollbar.setIndex(newIndex);
    }
    this.timestamp.text(this.timestamps[this.imgIdx], this.width, 22);
}

/**
 * Sets the current offset from the master scrollbar.
 * @param {number} newOffset new offset to set
 */
TimelapseDisplay.prototype.setOffset = function(newOffset) {
    this.offset = newOffset;
}

/**
 * Update the image index using a scrollbar offset.
 * Used to give state mutability to master scrollbar.
 * @param {number} offset offset value to compare with the displays current offset value.
 */
TimelapseDisplay.prototype.setIndexFromOffset = function(offset) {
    this.setIndex(this.imgIdx + (offset - this.offset));
    this.setOffset(offset);
}

/**
 * Set the index from the mouses position.
 * @param {number} mx x coordinate of the cursor.
 */
TimelapseDisplay.prototype.setIndexFromMouse = function(mx = mouseX) {
    this.scrollbar.setIndexFromMouse(mx);
    this.syncIndices();
}

/**
 * Sync the indices from the scrollbar with the scrollbar.
 */
TimelapseDisplay.prototype.syncIndices = function() {
    this.imgIdx = this.scrollbar.getIndex();
}

/**
 * Handle one of several mouse events, such as updating the index, the start position, or the end position. 
 * @param {number} mx x coordinate of the cursor.
 */
TimelapseDisplay.prototype.handleMouseEvent = function(mx = mouseX) {
    this.scrollbar.handleMouseEvent(mx);
    this.syncIndices();
}

/**
 * Report whether the mouse is in this displays scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 */
TimelapseDisplay.prototype.hasMouseInScrollbar = function(mx = mouseX, my = mouseY) {
    return this.scrollbar.hasMouseInScrollbar();
}

/**
 * Draw function called in every draw loop.
 */
TimelapseDisplay.prototype.draw = function () {
    /* Draw titleBar */
    this.titleBar.clear();
    this.titleBar.image(this.nameText, 0, 0, this.width, 30);
    this.titleBar.image(this.timestamp, this.width / 2, 0, this.width, 30);

    /* Draw imageWindow */
    this.imageWindow.clear();
    this.imageWindow.noStroke();
    this.imageWindow.fill(255);
    this.imageWindow.image(this.images[this.imgIdx], 0, 0, this.width, this.height);

    this.scrollbar.draw();
}

/**
 * Removal function that deletes the display element from the DOM once the canvas has removed it
 * from its state array.
 */
TimelapseDisplay.prototype.remove = function () {
    this.display.remove();
}

/**
 * Add a dot to the scrollbar.
 * @param {number} idx new configuration index
 * @param {number|string} colour colour of the dot
 */
TimelapseDisplay.prototype.addDot = function (idx, colour) {
    this.scrollbar.addDot(idx, colour);
}

/**
 * @private
 * Saves the current frame of the display in an array and adds it to the saved frame select element.
 */
TimelapseDisplay.prototype._saveCurrentFrame = function () {
    if (this.savedFrames.findIndex((savedFrame) => savedFrame.timestamp === this.timestamps[this.imgIdx]) >= 0) {
        /* Frame has been previously saved. */
        console.log("Current frame has already been previously saved.");
        return;
    }

    let currentFrameObj = {
        timestamp: this.timestamps[this.imgIdx],
        index: this.imgIdx,
    };
    this.savedFrames.push(currentFrameObj);
    this.frameSelect.option(currentFrameObj.timestamp);
    this.frameSelect.value(currentFrameObj.timestamp);
    console.log("Saved current frame with timestamp [" + currentFrameObj.timestamp + "] and index [" + currentFrameObj.index + "].");
}

/**
 * Load a saved frame using the currently selected timestamp as a reference.
 */
TimelapseDisplay.prototype._loadFrame = function () {
    let timestamp = this.frameSelect.elt.value;
    console.log("Selected new saved frame: " + timestamp);
    let frameIndex = this.savedFrames.find((savedFrame) => timestamp === savedFrame.timestamp)?.index;
    if (frameIndex >= 0) {
        this.setIndex(frameIndex);
    }
}