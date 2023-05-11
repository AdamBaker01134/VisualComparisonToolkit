/* Application Canvas View */
function View () {

}

View.prototype.setModel = function (model) {
    this.model = model;
}

View.prototype.setInteractionModel = function (iModel) {
    this.iModel = iModel;
}

View.prototype.draw = function () {
    clear();

    this.model.displays.forEach(display => {
        if (display === imodel.selection) {
            stroke("rgb(52, 219, 85)");
            strokeWeight(2);
        } else {
            noStroke();
        }
        fill("rgb(190, 190, 190)");
        rect(
            display.x,
            display.y,
            display.width + display.padding * 2,
            display.height + display.padding * 2 + display.scrollbarHeight,
            10  /* Border radius */
        );

        noStroke();
        strokeWeight(1);
        image(
            display.images[Math.floor(display.index)], /* Floor index in case index has been affected by ratio */
            display.x + display.padding,
            display.y + display.padding,
            display.width,
            display.height
        );

        /* Scrollbar */
        let lineGap = display.getLineGap();
        let scrollbarLeft = display.getScrollbarLeft();
        let scrollbarTop = display.getScrollbarTop();
        let trianglePos = display.getPosition();
        let startPos = display.getStartPosition();
        let endPos = display.getEndPosition();
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
            let pos = scrollbarLeft + (lineGap * idx) + (lineGap * 0.1) + (lineGap / 2) - 0.5;
            renderLine(idx, scrollbarTop, pos);
        }

        /* Scrollbar start position arrow */
        fill("rgb(255, 255, 255)");
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
        let lineGap = scrollbar.getLineGap();
        let scrollbarLeft = scrollbar.getScrollbarLeft();
        let scrollbarTop = scrollbar.getScrollbarTop();
        let trianglePos = scrollbar.getPosition();
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
        stroke(25);
        for (let idx = 0; idx < scrollbar.getSize(); idx++) {
            let top = scrollbarTop;
            let pos = scrollbarLeft + (lineGap * idx) + (lineGap * 0.1) + (lineGap / 2) - 0.5;
            renderLine(idx, top, pos);
        }

        /* Global Scrollbar main position arrow */
        triangle(
            trianglePos,
            scrollbarTop + 5,
            trianglePos - 5,
            scrollbarTop + scrollbar.height - 0.5,
            trianglePos + 5,
            scrollbarTop + scrollbar.height - 0.5
        )
    }
}

/**
 * Draw a line (size depends on index)
 * @param {number} idx index of the line
 * @param {number} top y coordinate of the top of the object being draw on
 * @param {number} pos x coordinate of the line
 */
function renderLine (idx, top, pos) {
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

View.prototype.modelChanged = function () {
    this.draw();
}