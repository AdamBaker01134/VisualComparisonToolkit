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
    strokeWeight(1);

    let unpaddedX = 0;
    let unpaddedY = 0;

    this.model.displays.forEach((display, position) => {
        if (display === null) return;

        let left = display.x + display.padding;
        let right = display.x + display.padding + display.width;
        let top = display.y + display.padding;
        let bottom = display.y + display.padding + display.height;

        if (this.model.unpadded) {
            left = unpaddedX;
            right = unpaddedX + display.width;
            top = unpaddedY;
            bottom = unpaddedY + display.height;
            /* Draw black image background */
            noStroke();
            fill("rgb(0, 0, 0)");
            rect(left, top, right - left, bottom - top);
        } else {
            renderDisplaySkeleton(display, this.imodel.selection === display);
        }

        let index = 0;
        if (display instanceof Overlay && (display.mode === "vertical" || display.mode === "horizontal" || display.mode === "magic_lens")) {
            /* Render the two overlay images with a comparison slider and dotted line in the middle */
            const layer1 = display.layers[0];
            const layer2 = display.layers[1];
            /* Floor indices in case they have been affected by ratio */
            const img1 = layer1.images[Math.floor(display.getIndex(layer1.scrollbarIndex))];
            const img2 = layer2.images[Math.floor(display.getIndex(layer2.scrollbarIndex))];
            /* Convert viewports if unpadded */
            const viewport1 = !this.model.unpadded ? layer1.viewport : {
                x: left - (display.x + display.padding - layer1.viewport.x),
                y: top - (display.y + display.padding - layer1.viewport.y),
                width: layer1.viewport.width,
                height: layer1.viewport.height,
            };
            const viewport2 = !this.model.unpadded ? layer2.viewport : {
                x: left - (display.x + display.padding - layer2.viewport.x),
                y: top - (display.y + display.padding - layer2.viewport.y),
                width: layer2.viewport.width,
                height: layer2.viewport.height,
            };
            if (display.mode === "vertical") {
                const sliderPosition = left + display.width * display.comparisonSliderValue;
                tint(255, parseInt(layer1.opacity));
                renderImage(img1, left, right, top, bottom, viewport1);
                tint(255, parseInt(layer2.opacity));
                renderImage(img2, sliderPosition, right, top, bottom, viewport2);
                noTint();
                fill("rgba(70, 130, 180, 0.8)");
                stroke("rgb(70, 130, 180)");
                line(sliderPosition, top, sliderPosition, bottom);
                circle(sliderPosition, top + display.height / 2, 32);
            } else if (display.mode === "horizontal") {
                const sliderPosition = top + display.height * display.comparisonSliderValue;
                tint(255, parseInt(layer1.opacity));
                renderImage(img1, left, right, top, bottom, viewport1);
                tint(255, parseInt(layer2.opacity));
                renderImage(img2, left, right, sliderPosition, bottom, viewport2);
                noTint();
                fill("rgba(70, 130, 180, 0.8)");
                stroke("rgb(70, 130, 180)");
                line(left, sliderPosition, right, sliderPosition);
                circle(left + display.width / 2, sliderPosition, 32);
            } else {
                const magicLens = !model.unpadded ? display.magicLens : {
                    x: left - (display.x + display.padding - display.magicLens.x),
                    y: top - (display.y + display.padding - display.magicLens.y),
                    width: display.magicLens.width,
                    height: display.magicLens.height,
                };
                tint(255, parseInt(layer1.opacity));
                renderImage(img1, left, right, top, bottom, viewport1);
                tint(255, parseInt(layer2.opacity));
                renderImage(img2, left, right, top, bottom, viewport2);
                noTint();
                /* Draw magic lens window */
                fill("rgb(0 ,0 ,0)");
                noStroke();
                rect(magicLens.x - magicLens.width / 2,
                    magicLens.y - magicLens.height / 2,
                    magicLens.width,
                    magicLens.height);
                renderImage(img1,
                    magicLens.x - magicLens.width / 2,
                    magicLens.x + magicLens.width / 2,
                    magicLens.y - magicLens.height / 2,
                    magicLens.y + magicLens.height / 2,
                    viewport1);
                noFill();
                stroke("rgb(70, 130, 180)");
                strokeWeight(3);
                rect(magicLens.x - magicLens.width / 2,
                    magicLens.y - magicLens.height / 2,
                    magicLens.width,
                    magicLens.height);
                strokeWeight(1);
            }
        } else {
            for (let i = 0; i < display.layers.length; i++) {
                const layer = display.layers[i];
                const viewport = !this.model.unpadded ? layer.viewport : {
                    x: left - (display.x + display.padding - layer.viewport.x),
                    y: top - (display.y + display.padding - layer.viewport.y),
                    width: layer.viewport.width,
                    height: layer.viewport.height,
                };
                tint(255, parseInt(layer.opacity));
                index = Math.floor(display.getIndex(layer.scrollbarIndex)); /* Floor index in case index has been affected by ratio */
                renderImage(layer.images[index], left, right, top, bottom, viewport);
            }
        }

        /* Timestamp */
        noTint();
        if (model.showTimestamps) {
            stroke("rgb(0, 0, 0)");
            fill("rgb(255, 255, 255)");
            const minWidth = 24;
            textSize(minWidth);
            const timestamps = display.getLayerTimestamps(display.layers.length - 1);
            const txt = index > timestamps.length - 1 ? display.getLayerFrames(display.layers.length - 1)[index] : timestamps[index];
            const txtWidth = textWidth(txt);
            let txtSize = minWidth * (display.width - display.padding * 2) / txtWidth;
            if (txtSize > minWidth) {
                txtSize = minWidth;
            }
            textSize(txtSize);
            text(txt, left + 5, top + txtSize);
        }

        /* Shadow markers */
        this.imodel.shadowMarkers.forEach(shadowMarker => {
            stroke("rgb(0, 0, 0)");
            strokeWeight(3);
            noFill();
            const markerX = left + display.width * shadowMarker.widthRatio;
            const markerY = top + display.height * shadowMarker.heightRatio;
            let maxLength = 24;
            let markerLength = Math.min(display.width, display.height) / 12;
            if (shadowMarker.shape !== "crosshair") {
                maxLength = 16;
                markerLength = Math.min(display.width, display.height) / 16;
            }
            if (markerLength > maxLength) markerLength = maxLength;
            switch (shadowMarker.shape) {
                case "crosshair":
                    line (markerX, markerY - markerLength / 2, markerX, markerY + markerLength / 2);
                    line (markerX + markerLength / 2, markerY, markerX - markerLength / 2, markerY);
                    stroke("rgb(255, 255, 255)");
                    strokeWeight(1);
                    line (markerX, markerY - markerLength / 2, markerX, markerY + markerLength / 2);
                    line (markerX + markerLength / 2, markerY, markerX - markerLength / 2, markerY);
                    break;
                case "cross":
                    line (markerX - markerLength / 2, markerY - markerLength / 2, markerX + markerLength / 2, markerY + markerLength / 2);
                    line (markerX + markerLength / 2, markerY - markerLength / 2, markerX - markerLength / 2, markerY + markerLength / 2);
                    stroke("rgb(255, 255, 255)");
                    strokeWeight(1);
                    line (markerX - markerLength / 2, markerY - markerLength / 2, markerX + markerLength / 2, markerY + markerLength / 2);
                    line (markerX + markerLength / 2, markerY - markerLength / 2, markerX - markerLength / 2, markerY + markerLength / 2);
                    break;
                case "dot":
                    ellipse(markerX, markerY, markerLength, markerLength);
                    stroke("rgb(255, 255, 255)");
                    strokeWeight(1);
                    ellipse(markerX, markerY, markerLength, markerLength);
                    break;
                case "square":
                    square(markerX - markerLength / 2, markerY - markerLength / 2, markerLength);
                    stroke("rgb(255, 255, 255)");
                    strokeWeight(1);
                    square(markerX - markerLength / 2, markerY - markerLength / 2, markerLength);
                    break;
                case "triangle":
                    triangle(markerX - markerLength / 2, markerY + markerLength / 2, markerX, markerY - markerLength / 2, markerX + markerLength / 2, markerY + markerLength / 2);
                    stroke("rgb(255, 255, 255)");
                    strokeWeight(1);
                    triangle(markerX - markerLength / 2, markerY + markerLength / 2, markerX, markerY - markerLength / 2, markerX + markerLength / 2, markerY + markerLength / 2);
                    break;
                case "freeform":
                    stroke("rgb(255, 0, 0)");
                    strokeWeight(2);
                    for (let i = 0; i < shadowMarker.path.length - 1; i++) {
                        const x1 = left + display.width * shadowMarker.path[i].widthRatio;
                        const y1 = top + display.height * shadowMarker.path[i].heightRatio;
                        const x2 = left + display.width * shadowMarker.path[i + 1].widthRatio;
                        const y2 = top + display.height * shadowMarker.path[i + 1].heightRatio;
                        line(x1, y1, x2, y2);
                    }
            }
        });

        /* Freeform path */
        stroke("rgb(255, 0, 0)");
        strokeWeight(2);
        for (let i = 0; i < this.imodel.freeformPath.length - 1; i++) {
            const x1 = left + display.width * this.imodel.freeformPath[i].widthRatio;
            const y1 = top + display.height * this.imodel.freeformPath[i].heightRatio;
            const x2 = left + display.width * this.imodel.freeformPath[i + 1].widthRatio;
            const y2 = top + display.height * this.imodel.freeformPath[i + 1].heightRatio;
            line(x1, y1, x2, y2);
        }
        strokeWeight(1);

        if (this.model.unpadded) {
            unpaddedX += display.width;
            if ((position + 1) % this.model.columns === 0) {
                unpaddedX = 0;
                unpaddedY += display.height;
            }
            return;
        }

        /* Coincident points */
        this.imodel.coincidentPoints.forEach((point, pointIndex) => {
            if (pointIndex % 2 === 0 && pointIndex === this.imodel.coincidentPoints.length - 1) stroke("rgb(255, 0, 0)");
            else stroke("rgb(0, 0, 255)");
            fill("rgb(255, 255, 255)");
            ellipse(point.x, point.y, 10, 10);
            textSize(8);
            text(Math.floor(pointIndex / 2), point.x - 2, point.y + 3);
        });

        /* Scrollbars */
        display.scrollbars.forEach((scrollbar, scrollbarPosition) => {
            let trianglePos = scrollbar.getMainPosition();
            let startPos = scrollbar.getStartPosition();
            let endPos = scrollbar.getEndPosition();
            if (this.imodel.highlightedScrollbars.includes(scrollbar)) stroke("rgb(255, 204, 0)");
            else stroke("rgb(0, 0, 0)");
            if (display.locked) {
                fill("rgb(128, 128, 128)");
            } else if (this.imodel.focused === scrollbar && this.imodel.measuredTime === null) {
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
            if (this.imodel.measuredTime !== null && this.imodel.focused === scrollbar) {
                const measuredStart = Math.min(this.imodel.measuredTime.start, this.imodel.measuredTime.end);
                const measuredEnd = Math.max(this.imodel.measuredTime.start, this.imodel.measuredTime.end);
                const measuredStartPos = scrollbar.getPositionOfIndex(measuredStart);
                const measuredEndPos = scrollbar.getPositionOfIndex(measuredEnd);
                fill("rgb(34, 200, 34)");
                rect(
                    measuredStartPos,
                    scrollbar.y,
                    measuredEndPos - measuredStartPos,
                    scrollbar.height,
                );
                const frames = measuredEnd - measuredStart;
                const time = (frames / 30).toFixed(3);
                let label = `${time}s`;
                const timestamps = display.getLayerTimestamps(display.getScrollbarLayerIndex(scrollbarPosition));
                if (measuredStart >= 0 && measuredEnd < timestamps.length) {
                    const startDate = Date.parse(timestamps[measuredStart]);
                    const endDate = Date.parse(timestamps[measuredEnd]);
                    const difference = endDate - startDate;
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24)).toLocaleString('en-US', { minimumIntegerDigits: 2 });
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toLocaleString('en-US', { minimumIntegerDigits: 2 });
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toLocaleString('en-US', { minimumIntegerDigits: 2 });
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000).toLocaleString('en-US', { minimumIntegerDigits: 2 });
                    label = `${days}d:${hours}h:${minutes}m:${seconds}s`;
                }
                const txtWidth = textWidth(label);
                textSize(24);
                fill("rgb(255, 255, 255)");
                rect(
                    scrollbar.x + scrollbar.width - txtWidth - 10,
                    scrollbar.y - 30,
                    txtWidth + 10,
                    30,
                );
                fill("rgb(0, 0, 0)");
                text(label, scrollbar.x + scrollbar.width - txtWidth - 5, scrollbar.y - 5);
            }

            /* Scrollbar Segments */
            fill("rgb(0, 0, 0)");
            stroke("rgb(25, 25, 25)");
            for (let idx = 0; idx < scrollbar.getSize(); idx++) {
                let pos = scrollbar.getPositionOfIndex(idx);
                renderSegment(idx, scrollbar.y, pos, scrollbar.getLineGap());
            }

            /* Scrollbar Annotations */
            scrollbar.annotations.forEach(annotation => {
                noFill();
                stroke(annotation.colour);
                if (this.imodel.highlightedAnnotation?.id === annotation.id) {
                    strokeWeight(3);
                }
                let pos = scrollbar.getPositionOfIndex(annotation.index);
                line(pos, scrollbar.y, pos, scrollbar.y + scrollbar.height);
                /* Video outlines from annotation events */
                if (scrollbar.index - 2 < annotation.index && scrollbar.index + 2 > annotation.index) {
                    strokeWeight(3);
                    rect(left - 1, top - 1, right - left + 1, bottom - top + 1);
                }
                strokeWeight(1);
            });

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

    if (this.model.unpadded) return;

    /* Display grid lines */
    if (this.model.gridActive) {
        const padding = this.model.displayPadding;
        stroke("rgb(0, 0, 0)");
        for (let row = 0; row <= this.model.rows; row++) {
            line(padding, row * this.model.cellHeight + padding, this.model.cellWidth * this.model.columns + padding, row * this.model.cellHeight + padding);
        }
        for (let column = 0; column <= this.model.columns; column++) {
            line(column * this.model.cellWidth + padding, padding, column * this.model.cellWidth + padding, this.model.cellHeight * this.model.rows + padding);
        }
    }

    /* Dragging ghost */
    let ghost = this.imodel.ghost;
    if (ghost instanceof Display || ghost instanceof Overlay) {
        let ghostX = mouseX - (ghost.width + ghost.padding * 2) / 2;
        let ghostY = mouseY - (ghost.height + ghost.padding * 2 + ghost.scrollbarHeight) / 2;
        renderDisplaySkeleton(ghost, false, 0.5, ghostX, ghostY);
    }

    /* Global Scrollbar */
    let scrollbar = this.model.globalScrollbar;
    if (scrollbar instanceof Scrollbar) {
        let trianglePos = scrollbar.getMainPosition();
        if (this.imodel.highlightedScrollbars.includes(scrollbar)) stroke("rgb(255, 204, 0)");
        else stroke("rgb(0, 0, 0)");
        if (this.imodel.focused === scrollbar && this.imodel.measuredTime === null) {
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

        /* Global Scrollbar measured time */
        if (this.imodel.measuredTime !== null && this.imodel.focused === scrollbar) {
            const measuredStart = Math.min(this.imodel.measuredTime.start, this.imodel.measuredTime.end);
            const measuredEnd = Math.max(this.imodel.measuredTime.start, this.imodel.measuredTime.end);
            const measuredStartPos = scrollbar.getPositionOfIndex(measuredStart);
            const measuredEndPos = scrollbar.getPositionOfIndex(measuredEnd);
            fill("rgb(34, 200, 34)");
            rect(
                measuredStartPos,
                scrollbar.y,
                measuredEndPos - measuredStartPos,
                scrollbar.height,
            );
            const frames = measuredEnd - measuredStart;
            const seconds = (frames / 30).toFixed(3);
            const label = `${seconds}s`;
            const txtWidth = textWidth(label);
            textSize(24);
            fill("rgb(255, 255, 255)");
            rect(
                scrollbar.x + scrollbar.width - txtWidth - 10,
                scrollbar.y - 30,
                txtWidth + 10,
                30,
            );
            fill("rgb(0, 0, 0)");
            text(label, scrollbar.x + scrollbar.width - txtWidth - 5, scrollbar.y - 5);
        }

        /* Scrollbar Annotations */
        scrollbar.annotations.forEach(annotation => {
            noFill();
            stroke(annotation.colour);
            if (this.imodel.highlightedAnnotation?.id === annotation.id) {
                strokeWeight(3);
            }
            let pos = scrollbar.getPositionOfIndex(annotation.index);
            line(pos, scrollbar.y, pos, scrollbar.y + scrollbar.height);
            strokeWeight(1);
        });

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

    /* Shadow marking mode specific draw events */
    if (this.model.mode === "shadowMarking") {
        stroke("rgb(255, 204, 0)");
        strokeWeight(5);
        noFill();
        rect(0, 0, this.model.canvasWidth, this.model.canvasHeight);
        const containterLength = 128;
        const containerX = scrollbar.x + 10;
        const containerY = scrollbar.y - containterLength - 5;
        const infographicLength = 100;
        const infographicX = containerX + containterLength / 2;
        const infographicY = containerY + containterLength / 2;
        fill("rgb(255, 255, 255)");
        stroke("rgb(0, 0, 0)");
        strokeWeight(5);
        square(containerX, containerY, containterLength, 10);
        noFill();
        stroke("rgb(190, 190, 190)");
        strokeWeight(3);
        square(containerX, containerY, containterLength, 10);
        stroke("rgb(0, 0, 0)");
        switch (imodel.shadowMarkerShape) {
            case "crosshair":
                line (infographicX, infographicY - infographicLength / 2, infographicX, infographicY + infographicLength / 2);
                line (infographicX + infographicLength / 2, infographicY, infographicX - infographicLength / 2, infographicY);
                stroke("rgb(255, 255, 255)");
                strokeWeight(1);
                line (infographicX, infographicY - infographicLength / 2, infographicX, infographicY + infographicLength / 2);
                line (infographicX + infographicLength / 2, infographicY, infographicX - infographicLength / 2, infographicY);
                break;
            case "cross":
                line (infographicX - infographicLength / 2, infographicY - infographicLength / 2, infographicX + infographicLength / 2, infographicY + infographicLength / 2);
                line (infographicX + infographicLength / 2, infographicY - infographicLength / 2, infographicX - infographicLength / 2, infographicY + infographicLength / 2);
                stroke("rgb(255, 255, 255)");
                strokeWeight(1);
                line (infographicX - infographicLength / 2, infographicY - infographicLength / 2, infographicX + infographicLength / 2, infographicY + infographicLength / 2);
                line (infographicX + infographicLength / 2, infographicY - infographicLength / 2, infographicX - infographicLength / 2, infographicY + infographicLength / 2);
                break;
            case "dot":
                ellipse(infographicX, infographicY, infographicLength, infographicLength);
                stroke("rgb(255, 255, 255)");
                strokeWeight(1);
                ellipse(infographicX, infographicY, infographicLength, infographicLength);
                break;
            case "square":
                square(infographicX - infographicLength / 2, infographicY - infographicLength / 2, infographicLength);
                stroke("rgb(255, 255, 255)");
                strokeWeight(1);
                square(infographicX - infographicLength / 2, infographicY - infographicLength / 2, infographicLength);
                break;
            case "triangle":
                triangle(infographicX - infographicLength / 2, infographicY + infographicLength / 2, infographicX, infographicY - infographicLength / 2, infographicX + infographicLength / 2, infographicY + infographicLength / 2);
                stroke("rgb(255, 255, 255)");
                strokeWeight(1);
                triangle(infographicX - infographicLength / 2, infographicY + infographicLength / 2, infographicX, infographicY - infographicLength / 2, infographicX + infographicLength / 2, infographicY + infographicLength / 2);
                break;
            case "freeform":
                stroke("rgb(255, 0, 0)");
                beginShape();
                curveVertex(containerX, containerY);
                curveVertex(containerX + 20, containerY + 20);
                curveVertex(containerX + containterLength / 2 + 20, containerY + containterLength / 2 - 20);
                curveVertex(containerX + containterLength / 2 - 20, containerY + containterLength / 2 + 20);
                curveVertex(containerX + containterLength - 20, containerY + containterLength - 20);
                curveVertex(containerX + containterLength, containerY + containterLength);
                endShape();
        }
    }

    /* Coincident pointing mode specific draw events */
    if (this.model.mode === "coincidentPointing") {
        stroke("rgb(32, 78, 207)");
        strokeWeight(5);
        noFill();
        rect(0, 0, this.model.canvasWidth, this.model.canvasHeight);
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