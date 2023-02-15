/**
 * Customized scrollbar to replace the default HTML range input slider.
 */

"use strict";

function Scrollbar(width, height, id, parent, total, onInput = () => { }) {

    this.width = width;
    this.height = height;

    this.id = id;
    this.max = max;
    this.currentPos = null;
    this.onInput = onInput;
    this.active = false;

    this.scrollbar = createGraphics(this.width, this.height);
    this.scrollbar.id(id);
    this.scrollbar.class("slider");
    this.scrollbar.parent(parent);
    this.scrollbar.show();

    this.scrollbar.mousePressed(() => { this.active = true; this.updateMousePosition()});
    this.scrollbar.mouseReleased(() => this.active = false);
    this.scrollbar.mouseMoved(() => this.updateMousePosition());
}

Scrollbar.prototype.updateMousePosition = function () {
    if (!this.active) return;
    // console.log("updateMousePosition activated at mouseX: " + mouseX);
    this.currentPos = mouseX - this.getXOffset();
}

Scrollbar.prototype.draw = function () {
    this.scrollbar.background("rgb(34, 154, 34)");

    this.scrollbar.stroke(0);
    this.scrollbar.strokeWeight(4);
    this.scrollbar.line(this.currentPos, 0, this.currentPos, 30);
}

Scrollbar.prototype._drawSegments = function () {
    
}

Scrollbar.prototype.getXOffset = function () {
    return this.scrollbar.elt.getBoundingClientRect().left;
}

Scrollbar.prototype.getYOffset = function () {
    return this.scrollbar.elt.getBoundingClientRect().top;
}