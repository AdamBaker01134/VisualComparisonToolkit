/**
 * Customized scrollbar to replace the default HTML range input slider.
 */

"use strict";

function Scrollbar(width, height, id, parent) {

    this.width = width;
    this.height = height;
    this.id = id;

    this.isReady = false;       // Declares whether any segments have been loaded.
    this.segments = [];         // Array of ScrollbarSegments
    this.dots = [];             // Array of ScrollbarDots
    this.clickables = [];       // Array to keep track of which index to jump to when clicked.
    this.size = 0;              // Number of items to be scrolled through.
    this.index = -1;            // Current position in the scrollbar.
    this.start = -1;
    this.end = -1;
    this.lineGap = this.width;  // Gap between lines in scrollbar.

    this.scrollbar = createGraphics(this.width, this.height);
    this.scrollbar.id(id + "-scrollbar");
    this.scrollbar.class("scrollbar");
    this.scrollbar.parent(parent);
    this.scrollbar.show();
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
    let start = this.segments.findLast((segment => segment), idx - 1);
    start = start < 0 ? 0 : Math.ceil((start + idx) / 2);

    let end = this.segments.findFirst((segment => segment), idx + 1);
    end = end < 0 ? this.segments.length : Math.ceil((end + idx) / 2);

    // Fill in the clickables array inside the located range.
    this.clickables.fillWith(idx, start, end);

    if (!this.isReady) {
        // This is the first segment to load. Adjust the index as such.
        this.index = idx;
        this.start = 0;
        this.isReady = true;
    }
    this.end = this.segments.length - 1;
}

/**
 * Add a configuration index to the configIndices array.
 * @param {number} idx new configuration index
 * @param {number|string} colour colour of the dot
 */
Scrollbar.prototype.addDot = function (idx, colour = "#222222") {
    let dot = new ScrollbarDot(idx, colour, this.lineGap);
    this.dots.push(dot);
}

/**
 * Draw the scrollbar.
 */
Scrollbar.prototype.draw = function () {
    this.scrollbar.background("rgb(34, 154, 34)");

    if (this.isReady) {
        let startPos = this.lineGap * (0.5 + this.start);
        let endPos = this.lineGap * (0.5 + this.end);

        // Draw the empty regions (i.e. not between the start and end positions).
        this.scrollbar.noStroke();
        this.scrollbar.fill(255);
        this.scrollbar.rect(0, 0, startPos, this.height);
        this.scrollbar.rect(endPos, 0, this.width, this.height);

        let triangleSize = this.height / 6;
        let trianglePos = this.lineGap * (0.5 + this.index);

        this.scrollbar.stroke(25);
        // Draw the start position triangle.
        this.scrollbar.triangle(
            startPos,
            triangleSize,
            startPos - triangleSize,
            this.height - 0.5,
            startPos + triangleSize,
            this.height - 0.5
        );

        // Draw the end position triangle.
        this.scrollbar.triangle(
            endPos,
            triangleSize,
            endPos - triangleSize,
            this.height - 0.5,
            endPos + triangleSize,
            this.height - 0.5
        );

        // Draw the position indicator triangle.
        this.scrollbar.fill(0);
        this.scrollbar.triangle(
            trianglePos,                    // top x
            triangleSize,                   // top y
            trianglePos - triangleSize,     // left x
            this.height - 0.5,              // left y
            trianglePos + triangleSize,     // right x
            this.height - 0.5               // right y
        );
    }

    /* Render all line segments on the scrollbar. */
    this.segments.forEach((segment) => {
        this.renderLine(segment.idx, segment.line);
    });

    /* Render all dots on the scrollbar. */
    this.dots.forEach((dot) => {
        this.renderDot(dot.colour, dot.pos, dot.diameter);
    });
}

/**
 * Render a marker line on the scrollbar.
 * @param {number} idx index of the line segment
 * @param {number} pos position of the line segment
 */
Scrollbar.prototype.renderLine = function (idx, pos) {
    /* Uncomment when using large number of MAX_IMAGES */
    // switch (idx % 50) {
    //     case 0:
    //         this.scrollbar.line(pos, 0, pos, 12);
    //         break;
    //     case 25:
    //         this.scrollbar.line(pos, 0, pos, 8);
    //         break;
    //     case 12:
    //     case 38:
    //         this.scrollbar.line(pos, 0, pos, 5);
    //         break;
    //     default:
    //         this.scrollbar.line(pos, 0, pos, 2);
    //         break;
    // }
    switch (idx % 10) {
        case 0:
            this.scrollbar.line(pos, 0, pos, 12);
            break;
        case 5:
            this.scrollbar.line(pos, 0, pos, 8);
            break;
        default:
            this.scrollbar.line(pos, 0, pos, 5);
            break;
    }
}

/**
 * Render a dot on the scrollbar.
 * @param {string|number} colour colour of the dot
 * @param {number} pos position of the dot in the scrollbar
 */
Scrollbar.prototype.renderDot = function (colour, pos, diameter) {
    this.scrollbar.fill(colour);
    this.scrollbar.circle(pos, diameter / 2, diameter);
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
    /* Flooring index because, due to the step ratio multiplier, imgIdx may not be a round number */
    return Math.floor(this.index);
}

/**
 * Get the current start index of the scrollbar.
 */
Scrollbar.prototype.getStart = function () {
    return this.start;
}

/**
 * Get the current end index of the scrollbar.
 */
Scrollbar.prototype.getEnd = function () {
    return this.end;
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
 * Report whether the mouse is positioned over this scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {*} my y coordinate of the cursor
 * @returns {boolean}
 */
Scrollbar.prototype.hasMouseInScrollbar = function (mx = mouseX, my = mouseY) {
    let x = this.getXOffset();
    let y = this.getYOffset();

    return (mx >= x && mx <= (x + this.width)) &&
        (my >= y && my <= (y + this.height));
}

/**
 * Report whether the mouse is positioned over the start triangle.
 * @param {number} mx x coordinate of the cursor
 * @returns {boolean}
 */
Scrollbar.prototype.hasMouseOnStart = function (mx = mouseX) {
    let triangleSize = this.height / 6;
    let startPos = (this.lineGap * (0.5 + this.start)) + this.getXOffset();
    return mx >= startPos - triangleSize && mx <= startPos + triangleSize;
}

/**
 * Report whether the mouse is positioned over the end triangle.
 * @param {number} mx x coordinate of the cursor
 * @returns {boolean} 
 */
Scrollbar.prototype.hasMouseOnEnd = function (mx = mouseX) {
    let triangleSize = this.height / 6;
    let endPos = (this.lineGap * (0.5 + this.end)) + this.getXOffset();
    return mx >= endPos - triangleSize && mx <= endPos + triangleSize;
}

/**
 * Set the index to the given value.
 * @param {number} idx new index value
 */
Scrollbar.prototype.setIndex = function (idx) {
    // Update the index and keep it within bounds.
    let saved = this.index;
    this.index = idx;

    if (this.index < this.start) {
        this.index = this.start;
    } else if (this.index > this.end) {
        this.index = this.end;
    }

    if (this.index < 0) {
        this.index = 0;
    } else if (this.index >= this.segments.length) {
        this.index = this.segments.length - 1;
    }

    // Make sure the index is valid.
    if (!this.segments[this.getIndex()]) {
        this.index = saved;
    }

    return this.index;
}

/**
 * Set the start index to the given value.
 * @param {number} idx new index value
 */
Scrollbar.prototype.setStart = function (idx) {
    // Update the start and keep it within bounds.
    let savedStart = this.start;
    let savedIndex = this.index;
    this.start = idx;

    if (this.start < 0) {
        this.start = 0;
    } else if (this.start > this.index) {
        this.index = this.start;
    }

    // Make sure the start index and regular index is valid.
    if (!this.segments[this.start] || !this.segments[this.getIndex()]) {
        this.start = savedStart;
        this.index = savedIndex;
    }

    return this.start;
}

/**
 * Set the end index to the given value.
 * @param {number} idx new index value
 */
Scrollbar.prototype.setEnd = function (idx) {
    // Update the end and keep it within bounds.
    let savedIndex = this.index;
    let savedEnd = this.end;
    this.end = idx;

    if (this.end < this.index) {
        this.index = this.end;
    } else if (this.end >= this.segments.length) {
        this.end = this.segments.length - 1;
    }

    // Make sure the end index is valid.
    if (!this.segments[this.end] || !this.segments[this.getIndex()]) {
        this.end = savedEnd;
        this.index = savedIndex
    }

    return this.end;
}

/**
 * Handle any mouse motion event in the scrollbar.
 * @param {number} mx current x coordinate of the cursor
 * @param {boolean} movingStart true if this is a start marker event
 * @param {boolean} movingEnd true if this is an end marker event
 */
Scrollbar.prototype.handleMouseEvent = function (mx = mouseX, movingStart = false, movingEnd = false) {
    let triangleSize = this.height / 6;
    let indexPos = (this.lineGap * (0.5+ this.index)) + this.getXOffset();
    let inIndexTriangle = mx >= indexPos - triangleSize && mx <= indexPos + triangleSize;

    if (movingStart && !inIndexTriangle) {
        /* If mouse is on start position and index is not at start position, update start position */
        this.setStartFromMouse(mx);
    } else if (movingEnd && !inIndexTriangle) {
        /* If mouse is on end position and index is not at end position, update end position*/
        this.setEndFromMouse(mx);
    } else if (!movingStart && !movingEnd) {
        /* Else, update index */
        this.setIndexFromMouse(mx);
    }
}

/**
 * Scrollbar clicked event handler to update the scrollbar index.
 * @param {number} mx x coordinate of the cursor
 * @returns {number} if no errors occur, return new index. if error occurs, return -1
 */
Scrollbar.prototype.setIndexFromMouse = function (mx = mouseX) {
    if (this.hasMouseInScrollbar()) {
        let idx = this.getIndexFromMouse(mx);
        if (idx !== this.index) {
            this.setIndex(this.clickables[idx]);
        }
        return idx;
    }
    return -1;
}

/**
 * Scrollbar clicked event handler to update the scrollbar start position.
 * @param {number} mx x coordinate of the cursor
 * @returns {number} if no errors occur, return new index. if error occurs, return -1
 */
Scrollbar.prototype.setStartFromMouse = function (mx = mouseX) {
    if (this.hasMouseInScrollbar()) {
        let idx = this.getIndexFromMouse(mx);
        if (idx !== this.start && this.index >= idx) {
            this.start = idx;
        }
        return idx;
    }
    return -1;
}

/**
 * Scrollbar clicked event handler to update the scrollbar end position.
 * @param {number} mx x coodinate of the cursor
 * @returns if no errors occur, return new index. if error occurs, return -1
 */
Scrollbar.prototype.setEndFromMouse = function (mx = mouseX) {
    if (this.hasMouseInScrollbar()) {
        let idx = this.getIndexFromMouse(mx);
        if (idx !== this.end && this.index <= idx) {
            this.end = idx;
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

    this.dots.forEach((dot) => {
        dot.updatePosition(this.lineGap);
    });
}

Scrollbar.prototype.getXOffset = function () {
    return this.scrollbar.elt.getBoundingClientRect().x;
}

Scrollbar.prototype.getYOffset = function () {
    return this.scrollbar.elt.getBoundingClientRect().y;
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

/**
 * Object representing a scrollbar's dot, containing relevant info for drawing.
 * @param {number} idx index of this current dot
 * @param {number|string} colour colour of the dot
 * @param {number} gap gap between line segments
 */
function ScrollbarDot(idx, colour, gap) {
    this.idx = idx;
    this.colour = colour;
    this.diameter = 5;
    this.updatePosition(gap);
}

/**
 * Update the position of the scrollbar dot.
 * @param {number} gap current line gap
 */
ScrollbarDot.prototype.updatePosition = function (gap) {
    let partial = gap * 0.1;
    this.pos = (gap * this.idx) + partial + gap / 2 - 0.5;
}