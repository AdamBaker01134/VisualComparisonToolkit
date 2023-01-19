"use strict";

function TimelapseDisplay(name, id, frames, timestamps, images, parent, width, height) {
    this.name = name;
    this.id = id;
    this.frames = frames;
    this.timestamps = timestamps;
    this.images = images;

    this.width = width;
    this.height = height;

    this.imgIdx = 0;

    this.displayDiv = createDiv();
    this.displayDiv.class("display");
    this.displayDiv.parent(parent);

    this.imageWindow = createGraphics(this.width, this.height);
    this.imageWindow.parent(this.displayDiv);
    this.imageWindow.show();

    this.slider = createInput("", "range");
    this.slider.value(this.imgIdx);
    this.slider.class("slider");
    // this.slider.elt.value = 0;
    this.slider.elt.onchange = (e) => {
        this.imgIdx = parseInt(e.target.value);
        console.log(this.imgIdx);
    };
    this.slider.elt.max = this.images.length - 1;
    this.slider.parent(this.displayDiv);
}

/** Getter function for the object's name attribute. */
TimelapseDisplay.prototype.getName = function () {
    return this.name;
}

/** Getter function for the object's id attribute. */
TimelapseDisplay.prototype.getId = function () {
    return this.id;
}

TimelapseDisplay.prototype.draw = function () {
    noStroke();
    rectMode(CORNER);
    fill(255);
    rect(0, 0, this.width, this.height);

    /* Draw imageWindow */
    this.imageWindow.noStroke();
    this.imageWindow.fill(255);
    this.imageWindow.image(this.images[this.imgIdx], 0, 0, this.width, this.height);
}