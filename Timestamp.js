// Turn on strict mode:
"use strict";

/*
 * Class for displaying timestamps.
 *
 * ARGS:
 * - x      ::  x coordinate of upper-left corner of timestamp box.
 * - y      ::  y coordinate of upper-left corner of timestamp box.
 */
function Timestamp(x = 310, y = 0) {
    this.x = x;             
    this.y = y;
    this.stamp = '';
    this.wipeBG = false;
}

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Clear the stamp, so that nothing will display.
 */
Timestamp.prototype.clearStamp = function() {
    this.stamp = '';
}

/*
 * Draw the timestamp.
 */
Timestamp.prototype.draw = function() {
    if (this.wipeBG) {
        fill(180,200,220);
        rectMode(CORNER);
        noStroke();
        rect(this.x - 300, this.y, 310, 30);
    }
    fill(0);
    textAlign(RIGHT);
    textSize(18);
    strokeWeight(3);
    stroke(255, 200);
    text(this.stamp, this.x, this.y + 22);
}

/*
 * Tell the timestamps not to wipe the background behind it.
 */
Timestamp.prototype.setDoNotWipeBackground = function() {
    this.wipeBG = false;
}

/*
 * Update the timestamp.
 */
Timestamp.prototype.setStamp = function(stamp) {
    this.stamp = stamp;
}

/*
 * Tell the timestamps to wipe the background behind it.
 */
Timestamp.prototype.setWipeBackground = function() {
    this.wipeBG = true;
}

/*
 * Update the position at which the timestamp will display.
 */
Timestamp.prototype.updatePosition = function(x, y) {
    ensureNumber(x);
    ensureNumber(y);
    this.x = x;
    this.y = y;
}

