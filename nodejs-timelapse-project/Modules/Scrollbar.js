/**
 * Customized scrollbar to replace the default HTML range input slider.
 */

"use strict";

function Scrollbar(width, height, id, parent, onInput = () => { }) {

    this.width = width;
    this.height = height;
    this.id = id;
    this.onInput = onInput;

    this.isReady = false;       // Declares whether any segments have been loaded.
    this.segments = [];         // Array of ScrollbarSegments
    this.clickables = [];       // Array to keep track of which index to jump to when clicked.
    this.size = 0;              // Number of items to be scrolled through.
    this.index = -1;            // Current position in the scrollbar.
    this.lineGap = this.width;  // Gap between lines in scrollbar.

    this.scrollbar = createGraphics(this.width, this.height);
    this.scrollbar.id(id + "-scrollbar");
    this.scrollbar.class("scrollbar");
    this.scrollbar.parent(parent);
    this.scrollbar.show();

    // this.scrollbar.mousePressed(() => { this.active = true; this.updateMousePosition()});
    // this.scrollbar.mouseReleased(() => this.active = false);
    // this.scrollbar.mouseMoved(() => this.updateMousePosition());
}

/**
 * Add a segment to the scrollbar
 * @param {number} idx segment index
 */
Scrollbar.prototype.addSegment = function (idx) {
    this.size++;

    // Create a new ScrollbarSegment and add it to the segments array.
    let segment = new ScrollbarSegment(idx, this.lineGap);
    this.segments[idx] = segment;

    // Logic to get clicks to work.
    // Once an image is loaded, locate the previous image and the next image
    // and assign the area between them to the current image using the
    // 'clickables' array.
    let start = this.segments.findLast( (segment => segment), idx - 1);
    start = start < 0 ? 0 : Math.ceil( (start + idx) / 2);

    let end  = this.segments.findFirst( (segment => segment), idx + 1);
    end = end < 0 ? this.segments.length : Math.ceil( (end + idx) / 2);

    // Fill in the clickables array inside the located range.
    this.clickables.fill(idx, start, end);

    // // Render the segment.
    // this.size < this.segments.length ? this.renderSegment(segment) : this.render();

    if (!this.isReady) {
        // This is the first segment to load. Adjust the index as such.
        this.index = idx;
        this.isReady = true;
    }
}

// /**
//  * Move up to the next valid index.
//  */
// Scrollbar.prototype.incrementIndex = function () {
//     let savedIndex = this.index;

//     do {
//         this.index++;
//     } while (
//         this.clickables[this.index] === this.clickables[this.index - 1] &&
//         this.index < this.clickables.length - 1
//     );
//     this.index = this.clickables[this.index];

//     // Make sure we got a valid index.
//     if (this.index >= this.segments.length || !this.segments[this.index]) {
//         this.index = savedIndex;
//     }

//     return this.index;
// }

// /**
//  * Move down to the previous valid index.
//  */
// Scrollbar.prototype.decrementIndex = function () {
//     let savedIndex = this.index;

//     do {
//         this.index--; 
//     } while (
//         this.clickables[this.index] === this.clickables[this.index + 1] &&
//         this.index > 0
//     );
//     this.index = this.clickables[this.index];

//     // Make sure we got a valid index
//     if (this.index < 0 || !this.segments[this.index] ) this.index = savedIndex;

//     return this.index;
// }

/**
 * Draw the scrollbar.
 */
Scrollbar.prototype.draw = function () {
    this.scrollbar.background("rgb(34, 154, 34)");
    this.scrollbar.stroke(25);

    this.segments.forEach((segment) => {
        this.renderLine(segment.idx, segment.line);
    });

    if (this.isReady) {
        let triangleSize = this.height / 6;
        let trianglePos = this.lineGap * (0.5 + 100);

        // Draw the position indicator triangle.
        this.scrollbar.noStroke();
        this.scrollbar.fill(0);
        this.scrollbar.triangle(
            trianglePos,                    // top x
            triangleSize,                   // top y
            trianglePos - triangleSize,     // left x
            this.height - 0.5,              // left y
            trianglePos + triangleSize,     // right x
            this.height - 0.5               // right y
        );

        // this.scrollbar.triangle()
    }
}

/**
 * Render a marker line on the scrollbar.
 * @param {number} idx index of the line segment
 * @param {number} pos position of the line segment
 */
Scrollbar.prototype.renderLine = function (idx, pos) {
    switch (idx % 10) {
        case 0:
            this.scrollbar.line( pos, 0, pos, 12);
            break;
        case 5:
            this.scrollbar.line( pos, 0, pos, 8);
            break;
        default:
            this.scrollbar.line( pos, 0, pos, 5);
            break;
    }
}

/**
 * Get the capactiy of the scrollbar.
 */
Scrollbar.prototype.getCapacity = function () {
    return this.segments.length;
}

/**
 * Get the current index of the scrollbar.
 */
Scrollbar.prototype.getIndex = function () {
    return this.index;
}

/**
 * Map the current or given mouse position to an index.
 * @param {number} mx x coordinate of the cursor
 */
Scrollbar.prototype.getIndexFromMouse = function (mx = mouseX) {
    let x = this.getXOffset();
    let idx = (int)(map(
        mx,                     // value to map.
        x,                      // min value of mx.
        x + this.width,         // max value of mx.
        0,                      // min value of desired index.
        this.segments.length    // max value of desired index.
    ));

    if (idx >= this.segments.length) {
        idx = this.segments.length - 1;
    }
    return idx;
}

/**
 * Report whether the mouse is positions over this scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {*} my y coordinate of the cursor
 * @returns {boolean}
 */
Scrollbar.prototype.hasMouseInScrollbar = function (mx = mouseX, my = mouseY) {
    let x = this.getXOffset();
    let y = this.getYOffset();

    if ((mx >= x && mx <= (x + this.width)) &&
        (my >= y && my <= (y + this.height))) {
            return true;
    }

    return false;
}

/**
 * Set the index to the given value.
 * @param {number} idx new index value
 */
Scrollbar.prototype.setIndex = function (idx) {
    // Update the index and keep it within bounds.
    let saved = this.index;
    this.index = idx;
    if (this.index < 0) {
        this.index = 0;
    } else if (this.index >= this.segments.length) {
        this.index = this.segments.length - 1;
    }

    // Make sure the index is valid.
    if (!this.segments[this.index]) {
        this.index = saved;
    }

    return this.index;
}

/**
 * Function to be called when this scrollbar is clicked on.
 * @param {*} mx x coordinate of the cursor
 * @returns {number} if no errors occur, return new index. if error occurs, return -1
 */
Scrollbar.prototype.setIndexFromMouse = function (mx = mouseX) {
    let x = this.getXOffset();
    if (mx >= x && mx <= (x + this.width)) {
        let idx = this.getIndexFromMouse(mx);
        if (idx !== this.index) {
            this.setIndex(this.clickables[idx]);
        }
        return idx;
    }
    return -1;
}

/**
 * Update dimensions, line gap, and line segments.
 * @param {number} w new width of scrollbar
 * @param {number} h new height of scrollbar
 */
Scrollbar.prototype.updateParameters = function (w, h) {
    this.width = w;
    this.height = h;
    this.lineGap = w / this.segments.length;

    let density = window.pixelDensity();
    this.scrollbar.width = w * density;
    this.scrollbar.height = h * density;

    this.segments.forEach((segment) => {
        segment.updateSegment(this.lineGap);
    });
}

// Scrollbar.prototype.updateMousePosition = function () {
//     if (!this.active) return;
//     // console.log("updateMousePosition activated at mouseX: " + mouseX);
//     this.currentPos = mouseX - this.getXOffset();
// }

// Scrollbar.prototype.draw = function () {
//     this.scrollbar.background("rgb(34, 154, 34)");

//     this.scrollbar.stroke(0);
//     this.scrollbar.strokeWeight(4);
//     this.scrollbar.line(this.currentPos, 0, this.currentPos, 30);

//     this.scrollbar.strokeWeight(1);
//     this._drawSegments();
// }

// Scrollbar.prototype._drawSegments = function () {
//     let gap = Math.floor(this.width / this.segments) + 0.1;

//     for (let idx = 0; idx < this.segments; idx++) {
//         switch (idx % 10) {
//             case 0:
//                 this.scrollbar.line(idx * gap, 0, idx * gap, 12);
//                 break;
//             case 5:
//                 this.scrollbar.line(idx * gap, 0, idx * gap, 8);
//                 break;
//             default:
//                 this.scrollbar.line(idx * gap, 0, idx * gap, 5);    
//                 break
//         }
//     }
// }

Scrollbar.prototype.getXOffset = function () {
    return this.scrollbar.elt.getBoundingClientRect().left;
}

Scrollbar.prototype.getYOffset = function () {
    return this.scrollbar.elt.getBoundingClientRect().top;
}


/**
 * Object representing a scrollbar's segment, containing relevant info for drawing.
 * @param {number} idx index of this current segment
 * @param {number} gap gap between segments
 */
function ScrollbarSegment(idx, gap) {
    this.idx = idx;
    this.updateSegment(gap);
}

/**
 * Update the values inside the scrollbar segment.
 * @param {number} gap gap between segments
 */
ScrollbarSegment.prototype.updateSegment = function (gap) {
    let partial = gap * 0.1;
    this.left = gap * this.idx;
    this.width = gap + partial * 2;
    this.line = this.left + partial + gap / 2 - 0.5;
}