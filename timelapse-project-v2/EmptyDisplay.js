/**
 * Empty display used for adding new plots to the application
 * and displaying loading css.
 */

"use strict";

/**
 * Empty display for selecting datasets to load.
 * @param {p5.Element} parent parent p5.Element for this empty display
 * @param {Array} datasets an array of found datasets from the datasets.txt file
 * @param {Function} onSelected callback function once dataset has been selected
 */
function EmptyDisplay(parent, datasets = [], onSelected = () => { }) {

    this.div = createDiv();
    this.div.class("emptyDisplay");
    this.div.parent(parent);

    this.content = createDiv();
    this.content.class("input");
    this.content.parent(this.div);

    this.select = createSelect();
    this.select.class("");
    this.select.option('---');
    datasets.forEach(dataset => this.select.option(dataset));
    this.select.parent(this.content);

    this.button = createButton("Load");
    this.button.mousePressed(() => (onSelected(this.select.value())));
    this.button.parent(this.content);
}

/**
 * Sets the empty displays load state to true or false.
 * This essentially toggles the content divs "loading" class.
 * @param {boolean} isLoading boolean value that is used to set the displays load state.
 */
EmptyDisplay.prototype.setLoadState = function (isLoading) {
    if (isLoading) {
        this.content.addClass("loading");
    } else {
        this.content.removeClass("loading");
    }
}

/**
 * Sets the empty displays error state to true or false.
 * This essentially toggles the select elements "error" class.
 * @param {boolean} isErroring boolean value that is used to set the display error state.
 */
EmptyDisplay.prototype.setErrorState = function (isErroring) {
    if (isErroring) {
        this.select.addClass("error");
    } else {
        this.select.removeClass("error");
    }
}