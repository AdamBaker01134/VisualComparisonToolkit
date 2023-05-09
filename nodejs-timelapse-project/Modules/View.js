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
            display.images[display.index],
            display.x + display.padding,
            display.y + display.padding,
            display.width,
            display.height
        );

        /* Scrollbar */
        let lineGap = display.width / display.images.length;
        let trianglePos = lineGap * (0.5 + display.index);
        if (display.locked) {
            fill("rgb(128, 128, 128)");
        } else {
            fill("rgb(34, 154, 34)");
        }
        rect(
            display.x + display.padding,
            display.y + display.padding + display.height,
            display.width,
            display.scrollbarHeight
        );

        /* Scrollbar Segments */
        fill(0);
        stroke(25);
        for (let idx = 0; idx < display.images.length; idx++) {
            let pos = display.x + display.padding + (lineGap * idx) + (lineGap * 0.1) + (lineGap / 2) - 0.5;
            let top = display.y + display.padding + display.height;
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

        /* Scrollbar main position arrow */
        triangle(
            trianglePos + display.x + display.padding,
            display.y + display.padding + display.height + 5,
            trianglePos + display.x + display.padding - 5,
            display.y + display.padding + display.height + display.scrollbarHeight - 0.5,
            trianglePos + display.x + display.padding + 5,
            display.y + display.padding + display.height + display.scrollbarHeight - 0.5
        );
    });
}

View.prototype.modelChanged = function () {
    this.draw();
}