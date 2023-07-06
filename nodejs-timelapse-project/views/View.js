/* Application Canvas View */
"use strict";
function View() {

}

View.prototype.setModel = function (model) {
    this.model = model;
}

View.prototype.setInteractionModel = function (imodel) {
    this.imodel = imodel;
}

View.prototype.draw = function () {
    clear();

    this.model.displays.forEach(display => {
        if (display === null) return;
        renderDisplaySkeleton(display, this.imodel.selection === display);

        tint(255, parseInt(display.opacity));
        let index = Math.floor(display.getIndex(0)); /* Floor index in case index has been affected by ratio */
        if (display instanceof Overlay) {
            /* With cycling, scrollbar index and layer index may not match. */
            /* Another reason to have just layers instead of object attributes. */
            let layer = display.layers[0];
            index = Math.floor(display.getIndex(layer.scrollbarIndex));
        }
        const left = display.x + display.padding;
        const right = display.x + display.padding + display.width;
        const top = display.y + display.padding;
        const bottom = display.y + display.padding + display.height;

        renderImage(display.images[index], left, right, top, bottom, {
            x: display.viewportX,
            y: display.viewportY,
            width: display.viewportWidth,
            height: display.viewportHeight,
        });

        if (display instanceof Overlay) {
            for (let i = 1; i < display.layers.length; i++) {
                let layer = display.layers[i];
                tint(255, parseInt(layer.opacity));
                index = Math.floor(display.getIndex(layer.scrollbarIndex));
                renderImage(layer.images[index], left, right, top, bottom, {
                    x: layer.viewportX,
                    y: layer.viewportY,
                    width: layer.viewportWidth,
                    height: layer.viewportHeight,
                });
            }
        }

        /* Timestamp */
        noTint();
        stroke("rgb(0, 0, 0)");
        fill("rgb(255, 255, 255)");
        const txtSize = 24 * display.width / this.model.cellWidth;
        textSize(txtSize);
        if (index > display.timestamps.length - 1) {
            text(
                display.frames[index],
                display.x + display.padding + 5,
                display.y + display.padding + txtSize
            );
        } else {
            text(
                display.timestamps[index],
                display.x + display.padding + 5,
                display.y + display.padding + 16
            );
        }

        /* Scrollbars */
        display.scrollbars.forEach(scrollbar => {
            let trianglePos = scrollbar.getMainPosition();
            let startPos = scrollbar.getStartPosition();
            let endPos = scrollbar.getEndPosition();
            stroke("rgb(0, 0, 0)");
            if (display.locked) {
                fill("rgb(128, 128, 128)");
            } else if (this.imodel.focused === scrollbar) {
                fill("rgb(34, 200, 34)");
            } else {
                fill("rgb(34, 154, 34)");
            }
            rect(
                scrollbar.x,
                scrollbar.y,
                scrollbar.width,
                scrollbar.height
            );
            noStroke();
            fill("rgb(255, 255, 255)");
            if (startPos >= 0 && endPos >= 0) {
                rect(
                    scrollbar.x,
                    scrollbar.y,
                    startPos - scrollbar.x,
                    scrollbar.height
                );
                rect(
                    endPos,
                    scrollbar.y,
                    scrollbar.x + scrollbar.width - endPos,
                    scrollbar.height
                );
            }

            /* Scrollbar Segments */
            fill("rgb(0, 0, 0)");
            stroke("rgb(25, 25, 25)");
            for (let idx = 0; idx < scrollbar.getSize(); idx++) {
                let pos = scrollbar.getPositionOfIndex(idx);
                renderSegment(idx, scrollbar.y, pos, scrollbar.getLineGap());
            }

            /* Scrollbar Annotations */
            colorMode(HSL, 360, 100, 100);
            scrollbar.annotations.forEach(annotation => {
                stroke(annotation.colour);
                if (this.imodel.highlightedAnnotation?.id === annotation.id) {
                    strokeWeight(3);
                }
                let pos = scrollbar.getPositionOfIndex(annotation.index);
                line(pos, scrollbar.y, pos, scrollbar.y + scrollbar.height);
                strokeWeight(1);
            });
            colorMode(RGB, 255);

            /* Display Snapshot Benchmarks */
            this.model.snapshots.forEach((snapshot, index) => {
                let snapshotIndex = this.model.findSnapshotIndex(scrollbar.id, snapshot);
                if (snapshotIndex >= 0) {
                    let colourTint = 32 * index;
                    let colour = `rgb(${colourTint}, ${colourTint}, ${colourTint})`;
                    let pos = scrollbar.getPositionOfIndex(snapshotIndex);
                    renderBenchmark(scrollbar.y, pos, colour, this.imodel.highlightedSnapshot === snapshot);
                }
            });

            fill("rgb(255, 255, 255)");
            stroke("rgb(25, 25, 25)");
            if (startPos >= 0 && endPos >= 0) {
                /* Scrollbar start position arrow */
                triangle(
                    startPos,
                    scrollbar.y + 5,
                    startPos - 5,
                    scrollbar.y + scrollbar.height - 0.5,
                    startPos + 5,
                    scrollbar.y + scrollbar.height - 0.5
                );

                /* Scrollbar end position arrow */
                triangle(
                    endPos,
                    scrollbar.y + 5,
                    endPos - 5,
                    scrollbar.y + scrollbar.height - 0.5,
                    endPos + 5,
                    scrollbar.y + scrollbar.height - 0.5
                );
            }

            /* Scrollbar main position arrow */
            fill("rgb(0, 0, 0)");
            triangle(
                trianglePos,
                scrollbar.y + 5,
                trianglePos - 5,
                scrollbar.y + scrollbar.height - 0.5,
                trianglePos + 5,
                scrollbar.y + scrollbar.height - 0.5
            );
        });
    });

    /* Dragging ghost */
    let ghost = this.imodel.ghost;
    if (ghost instanceof Display || ghost instanceof Overlay) {
        /* Display grid lines */
        const padding = this.model.displayPadding;
        stroke("rgb(0, 0, 0)");
        for (let row = 0; row <= this.model.rows; row++) {
            line(padding, row * this.model.cellHeight + padding, this.model.cellWidth * this.model.columns + padding, row * this.model.cellHeight + padding);
        }
        for (let column = 0; column <= this.model.columns; column++) {
            line(column * this.model.cellWidth + padding, padding, column * this.model.cellWidth + padding, this.model.cellHeight * this.model.rows + padding);
        }
        let ghostX = mouseX - (ghost.width + ghost.padding * 2) / 2;
        let ghostY = mouseY - (ghost.height + ghost.padding * 2 + ghost.scrollbarHeight) / 2;
        renderDisplaySkeleton(ghost, false, 0.5, ghostX, ghostY);
    }

    /* Global Scrollbar */
    let scrollbar = this.model.globalScrollbar;
    if (scrollbar instanceof Scrollbar) {
        let trianglePos = scrollbar.getMainPosition();
        if (this.imodel.focused === scrollbar) {
            fill("rgb(34, 200, 34)");
        } else {
            fill("rgb(34, 154, 34)");
        }
        stroke("rgb(0, 0, 0)");
        rect(
            scrollbar.x,
            scrollbar.y,
            scrollbar.width,
            scrollbar.height
        );
        noStroke();

        /* Global Scrollbar Segments */
        fill(0);
        stroke("rgb(25, 25, 25)");
        for (let idx = 0; idx < scrollbar.getSize(); idx++) {
            let pos = scrollbar.getPositionOfIndex(idx);
            renderSegment(idx, scrollbar.y, pos, scrollbar.getLineGap());
        }

        /* Global Scrollbar Snapshot Benchmark */
        this.model.snapshots.forEach((snapshot, index) => {
            let colourTint = 32 * index;
            let colour = `rgb(${colourTint}, ${colourTint}, ${colourTint})`;
            let pos = scrollbar.getPositionOfIndex(snapshot.globalScrollbar.index);
            renderBenchmark(scrollbar.y, pos, colour, this.imodel.highlightedSnapshot === snapshot);
        });

        /* Global Scrollbar main position arrow */
        fill("rgb(0, 0, 0)");
        stroke("rgb(25, 25, 25)");
        triangle(
            trianglePos,
            scrollbar.y + 5,
            trianglePos - 5,
            scrollbar.y + scrollbar.height - 0.5,
            trianglePos + 5,
            scrollbar.y + scrollbar.height - 0.5
        )
    }
}

View.prototype.modelChanged = function () {
    this.draw();
}

/**
 * Render an image with viewport translations.
 * @param {p5.Image} img Image to render
 * @param {number} left x coordinate of the leftmost position in the display
 * @param {number} right x coordinate of the rightmost position in the display
 * @param {number} top y coordinate of the topmost position in the display
 * @param {number} bottom y coordinate of the bottommost position in the display
 * @param {Object} viewport viewport coordinates and dimensions
 */
function renderImage(img, left, right, top, bottom, viewport) {
    const translatedX = viewport.x < left ? left - viewport.x : 0;
    const translatedY = viewport.y < top ? top - viewport.y : 0;
    const x = viewport.x < left ? left : viewport.x;
    const y = viewport.y < top ? top : viewport.y;
    const width = viewport.width + x > right ? right - x : viewport.width;
    const height = viewport.height + y > bottom ? bottom - y : viewport.height;

    const widthRatio = img.width / viewport.width;
    const heightRatio = img.height / viewport.height;

    const translatedImg = img.get(
        translatedX * widthRatio,
        translatedY * heightRatio,
        width * widthRatio,
        height * heightRatio,
    );
    image(translatedImg, x, y, width, height);
}

/**
 * Draw a line (size depends on index)
 * @param {number} idx index of the line
 * @param {number} top y coordinate of the top of the object being draw on
 * @param {number} pos x coordinate of the line
 * @param {number} lineGap length of the gap between each segment
 */
function renderSegment(idx, top, pos, lineGap) {
    const controlNum = 50;
    switch (idx % controlNum) {
        case 0:
            line(pos, top, pos, top + 16);
            break;
        case Math.floor(controlNum * 1 / 2):
            line(pos, top, pos, top + 12);
            break;
        case Math.floor(controlNum * 1 / 4):
        case Math.floor(controlNum * 3 / 4):
            line(pos, top, pos, top + 8);
            break;
        case Math.floor(controlNum * 1 / 8):
        case Math.floor(controlNum * 3 / 8):
        case Math.floor(controlNum * 5 / 8):
        case Math.floor(controlNum * 7 / 8):
            line(pos, top, pos, top + 5);
            break;
        default:
            if (lineGap > 3) {
                line(pos, top, pos, top + 3);
            }
            break;
    }
}

/**
 * Draw a benchmark with a given colour
 * @param {number} top y coordinate of the top of the object being drawn on
 * @param {number} pos x coordinate of the benchmark
 * @param {string} colour colour of the benchmark
 * @param {boolean} highlighted whether or not to highlight the benchmark
 */
function renderBenchmark(top, pos, colour, highlighted) {
    fill(colour);
    if (highlighted) {
        stroke("rgb(255, 204, 0)");
    } else {
        stroke("rgb(25, 25, 25)");
    }
    circle(pos, top + 4, 8);
}

/**
 * Render the skeleton of a display (grey container, black image background, green scrollbar background)
 * @param {Display|Overlay} display display being rendered
 * @param {boolean} selected whether the display is selected or not
 * @param {number=} opt_opacity optional opacity parameter
 * @param {number|undefined} opt_x optional alternative x coordinate for the display skeleton
 * @param {number|undefined} opt_y optional alternative y coordinate for the display skeleton
 */
function renderDisplaySkeleton(display, selected, opt_opacity = 1.0, opt_x, opt_y) {
    const x = opt_x || display.x;
    const y = opt_y || display.y;
    /* Draw grey container */
    if (selected) {
        stroke(`rgba(52, 219, 85, ${opt_opacity})`);
        strokeWeight(2);
    } else {
        noStroke();
    }
    fill(`rgba(190, 190, 190, ${opt_opacity})`);
    rect(x, y, display.width + display.padding * 2, display.height + display.padding * 2 + display.scrollbarHeight * display.scrollbars.length, 10);
    noStroke();
    strokeWeight(1);
    /* Draw black image background */
    fill(`rgba(0, 0, 0, ${opt_opacity})`);
    rect(x + display.padding, y + display.padding, display.width, display.height);
    /* Draw scrollbar backgrounds */
    if (display.locked) {
        fill(`rgba(128, 128, 128, ${opt_opacity})`);
    } else {
        fill(`rgba(34, 154, 34, ${opt_opacity})`);
    }
    stroke(`rgba(0, 0, 0, ${opt_opacity})`);
    display.scrollbars.forEach((scrollbar, index) => {
        rect(x + display.padding, y + display.padding + display.height + scrollbar.height * index, scrollbar.width, scrollbar.height);
    });
    noStroke();
}