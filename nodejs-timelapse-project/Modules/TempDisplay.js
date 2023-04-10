/**
 * Temporary display to display while the images of a new display load.
 */

"use strict";

/**
 * Temporary display for selecting datasets to load.
 * @param {p5.Element} parent parent p5.Element for this temporary display
 * @param {number} width width of the temporary display container
 * @param {number} height height of the temporary display container
 */
function TempDisplay(parent, width, height) {

    this.div = createDiv();
    this.div.class("emptyDisplay");
    this.div.parent(parent);

    this.div.style("width", width);
    this.div.style("height", height);

    this.content = createDiv();
    this.content.class("loading");
    this.content.parent(this.div);
}

/**
 * Remove the temporary disply from the DOM.
 */
TempDisplay.prototype.remove = function () {
    this.div.remove();
}