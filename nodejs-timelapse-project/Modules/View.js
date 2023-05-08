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
        noStroke();
        fill("rgb(190, 190, 190)");
        rect(
            display.x,
            display.y,
            display.width + display.padding * 2,
            display.height + display.padding * 2 + display.scrollbarHeight,
            10  /* Border radius */
        );

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
        fill("rgb(34, 154, 34)");
        rect(
            display.x + display.padding,
            display.y + display.padding + display.height,
            display.width,
            display.scrollbarHeight
        );

        fill(0);
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