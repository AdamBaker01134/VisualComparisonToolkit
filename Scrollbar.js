// NOTE: File includes ScrollbarSegment class.

// Turn on strict mode:
"use strict";

/*
 * Scrollbar class, provides scrollbar functionality inside a p5.js sketch.
 *
 * ARGS:
 *  - x     ::  x coordinate of upper-left corner of scrollbar.
 *  - y     ::  y coordinate of upper-left corner of scrollbar.
 *  - w     ::  width of the scrollbar.
 *  - h     ::  height of the scrollbar.
 */
function Scrollbar(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.colour = "rgb(34, 154, 34)";       // A nice grassy green.
    this.bgcolour = "rgb(155, 155, 155)";   // Lightish grey.

    this.isReady = false;       // Declares whether any segments have been loaded.
    this.segments = [];         // Array of ScrollbarSegments.
    this.clickables = [];       // Array to keep track of which index to jump to when clicked.
    this.size = 0;              // Number of items to be scrolled through.
    this.index = -1;            // Current position in the scrollbar.
    this.lineGap = this.width;  // Gap between lines in scrollbar.

    // Create a p5.Graphics element to render the scrollbar.
    let density = window.pixelDensity();
    this.bg = createGraphics(w * density, h * density);

    // Initialize the scrollbar render.
    this.bg.background(this.bgcolour);
    this.bg.fill(this.colour);  // Set the fill colour for segments
}

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Add a segment to the scrollbar.
 */
Scrollbar.prototype.addSegment = function(idx) {
    this.size++;

    // Create the new ScrollbarSegment and add it to this.segments.
    let s = new ScrollbarSegment(idx, this.lineGap);
    this.segments[idx] = s;

    // This is the code to get clicks to always work.
    // The advantage is that all the heavy lifting is done only once per image
    //  that loads, and doesn't need to happen again on user clicks / drags.
    // Basically after an image loads, we locate the previous image, and the
    //  next image, then assign the area in the middle to the current image,
    //  using the 'clickables' array.
    let start = this.segments.findLast( (s => s), idx - 1 );
    start = start < 0 ? 0 : Math.ceil( (start + idx) / 2 );

    let end = this.segments.findFirst( (s => s), idx + 1 );
    end = end < 0 ? this.segments.length : Math.ceil( (end + idx) / 2 );

    // Fill in the clickables array inside the located range.
    this.clickables.fill(idx, start, end);

    // Render the segment.
    this.size < this.segments.length ? this.renderSegment(s) : this.render();

    if (!this.isReady) {
        // This is the first segment to load. Adjust the index as such.
        this.index = idx;
        this.isReady = true;
    }
}

/*
 * Move down to the previous valid index.
 */
Scrollbar.prototype.decrementIndex = function() {
    let saved = this.index;

    // Decrement to the first index referring to a different image.
    do { this.index--; } while (
        this.clickables[this.index] === this.clickables[this.index + 1] && 
        this.index > 0
    );
    this.index = this.clickables[this.index];

    // Make sure we got a valid index.
    if (this.index < 0 || !this.segments[this.index] ) this.index = saved;

    // Report the result.
    return this.index;
}

/*
 * Draw the scrollbar.
 */
Scrollbar.prototype.draw = function() {
    // Display the scrollbar render. 
    imageMode(CORNER);
    image(this.bg, this.x, this.y, this.width, this.height);
    
    if (this.isReady) {
        let triangleSize = this.height / 6;
        let trianglePos = this.x + this.lineGap * (0.5 + this.index);

        // Draw the position indicator triangle.
        noStroke();
        fill(0);
        triangle(
            trianglePos,                    // top x 
            this.y + triangleSize,          // top y
            trianglePos - triangleSize,     // left x
            this.y + this.height - 0.5,     // left y
            trianglePos + triangleSize,     // right x
            this.y + this.height - 0.5      // right y
        );
    }
}

/*
 * Get the capacity of the scrollbar.
 */
Scrollbar.prototype.getCapacity = function() {
    return this.segments.length;
}

/*
 * Get the current index of the scrollbar.
 */
Scrollbar.prototype.getIndex = function() {
    return this.index;
}

/* 
 * Map the current or given mouse position to an index.
 *
 * NOTE: Be careful playing around with this function. It's set up right now
 *  such that the move from one index to the next will happen pretty close to
 *  halfway between where the indices are displayed on the canvas. Even a 
 *  little tweak that seems sensible, like getting rid of the 'if' statement
 *  and adjusting the mapping to limit the value to 'this.segments.length - 1'
 *  can throw this off.
 *
 * If you can find a better way of doing this, which is at least as efficient,
 *  go for it! :D
 */
Scrollbar.prototype.getIndexFromMouse = function(mx = mouseX) {
    let idx = (int)(map(
        mx,                     // value to map.
        this.x,                 // min value of mx.
        this.x + this.width,    // max value of mx.
        0,                      // min value desired.
        this.segments.length    // max value desired.
    ));
    if (idx >= this.segments.length) idx = this.segments.length - 1;
    return idx;
}

/*
 * Report whether the mouse is positioned over this scrollbar.
 */
Scrollbar.prototype.hasMouseInScrollbar = function(mx = mouseX, my = mouseY) {
    if (mx >= this.x &&
        mx <= (this.x + this.width) &&
        my >= this.y &&
        my <= (this.y + this.height) ) {
        return true;
    }
    return false;
}

/*
 * Move up to the next valid index.
 */
Scrollbar.prototype.incrementIndex = function() {
    let saved = this.index;

    // Increment to the first index referring a different image.
    do { this.index++; } while (
        this.clickables[this.index] === this.clickables[this.index - 1] && 
        this.index < this.clickables.length - 1
    );
    this.index = this.clickables[this.index];

    // Make sure we got a valid index.
    if (this.index >= this.segments.length || !this.segments[this.index]) {
        this.index = saved;
    }

    // Report the result.
    return this.index;
}

/*
 * Create a render of the full scrollbar.
 * Intended to be called when loading has finished.
 */
Scrollbar.prototype.render = function() {
    this.bg.background(this.colour);
    this.bg.stroke(25);
    this.segments.forEach( s => this.renderLine(s.idx, s.line) );
}

/*
 * Render a marker line on the scrollbar.
 */
Scrollbar.prototype.renderLine = function(idx, pos) {
    switch (idx % 10) {
        case 0:
            this.bg.line( pos, 0, pos, 12 );
            break;
        case 5:
            this.bg.line( pos, 0, pos, 8 );
            break;
        default:
            this.bg.line( pos, 0, pos, 5 );
    }
}

/*
 * Render a segment on the scrollbar.
 */
Scrollbar.prototype.renderSegment = function(s) {
    if (!(s instanceof ScrollbarSegment)) throw "Invalid parameter: " + s;

    this.bg.noStroke();
    this.bg.rect(
        s.left,             // x
        0,                  // y
        s.width,            // width
        this.bg.height      // height
    );
    this.bg.stroke(25);
    this.renderLine(s.idx, s.line);
}

/*
 * Reset the scrollbar to the given capacity.
 */
Scrollbar.prototype.resetToCapacity = function(cap = 0) {
    this.segments.fillWithFalse(cap);
    this.clickables.fillWithFalse(cap);

    this.lineGap = this.width / this.segments.length;
    this.size = 0;
    this.index = -1;
    this.isReady = false;
    this.bg.background(this.bgcolour);
}

/*
 * Update the index to the given value.
 */
Scrollbar.prototype.updateIndex = function(idx) {
    ensureInteger(idx);

    // Update the index and keep it within bounds.
    let saved = this.index;
    this.index = idx;
    if (this.index < 0) {
        this.index = 0;
    } else if (this.index >= this.segments.length) {
        this.index = this.segments.length - 1;
    }

    // Make sure index is valid.
    if (!this.segments[this.index]) this.index = saved;

    return this.index;
}

/*
 * Function to be called when this scrollbar is clicked on.
 */
Scrollbar.prototype.updateIndexFromMouse = function(mx = mouseX) {
    if (mx >= this.x && mx <= (this.x + this.width)) {
        let idx = this.getIndexFromMouse(mx);
        if (idx !== this.index) this.updateIndex(this.clickables[idx]);
        return idx;
    }
    return -1;
};

/*
 * Update coordinates and dimensions.
 */
Scrollbar.prototype.updateParameters = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.lineGap = w / this.segments.length;

    let d = window.pixelDensity();
    this.bg.resizeCanvas(w * d, h * d);
    
    // Correct for a p5 bug in resizeCanvas();
    this.bg.width = w * d;
    this.bg.height = h * d;

    // Rerender the scrollbar to its current state.
    if (this.size < this.segments.length || this.segments.length === 0) {
        this.bg.background(155);
        this.segments.forEach( (s) => {
            if (s) {
                s.updateSegment(this.lineGap);
                this.renderSegment(s);
            }
        });
    } else {
        this.render();
    }
}

/*
 * Local class for scrollbar segments.
 */
function ScrollbarSegment(idx, gap) {
    this.idx = idx;
    this.updateSegment(gap);
}

/*
 * Update the values inside the scrollbar segment.
 */
ScrollbarSegment.prototype.updateSegment = function(gap) {
    let partial = gap * 0.1;
    this.left = gap * this.idx - partial;
    this.width = gap + partial * 2;
    this.line = this.left + partial + gap / 2 - 0.5;
}

