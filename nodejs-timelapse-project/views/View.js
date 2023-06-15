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
        renderDisplaySkeleton(display, this.imodel.selection === display);

        if (display instanceof Overlay) {
            let secondaryIndex = Math.floor(display.secondaryIndex); /* Floor index in case index has been affected by ratio */
            image(
                display.secondaryImages[secondaryIndex].get(),
                display.x + display.padding,
                display.y + display.padding,
                display.width,
                display.height
            );
            tint(255, parseInt(display.opacity));
        }

        let index = Math.floor(display.index); /* Floor index in case index has been affected by ratio */
        const left = display.x + display.padding;
        const right = display.x + display.padding + display.width;
        const top = display.y + display.padding;
        const bottom = display.y + display.padding + display.height;
        let translatedX = display.viewportX < left ? left - display.viewportX : 0;
        let translatedY = display.viewportY < top ? top - display.viewportY : 0;
        let imageX = display.viewportX < left ? left : display.viewportX;
        let imageY = display.viewportY < top ? top : display.viewportY;
        let imageWidth = display.viewportWidth + imageX > right ? right - imageX : display.viewportWidth;
        let imageHeight = display.viewportHeight + imageY > bottom ? bottom - imageY : display.viewportHeight;

        let widthRatio = display.images[index].width / display.viewportWidth;
        let heightRatio = display.images[index].height / display.viewportHeight;

        let img = display.images[index].get(
            translatedX * widthRatio,
            translatedY * heightRatio,
            imageWidth * widthRatio,
            imageHeight * heightRatio
        );
        image(img, imageX, imageY, imageWidth, imageHeight);

        /* Timestamp */
        noTint();
        stroke("rgb(0, 0, 0)");
        fill("rgb(255, 255, 255)");
        textSize(16);
        if (index > display.timestamps.length - 1) {
            text(
                display.frames[index],
                display.x + display.padding + 5,
                display.y + display.padding + 16
            );
        } else {
            text(
                display.timestamps[index],
                display.x + display.padding + 5,
                display.y + display.padding + 16
            );
        }

        /* Scrollbar */
        let scrollbarLeft = display.getScrollbarLeft();
        let scrollbarTop = display.getScrollbarTop();
        let trianglePos = display.getMainPosition();
        let startPos = display.getStartPosition();
        let endPos = display.getEndPosition();
        noStroke();
        if (display.locked) {
            fill("rgb(128, 128, 128)");
        } else {
            fill("rgb(34, 154, 34)");
        }
        rect(
            scrollbarLeft,
            scrollbarTop,
            display.width,
            display.scrollbarHeight
        );
        fill("rgb(255, 255, 255)");
        rect(
            scrollbarLeft,
            scrollbarTop,
            startPos - scrollbarLeft,
            display.scrollbarHeight
        );
        rect(
            endPos,
            scrollbarTop,
            scrollbarLeft + display.width - endPos,
            display.scrollbarHeight
        );

        /* Scrollbar Segments */
        fill("rgb(0, 0, 0)");
        stroke("rgb(25, 25, 25)");
        for (let idx = 0; idx < display.getSize(); idx++) {
            let pos = display.getPositionOfIndex(idx);
            renderSegment(idx, scrollbarTop, pos);
        }

        /* Display Annotations */
        stroke("rgb(255, 255, 0)");
        display.annotations.forEach(annotation => {
            if (this.imodel.highlightedAnnotation === annotation) {
                strokeWeight(3);
            }
            let pos = display.getPositionOfIndex(annotation.index);
            line(pos, scrollbarTop, pos, scrollbarTop + display.scrollbarHeight);
            strokeWeight(1);
        });

        /* Display Config Benchmarks */
        this.model.configs.forEach((config, index) => {
            let match = config.displays.find(d => d.id === display.id);
            if (match) {
                let colourTint = 32 * index;
                let colour = `rgb(${colourTint}, ${colourTint}, ${colourTint})`;
                let pos = display.getPositionOfIndex(match.index);
                renderBenchmark(scrollbarTop, pos, colour, this.imodel.highlightedConfig === config);
            }
        });

        /* Scrollbar start position arrow */
        fill("rgb(255, 255, 255)");
        stroke("rgb(25, 25, 25)");
        triangle(
            startPos,
            scrollbarTop + 5,
            startPos - 5,
            scrollbarTop + display.scrollbarHeight - 0.5,
            startPos + 5,
            scrollbarTop + display.scrollbarHeight - 0.5
        );

        /* Scrollbar end position arrow */
        triangle(
            endPos,
            scrollbarTop + 5,
            endPos - 5,
            scrollbarTop + display.scrollbarHeight - 0.5,
            endPos + 5,
            scrollbarTop + display.scrollbarHeight - 0.5
        );

        /* Scrollbar main position arrow */
        fill("rgb(0, 0, 0)");
        triangle(
            trianglePos,
            scrollbarTop + 5,
            trianglePos - 5,
            scrollbarTop + display.scrollbarHeight - 0.5,
            trianglePos + 5,
            scrollbarTop + display.scrollbarHeight - 0.5
        );
    });

    /* Global Scrollbar */
    let scrollbar = this.model.globalScrollbar;
    if (scrollbar instanceof GlobalScrollbar) {
        let scrollbarLeft = scrollbar.getScrollbarLeft();
        let scrollbarTop = scrollbar.getScrollbarTop();
        let trianglePos = scrollbar.getMainPosition();
        noStroke();
        fill("rgb(190, 190, 190)");
        rect(
            scrollbar.x,
            scrollbar.y,
            scrollbar.width + scrollbar.padding * 2,
            scrollbar.height + scrollbar.padding * 2
        );

        fill("rgb(34, 154, 34)");
        rect(
            scrollbarLeft,
            scrollbarTop,
            scrollbar.width,
            scrollbar.height
        );

        /* Global Scrollbar Segments */
        fill(0);
        stroke("rgb(25, 25, 25)");
        for (let idx = 0; idx < scrollbar.getSize(); idx++) {
            let top = scrollbarTop;
            let pos = scrollbar.getPositionOfIndex(idx);
            renderSegment(idx, top, pos);
        }

        /* Global Scrollbar Config Benchmark */
        this.model.configs.forEach((config, index) => {
            let colourTint = 32 * index;
            let colour = `rgb(${colourTint}, ${colourTint}, ${colourTint})`;
            let pos = scrollbar.getPositionOfIndex(config.globalScrollbar.index);
            renderBenchmark(scrollbarTop, pos, colour, this.imodel.highlightedConfig === config);
        });

        /* Global Scrollbar main position arrow */
        fill("rgb(0, 0, 0)");
        stroke("rgb(25, 25, 25)");
        triangle(
            trianglePos,
            scrollbarTop + 5,
            trianglePos - 5,
            scrollbarTop + scrollbar.height - 0.5,
            trianglePos + 5,
            scrollbarTop + scrollbar.height - 0.5
        )
    }

    /* Dragging ghost */
    let ghost = this.imodel.ghost;
    if (ghost instanceof Display || ghost instanceof Overlay) {
        let ghostX = mouseX - (ghost.width + ghost.padding * 2) / 2;
        let ghostY = mouseY - (ghost.height + ghost.padding * 2 + ghost.scrollbarHeight) / 2;
        renderDisplaySkeleton(ghost, false, 0.5, ghostX, ghostY);
    }
}

View.prototype.modelChanged = function () {
    this.draw();
}

/**
 * Draw a line (size depends on index)
 * @param {number} idx index of the line
 * @param {number} top y coordinate of the top of the object being draw on
 * @param {number} pos x coordinate of the line
 */
function renderSegment(idx, top, pos) {
    switch (idx % 50) {
        case 0:
            line(pos, top, pos, top + 16);
            break;
        case 25:
            line(pos, top, pos, top + 12);
            break;
        case 12:
        case 18:
            line(pos, top, pos, top + 8);
            break;
        case 6:
        case 18:
        case 32:
        case 44:
            line(pos, top, pos, top + 5);
            break;
        default:
            line(pos, top, pos, top + 1);
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
function renderDisplaySkeleton(display, selected, opt_opacity=1.0, opt_x, opt_y) {
    const x = opt_x || display.x;
    const y = opt_y || display.y;
    if (selected) {
        stroke(`rgba(52, 219, 85, ${opt_opacity})`);
        strokeWeight(2);
    } else {
        noStroke();
    }
    fill(`rgba(190, 190, 190, ${opt_opacity})`);
    rect(x, y, display.width + display.padding * 2, display.height + display.padding * 2 + display.scrollbarHeight, 10);
    noStroke();
    strokeWeight(1);
    fill(`rgba(0, 0, 0, ${opt_opacity})`);
    rect(x + display.padding, y + display.padding, display.width, display.height);
    if (display.locked) {
        fill(`rgba(128, 128, 128, ${opt_opacity})`);
    } else {
        fill(`rgba(34, 154, 34, ${opt_opacity})`);
    }
    rect(x + display.padding, y + display.padding + display.height, display.width, display.scrollbarHeight);
}